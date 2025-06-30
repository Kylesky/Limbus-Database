import { evaluateSkillTags, skill } from "components/skill";
import { evaluatePassiveTags, passive } from "components/passive";
import { flowChartData } from "views/flowchart/idFlowchart";
import identitiesData from "data/identities.json";

const identities: {[key: string]: identity} = identitiesData;

type identity = {
    "id": string,
    "sinner": string,
    "name": string,
    "rarity": string,
    "release": string,
    "season": string,
    "releaseSeason": string,
    "hp": string,
    "speed": number[],
    "defenseLevel": number,
    "staggerThresholds": number[],
    "slashResist": number,
    "pierceResist": number,
    "bluntResist": number,
    "ingameTags": string[],
    "skills": skill[],
    "passives": passive[],
    "supportPassives": passive[],
    "flowChart"?: flowChartData,
}

function getIdPortraitPath(identity: identity) {
    return process.env.PUBLIC_URL + "/assets/ids/" + identity.id + ".png"
}

function evaluateIdentityTags(identity: identity): string[] {
    let tags = new Set<string>();
    identity.skills.forEach(skill => {
        evaluateSkillTags(skill).forEach(tag => {tags.add(tag);});
    });
    identity.passives.forEach(passive => {
        evaluatePassiveTags(passive).forEach(tag => {tags.add(tag);});
    });
    identity.supportPassives.forEach(passive => {
        evaluatePassiveTags(passive).forEach(tag => {tags.add(tag);});
    });

    return Array.from(tags);
}

export { identities, getIdPortraitPath, evaluateIdentityTags }
export type { identity }