'use strict';

const library = module.exports;
const calendarEvent = require.main.require('nodebb-plugin-calendar/build/lib/event.js');
const calendarResponses = require.main.require('nodebb-plugin-calendar/build/lib/responses.js');
const groups = require.main.require('./src/groups');
const webserver = require.main.require('./src/webserver');

library.renderParticipationWidget = async function (widget) {
	const daysDelta = 15 * 24 * 60 * 60 * 1000;
	const { displayedGroups = [], relevantCategoryId = 0 } = widget.data;

	const todayStart = new Date();
	const [eventsByDate, groupMembers] = await Promise.all([
		calendarEvent.getEventsByDate(+todayStart, +todayStart + daysDelta),
		groups.getGroupsAndMembers(displayedGroups),
	]);
	const {
		pid = 0,
		name: eventName = '',
	} = eventsByDate.find(({ cid }) => cid === +relevantCategoryId) ?? {};

	let positiveResponseCountByGroup;
	if (pid && eventName) {
		const currentResponses = await calendarResponses.getAll({
			pid,
			selection: ['yes', 'maybe'],
		});

		const yesUids = currentResponses.yes.map(response => response.uid);
		const maybeUids = currentResponses.maybe.map(response => response.uid);
		const positiveResponseUids = [...yesUids, ...maybeUids];
		const getPositiveResponseCount = groupName => groupMembers
			.find(group => group.name === groupName)
			.members
			.filter(({ uid }) => positiveResponseUids.includes(uid)).length;


		positiveResponseCountByGroup = displayedGroups.map((groupName, i) => {
			const {
				userTitle,
				slug,
				labelColor,
			} = groupMembers[i];
			const responseCount = getPositiveResponseCount(groupName);

			return {
				groupName,
				responseCount,
				userTitle,
				slug,
				labelColor,
			};
		});
	}

	widget.html = await widget.req.app.renderAsync('widgets/eventparticipation', {
		pid,
		eventName,
		positiveResponseCountByGroup,
	});

	return widget;
};

library.defineWidgets = async function (widgets) {
	const groupsData = await groups.getGroups('groups:visible:createtime', 0, -1);
	const html = await webserver.app.renderAsync('admin/partials/widgets/eventparticipation', { groups: groupsData });
	widgets.push({
		widget: 'eventparticipation',
		name: 'Participation Counter',
		description: 'ARF and SWORD Numbers with easy Register button',
		content: html,
	});

	return widgets;
};

library.defineWidgetAreas = async function (areas) {
		const locations = ['header', 'sidebar', 'footer'];
		const templates = [
				'categories.tpl', 'category.tpl', 'topic.tpl', 'users.tpl',
				'unread.tpl', 'recent.tpl', 'popular.tpl', 'top.tpl', 'tags.tpl', 'tag.tpl',
				'login.tpl', 'register.tpl',
		];
		function capitalizeFirst(str) {
				return str.charAt(0).toUpperCase() + str.slice(1);
		}

		templates.forEach((template) => {
				locations.forEach((location) => {
						areas.push({
								name: `${capitalizeFirst(template.split('.')[0])} ${capitalizeFirst(location)}`,
								template: template,
								location: location,
						});
				});
		});

		areas = areas.concat([
				{
						name: 'Account Header',
						template: 'account/profile.tpl',
						location: 'header',
				},
		]);
		return areas;
};

