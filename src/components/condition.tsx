import { replaceVariablesAsElements } from "../utils";

import conditionsData from "data/conditions.json";

const conditions: { [key: string]: conditionTemplate } = conditionsData;

type conditionTemplate = {
    "id": string,
    "desc": string,
    "text": string,
    "vars"?: { [key: string]: { "type": string, [key: string]: any } },
    "tags"?: string[],
    "summaryEffects"?: string[]
};

type condition = {
    "id": string,   
    "vars"?: { [key: string]: any },
};

function getConditionTemplate(condition: condition): conditionTemplate | null {
    let template = conditions[condition.id];
    if (!template) {
        console.warn(`Condition template for ${condition.id} not found.`);
        return null;
    }
    return template;
}

type ConditionProps = {
    condition: condition
}

function Condition({condition}: ConditionProps) {
    let template = getConditionTemplate(condition);
    if (!template) {
        return <span className="error">Unknown condition: {condition.id}</span>;
    }

    if ("vars" in template && template.vars !== undefined) {
        return <span>{replaceVariablesAsElements(template.text, template.vars, condition.vars ? condition.vars : {})}</span>
    } else {
        return <span>{template.text}</span>;
    }
}

export { Condition };
export type { condition };