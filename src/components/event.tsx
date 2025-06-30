import eventsData from "data/events.json";

const events: { [key: string]: eventTemplate } = eventsData;

type eventTemplate = {
    "id": string,
    "text": string,
    "color"?: string,
    "tags"?: string[],
    "conditional": boolean,
    "reuse"?: boolean
};

type event = {
    "id": string,
};

function getEventTemplate(event: event): eventTemplate | null {
    let template = events[event.id];
    if (!template) {
        console.warn(`Event template for ${event.id} not found.`);
        return null;
    }
    return template;
}

type EventProps = {
    event: event
}

function Event({event}: EventProps){
    let template = getEventTemplate(event);
    if (template && template.color) {
        return <span className="event" style={{ color: template.color }}>{template.text} </span>;
    } else {
        return <span className="event">{template ? template.text : "[Unknown Event]"} </span>;
    }
}

function evaluateEventTags(event: event): string[] {
    let template = getEventTemplate(event);
    if(template && "tags" in template && template.tags){
        return template.tags;
    }
    return [];
}

function eventIsConditional(event: event): boolean {
    let template = getEventTemplate(event);
    return template ? template.conditional : false;
}

function eventIsReuse(event: event): boolean {
    let template = getEventTemplate(event);
    return template ? (template.reuse ?? false) : false;
}

export { Event, evaluateEventTags, eventIsConditional, eventIsReuse };
export type { event };