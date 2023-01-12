{{{ if (eventName != "") }}}
<div class="widget-eventparticipation">
    <a class="eventName h3" href="{relative_path}/post/{pid}">{eventName}</a>

    <div data-pid="{pid}" class="plugin-calendar-event">
        <!-- IMPORT partials/calendar/event/responses.tpl -->
    </div>

    <div  class="positiveResponseCountByGroup">
        {{{ each positiveResponseCountByGroup }}}
        <div>
            <a href="{relative_path}/groups/{../slug}"><span class="label group-label inline-block" style="background-color: {../labelColor};">{../userTitle}</span></a>
            <span class="responseCount">{../responseCount}</span>
        </div>
        {{{ if !@last }}}
        <div>
            vs.
        </div>
        {{{ end }}}
        {{{ end }}}
    </div>
</div>
{{{ end }}}
