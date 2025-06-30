import { Tooltip } from "react-tooltip";
import css from "./status.module.css";

import statusesData from "data/statuses.json";

const statuses: { [key: string]: statusTemplate } = statusesData;

type statusTemplate = {
    "id": string,
    "img": string,
    "name": string,
    "desc": string,
    "type": string,
    "withCount"?: boolean,
    "parent"?: string,
};

type status = {
    "id": string,
};

function getStatusTemplateFromId(id: string): statusTemplate | null {
    let template = statuses[id];
    if (!template) {
        console.warn(`Status template for ${id} not found.`);
        return null;
    }
    return template;
}

function getStatusTemplate(status: status): statusTemplate | null {
    return getStatusTemplateFromId(status.id);
}

function getStatusWithCount(status: status): boolean {
    let template = statuses[status.id];
    if (!template) return false;
    return template.withCount ? template.withCount : false;
}

type StatusProps = {
    status: status;
    includeText?: boolean;
}

function statusTypeClass(type: string) {
    switch (type) {
        case "buff":
            return css.statusTextBuff;
        case "debuff":
            return css.statusTextDebuff;
        case "neutral":
            return css.statusTextNeutral;
        default:
            return css.statusText;
    }
}

function Status({ status, includeText=true }: StatusProps) {
    let template = getStatusTemplate(status);
    if (!template) {
        return <span className="error">Unknown status: {status.id}</span>;
    }
    return (
        <span>
            <a data-tooltip-id={status.id} className={css.status}>
                <img src={process.env.PUBLIC_URL + template.img} alt={template.name} />
                {includeText ? <span className={statusTypeClass(template.type)}>{template.name}</span> : null}
            </a>
            <Tooltip id={status.id} className={css.statusTooltip}>
                <div className={css.statusHeader}>
                    <img src={process.env.PUBLIC_URL + template.img} alt={template.name} />
                    <span>{template.name}</span>
                </div>
                <div className={css.statusDesc}>
                    <span>{template.desc}</span>
                </div>
            </Tooltip>
        </span>
    )
}

function getStatusName(status: status) {
    let template = getStatusTemplate(status);
    if (!template) {
        return "";
    }
    return template.name;
}

function getStatusParentFromId(id: string) {
    let template = getStatusTemplateFromId(id);
    if (!template || !("parent" in template)) {
        return null;
    }
    return template.parent
}

export { Status, getStatusName, getStatusWithCount, getStatusParentFromId };