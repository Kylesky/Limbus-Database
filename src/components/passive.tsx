import { Effect, evaluateEffectTags, evaluateEffectStatusIds, effect, getEffectSummary } from "./effect";
import { getIconSource } from "utils";
import { Status } from "./status";
import { summaryBlob, addSummaryBlobs } from "./summaryBlob";
import css from "./passive.module.css";

type passive = {
    "name": string,
    "costType"?: string,
    "costSins"?: {"num": number, "sin": string}[],
    "effects": effect[]
}

type PassiveCostProps = {
    passive: passive;
}

function PassiveIcons({passive}: PassiveCostProps) {
    let icons: React.ReactElement[] = [];
    if(passive.costType && passive.costSins) {
        icons = passive.costSins.map(costSin => {return <img src={getIconSource("sin", costSin["sin"])} className={css.passiveCostIconSummary} />});
    }

    let statusIds: string[] = [];
    passive.effects.forEach(effect => {evaluateEffectStatusIds(effect).forEach(item => {statusIds.push(item);})});
    statusIds = Array.from(new Set<string>(statusIds));
    statusIds.forEach(id => {icons.push(<Status status={{"id": id}} includeText={false}/>);});

    return <div className={css.passiveCostContainer}>
            <div>{icons}</div>
        </div>;
}

function PassiveCost({passive}: PassiveCostProps) {
    if(passive.costType && passive.costSins) {
        let costs = passive.costSins.map(costSin => {return [<img src={getIconSource("sin", costSin["sin"])} className={css.passiveCostIcon} />, <span> x{costSin["num"]}</span>]});
        return <div className={css.passiveCostContainer}> {costs} <span style={{"paddingLeft": "0.2em"}}>{passive.costType.toUpperCase()}</span></div>
    } else {
        return null
    }
}

type PassiveProps = {
    passive: passive;
    passiveType: string;
}

function Passive({passive, passiveType}: PassiveProps) {
    return (
        <div className={css.passive}>
            <div className={css.passiveHeader}>
                <div><span className={css.passiveName}>{passive.name}</span></div>
                <PassiveCost passive={passive}/>
            </div>
            <div className={css.passiveLabel}>{passiveType}</div>
            <div className={css.passiveEffects}>
                {passive.effects.map(effect => {return (<Effect effect={effect} />);})}
            </div>
        </div>
    );
}

function evaluatePassiveTags(passive: passive): string[] {
    let tags = new Set<string>();
    passive.effects.forEach(effect => {
        evaluateEffectTags(effect).forEach(tag => {tags.add(tag);});
    })

    return Array.from(tags);
}

type passiveSummary = {
    "status": { [key: string]: summaryBlob }
}

function getPassiveSummary(passive: passive): passiveSummary {
    let status: { [key: string]: summaryBlob } = {};
    passive.effects.forEach(effect => {
        let effectSummary = getEffectSummary(effect, true);
        let keys = new Set([...Object.keys(status), ...Object.keys(effectSummary)]);
        Array.from(keys).forEach(key => {
            if (key in status && key in effectSummary) {
                status[key] = addSummaryBlobs(status[key], effectSummary[key]);
            } else if (key in effectSummary) {
                status[key] = effectSummary[key];
            }
        });
    });

    return {"status": status}
}

export { Passive, PassiveIcons, evaluatePassiveTags, getPassiveSummary };
export type { passive, passiveSummary };