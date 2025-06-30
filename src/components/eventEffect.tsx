import { Event, evaluateEventTags, event, eventIsConditional, eventIsReuse } from "./event";
import { Effect, evaluateEffectTags, evaluateEffectStatusIds, getEffectSummary, effect } from "./effect";
import css from "./eventEffect.module.css";
import { summaryBlob, addSummaryBlobs } from "./summaryBlob";


type eventEffect = {
    "event"?: event,
    "effects"?: effect[],
    "subeffects"?: eventEffect[]
};

type eventEffectProps = {
    eventEffect: eventEffect,
    isSubEffect?: boolean
}

function evaluateEventEffectStatusIds(eventEffect: eventEffect): string[] {
    let statusIds: string[] = [];
    if (eventEffect.effects) eventEffect.effects.forEach(effect => {evaluateEffectStatusIds(effect).forEach(id => {statusIds.push(id);})});
    if (eventEffect.subeffects) eventEffect.subeffects.forEach(ee => {evaluateEventEffectStatusIds(ee).forEach(id => {statusIds.push(id);})});
    return Array.from(new Set<string>(statusIds));
}

function EventEffect({eventEffect, isSubEffect = false}: eventEffectProps) {
    let textPieces = [];
    if(isSubEffect) {
        textPieces.push(<span>- </span>);
    }
    if ("event" in eventEffect && eventEffect.event !== undefined) {
        textPieces.push(<Event event={eventEffect.event}/>);
    }
    if ("effects" in eventEffect && eventEffect.effects !== undefined) {
        for (let i=0; i < eventEffect.effects.length; i++) {
            if(i > 0) {
                textPieces.push(<span className="effect-separator">; </span>);
            }
            textPieces.push(<Effect effect={eventEffect.effects[i]}/>);
        }
    }
    return <div className={css.topEventEffect}>
        <div className={css.eventEffect}>{textPieces}</div>
        {eventEffect.subeffects ? eventEffect.subeffects.map(subeffect => {return <EventEffect eventEffect={subeffect} isSubEffect={true}/>}) : null}
    </div>
}

function evaluateEventEffectTags(eventEffect: eventEffect) {
    let tags = new Set<string>();
    if("event" in eventEffect && eventEffect.event){
        evaluateEventTags(eventEffect.event).forEach(tag => {tags.add(tag);});
    }
    if("effects" in eventEffect && eventEffect.effects){
        eventEffect.effects.forEach(effect => {
            evaluateEffectTags(effect).forEach(tag => {tags.add(tag);})}
        );
    }

    return Array.from(tags);
}

function getEventEffectSummary(eventEffect: eventEffect, withConditionals: boolean = false, withPassives: boolean = false, parentEventEffect: eventEffect | null = null, reuse: boolean = false): { [key: string]: summaryBlob } {
    if(!withConditionals && eventEffect.event && eventIsConditional(eventEffect.event)) {
        return {}
    }

    if(eventEffect.event && eventIsReuse(eventEffect.event) && !reuse){
        return {}
    }

    let result: { [key: string]: summaryBlob } = {};
    if(eventEffect.effects) {
        eventEffect.effects.forEach(effect => {
            let effectSummary = getEffectSummary(effect, withConditionals);
            let keys = new Set([...Object.keys(result), ...Object.keys(effectSummary)]);
            keys.forEach(key => {
                if(key in result && key in effectSummary) {
                    result[key] = addSummaryBlobs(result[key], effectSummary[key]);
                } else if (key in effectSummary) {
                    result[key] = effectSummary[key];
                }
            });
        });
    }

    if(eventEffect.subeffects) {
        eventEffect.subeffects.forEach(ee => {
            let eeSummary = getEventEffectSummary(ee, withConditionals, withPassives);
            let keys = new Set([...Object.keys(result), ...Object.keys(eeSummary)]);
            keys.forEach(key => {
                if(key == "retrigger"){
                    Object.keys(result).forEach(resultKey => {
                        result[resultKey] = addSummaryBlobs(result[resultKey], eeSummary[key]);
                    });
                } else {
                    if(key in result && key in eeSummary) {
                        result[key] = addSummaryBlobs(result[key], eeSummary[key]);
                    } else if (key in eeSummary) {
                        result[key] = eeSummary[key];
                    }
                }
            });
        });
    }

    return result;
}

export { EventEffect, evaluateEventEffectTags, evaluateEventEffectStatusIds , getEventEffectSummary };
export type { eventEffect };