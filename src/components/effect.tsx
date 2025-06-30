import { replaceVariablesAsElements, replaceVariablesAsString } from "../utils";
import { Condition, condition } from "./condition";
import { summaryBlob, getSummaryMappingId, insertIntoSummaryBlob } from "./summaryBlob";
import css from "./effect.module.css";

import effectsData from "data/effects.json";
import { ReactElement } from "react";

const effects: { [key: string]: effectTemplate } = effectsData;

type effectTemplate = {
    "id": string,
    "desc": string,
    "text": string,
    "vars"?: { [key: string]: { "type": string, [key: string]: any } },
    "tags"?: string[],
    "summaryEffects"?: string[],
    "isCond"?: boolean
};

type effect = {
    "id": string,
    "vars"?: { [key: string]: any },
    "cond"?: condition,
    "mod"?: string
};

function getEffectTemplate(effect: effect): effectTemplate | null {
    let template = effects[effect.id];
    if (!template) {
        console.warn(`Effect template for ${effect.id} not found.`);
        return null;
    }
    return template;
}

type EffectProps = {
    effect: effect
}

function evaluateEffect(effect: effect, withCondition: boolean = false) {
    let template = getEffectTemplate(effect);
    if (!template) {
        return <span className="error">Unknown effect: {effect.id}</span>;
    }

    let text = template.text;
    if (!withCondition) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
    }

    if ("vars" in template && template.vars !== undefined) {
        return <span>{replaceVariablesAsElements(text, template.vars, effect.vars ? effect.vars : {})}</span>
    } else {
        return <span>{text}</span>;
    }
}

function Effect({effect}: EffectProps) {
    let parts: ReactElement[] = [];
    if ("cond" in effect && effect.cond !== undefined) {
        parts.push(<Condition condition={effect.cond}/>);
        parts.push(<span>&nbsp;</span>);
        parts.push(evaluateEffect(effect, true));
    } else {
        parts.push(evaluateEffect(effect));
    }
    if (effect.mod) {
        parts.push(<span>&nbsp;</span>);
        parts.push(<span>{effect.mod}</span>);
    }
    return <span className={css.effect}>{parts}</span>;
}

function evaluateEffectTags(effect: effect): string[] {
    let template = getEffectTemplate(effect);
    if(template && "tags" in template && template.tags){
        // Typescript is unable to see the type checks from within the anonymous function
        // if("vars" in template && template.vars !== undefined && "vars" in effect && effect.vars !== undefined){
        //     return template.tags.map(tag => {return replaceVariablesAsString(tag, template.vars, effect.vars);});
        // } else {
        //     return template.tags;
        // }
        return template.tags.map(tag => {
            if(template && "vars" in template && template.vars !== undefined && "vars"){
                return replaceVariablesAsString(tag, template.vars, effect.vars ? effect.vars : {});
            } else {
                return tag;
            }
        });
    }
    return [];
}

function evaluateEffectStatusIds(effect: effect): string[] {
    let template = getEffectTemplate(effect);
    if(template && "vars" in template && template.vars){
        let statusIds = new Set<string>();
        Object.entries(template.vars).forEach(([k, v]) => {
            if(v.type === "status") {
                if("fixed" in v) {
                    statusIds.add(v.fixed.id);
                } else {
                    if(effect.vars && k in effect.vars) {
                        statusIds.add(effect.vars[k].id);
                    }
                }
            }
        });
        return Array.from(statusIds);
    }
    return [];
}

function getEffectSummary(effect: effect, withConditionals: boolean = false, withPassives: boolean = false): { [key: string]: summaryBlob } {
    let template = getEffectTemplate(effect);
    if(!template || !template.summaryEffects) return {};

    if(!withConditionals && (effect.cond || template.isCond)) return {};

    let result: { [key: string]: summaryBlob } = {};
    template.summaryEffects.forEach(item => {
        if(template && template.vars) item = replaceVariablesAsString(item, template.vars, effect.vars ?? {}, true);
        let tokens = item.split(" ");
        let id = getSummaryMappingId(tokens);
        if( id in result ) {
            result[id] = insertIntoSummaryBlob(tokens, result[id]);
        } else {
            result[id] = insertIntoSummaryBlob(tokens);
        }
    });

    return result;
}

export { Effect, evaluateEffectTags, evaluateEffectStatusIds, getEffectSummary };
export type { effect };