import { EventEffect, evaluateEventEffectTags, evaluateEventEffectStatusIds, getEventEffectSummary, eventEffect } from "./eventEffect";
import { Coin } from "./coin";
import { Status } from "./status";
import { summaryBlob, addSummaryBlobs } from "./summaryBlob";
import { passiveSummary } from "./passive";
import { getIconSource, getSinColor, addPlusIfNonnegative } from "utils";
import css from "./skill.module.css";

const COIN_ICON_PATH = process.env.PUBLIC_URL + "/assets/icons/coin.png";
const OFFENSE_LEVEL_ICON_PATH = process.env.PUBLIC_URL + "/assets/icons/offense level.png";
const DEFENSE_LEVEL_ICON_PATH = process.env.PUBLIC_URL + "/assets/icons/defense level.png";

type skill = {
    "label": string,
    "count"?: number,
    "name": string,
    "damageType"?: string,
    "defendType"?: string,
    "sinAffinity"?: string,
    "basePower": number,
    "coinPower": number,
    "numCoins": number,
    "offenseLevel"?: number,
    "defenseLevel"?: number,
    "atkWeight": number,
    "skillEffects"?: eventEffect[],
    "coinEffects"?: eventEffect[][],
    [key: string]: any;
}

type SkillProps = {
    skill: skill | undefined;
    typesOnly?: boolean
}

function SkillIcons({ skill, typesOnly = false }: SkillProps) {
    if(!skill) return null;
    let icons = [];
    if (skill.damageType) icons.push(<img src={getIconSource("damageType", skill.damageType)} alt={skill.damageType} className={css.skillTypeIcon} />);
    if (skill.defendType) icons.push(<img src={getIconSource("defendType", skill.defendType)} alt={skill.defendType} className={css.skillTypeIcon} />);
    if (skill.sinAffinity) icons.push(<img src={getIconSource("sin", skill.sinAffinity)} alt={skill.sinAffinity} className={css.skillTypeIcon} />);
    if (typesOnly) return <div>{icons}</div>;
    let statusIds: string[] = [];
    if (skill.skillEffects) skill.skillEffects.forEach(ee => { evaluateEventEffectStatusIds(ee).forEach(item => { statusIds.push(item); }) });
    if (skill.coinEffects) skill.coinEffects.forEach(coin => { coin.forEach(ee => { evaluateEventEffectStatusIds(ee).forEach(item => { statusIds.push(item); }) }) })
    statusIds = Array.from(new Set<string>(statusIds));
    statusIds.forEach(id => { icons.push(<Status status={{ "id": id }} includeText={false} />); });

    return <div>
        <div>{icons}</div>
        {Array.from({ length: skill.numCoins }, (_, i) => <img src={COIN_ICON_PATH} key={i} className={css.skillDetailsIcon} alt="" />)}
    </div>;
}

function Skill({ skill }: SkillProps) {
    if(!skill) return null;
    return (
        <div className={css.skill} style={{ borderColor: getSinColor(skill.sinAffinity) }}>
            <div className={css.skillHeader}>
                <span className={css.skillTypeIconsContainer}>
                    {skill.damageType ? <img src={getIconSource("damageType", skill.damageType)} alt={skill.damageType} className={css.skillTypeIcon} /> : null}
                    {skill.defendType ? <img src={getIconSource("defendType", skill.defendType)} alt={skill.defendType} className={css.skillTypeIcon} /> : null}
                    {skill.sinAffinity ? <img src={getIconSource("sin", skill.sinAffinity)} alt={skill.sinAffinity} className={css.skillTypeIcon} /> : null}
                </span>
                <span className={css.skillName} style={{ backgroundColor: getSinColor(skill.sinAffinity) }}>{skill.name}</span>
            </div>
            <div className={css.skillLabel}>{skill.label}</div>
            <div className={css.skillDetailsContainer}>
                <span className={css.skillPower}>
                    Power: {skill.basePower} {addPlusIfNonnegative(skill.coinPower)}
                </span>
                {Array.from({ length: skill.numCoins }, (_, i) => <img src={COIN_ICON_PATH} key={i} className={css.skillDetailsIcon} alt=""/>)}
                {skill.offenseLevel !== undefined ? [<img src={OFFENSE_LEVEL_ICON_PATH} alt="Offense Level" className={css.skillDetailsIcon} />, <span>{addPlusIfNonnegative(skill.offenseLevel)}</span>] : null}
                {skill.defenseLevel !== undefined ? [<img src={DEFENSE_LEVEL_ICON_PATH} alt="Defense Level" className={css.skillDetailsIcon} />, <span>{addPlusIfNonnegative(skill.defenseLevel)}</span>] : null}
                <span className={css.skillAtkWeight}>
                    &nbsp;Atk Weight: {skill.atkWeight}
                </span>
            </div>
            <div className={css.skillEffects}>
                {skill.skillEffects ? skill.skillEffects.map(ee => { return (<EventEffect eventEffect={ee} />); }) : null}
            </div>
            <div className={css.skillCoins}>
                {skill.coinEffects ? skill.coinEffects.map((coin, index) => { return (<Coin coinEffects={coin} number={index + 1} />); }) : null}
            </div>
        </div>
    );
}

function evaluateSkillTags(skill: skill): string[] {
    let tags = new Set<string>();
    if ("skillEffects" in skill && skill.skillEffects) {
        skill.skillEffects.forEach(ee => {
            evaluateEventEffectTags(ee).forEach(tag => { tags.add(tag); });
        });
    }
    if ("coinEffects" in skill && skill.coinEffects) {
        skill.coinEffects.forEach(coinEffectList => {
            coinEffectList.forEach(ee => {
                evaluateEventEffectTags(ee).forEach(tag => { tags.add(tag); });
            });
        });
    }

    return Array.from(tags);
}

type skillSummary = {
    "clash": number,
    "damage": number,
    "status": { [key: string]: summaryBlob }
}

function getSkillSummary(skill: skill, withConditionals: boolean = false, passiveSummaries: passiveSummary[] = []): skillSummary {
    let status: { [key: string]: summaryBlob } = {};
    if (skill.skillEffects) {
        skill.skillEffects.forEach(ee => {
            let effectSummary = getEventEffectSummary(ee, withConditionals);
            let keys = new Set([...Object.keys(status), ...Object.keys(effectSummary)]);
            keys.forEach(key => {
                if (key in status && key in effectSummary) {
                    status[key] = addSummaryBlobs(status[key], effectSummary[key]);
                } else if (key in effectSummary) {
                    status[key] = {...effectSummary[key]};
                }
            });
        });
    }

    let powerBonus = "power" in status ? status["power"].value ?? 0 : 0;
    let coinPowerBonus = "coinPower" in status ? status["coinPower"].value ?? 0 : 0;
    let clashPowerBonus = "clashPower" in status ? status["clashPower"].value ?? 0 : 0;
    let damageBonus = "damage" in status ? status["damage"].valuePercent ?? 0 : 0;
    let passiveBonuses: {[key: string]: summaryBlob} = {};
    let passiveBonusesAlways: {[key: string]: summaryBlob} = {};
    passiveSummaries.forEach(summary => {
        Object.keys(summary.status).forEach(key => {
            switch(key){
                case "power": 
                    powerBonus += summary.status["power"].value ?? 0; 
                    break;
                case "coinPower": 
                    coinPowerBonus += summary.status["coinPower"].value ?? 0; 
                    break;
                case "clashPower":
                    clashPowerBonus += summary.status["clashPower"].value ?? 0;
                    break;
                case "damage":
                    damageBonus += summary.status["damage"].valuePercent ?? 0;
                    break;
                default:
                    if(!isNaN(Number(key)) && summary.status[key].isBonus){
                        if(summary.status[key].always) {
                            if(key in passiveBonusesAlways){
                                passiveBonusesAlways[key] = addSummaryBlobs(passiveBonuses[key], summary.status[key]);
                            } else {
                                passiveBonusesAlways[key] = {...summary.status[key]};
                            }
                        } else {
                            if(key in passiveBonuses){
                                passiveBonuses[key] = addSummaryBlobs(passiveBonuses[key], summary.status[key]);
                            } else {
                                passiveBonuses[key] = {...summary.status[key]};
                            }
                        }
                    }
                    break;
            }
        });
    });

    let clash: number = skill.basePower + powerBonus + clashPowerBonus + ((skill.coinPower + coinPowerBonus) > 0 ? (skill.coinPower + coinPowerBonus) * skill.numCoins : 0);
    let damage: number = 0;
    let power = skill.basePower + powerBonus;
    let reuse = -1;

    const processCoinEffects = (ee: eventEffect, coinSummary: { [key: string]: summaryBlob }) => {
        let eeSummary = getEventEffectSummary(ee, withConditionals, false, null, reuse >= 0);
        let keys = new Set([...Object.keys(coinSummary), ...Object.keys(eeSummary)]);
        keys.forEach(key => {
            if (key in eeSummary && key in passiveBonuses) {
                eeSummary[key] = addSummaryBlobs(eeSummary[key], passiveBonuses[key]);
            }
            if (key in coinSummary && key in eeSummary) {
                coinSummary[key] = addSummaryBlobs(coinSummary[key], eeSummary[key]);
            } else if (key in eeSummary) {
                coinSummary[key] = {...eeSummary[key]};
            }
        });
    };

    for (let i = 0; i < skill.numCoins; i++) {
        let coinSummary: { [key: string]: summaryBlob } = {};
        if (skill.coinEffects) {
            skill.coinEffects[i].forEach(ee => processCoinEffects(ee, coinSummary));
        }
        Object.keys(passiveBonusesAlways).forEach(key => {
            if (key in coinSummary) {
                coinSummary[key] = addSummaryBlobs(coinSummary[key], passiveBonusesAlways[key]);
            } else {
                coinSummary[key] = {...passiveBonusesAlways[key]};
            }
        })

        if (skill.coinPower + coinPowerBonus > 0) power += skill.coinPower + coinPowerBonus;
        if ("damage" in coinSummary) {
            let coinDamage = power;
            if (coinSummary["damage"].value) coinDamage += coinSummary["damage"].value;
            if (coinSummary["damage"].valuePercent) coinDamage *= 1 + (coinSummary["damage"].valuePercent / 100 + damageBonus / 100);
            damage += coinDamage;
            delete coinSummary["damage"];
        } else {
            damage += power * (1 + damageBonus / 100);
        }

        if("reuseCoin" in coinSummary && reuse === -1) {
            reuse = coinSummary["reuseCoin"].value ?? -1;
            delete coinSummary["reuseCoin"];
        }
        if(reuse === 0) reuse = -1;

        if(reuse !== -1) {
            i -= 1;
            reuse -= 1;
        }

        if("coinPower-nextCoin" in coinSummary) {
            power += 2;
            delete coinSummary["coinPower-nextCoin"];
        }

        let keys = new Set([...Object.keys(status), ...Object.keys(coinSummary)]);
        keys.forEach(key => {
            if (key in status && key in coinSummary) {
                status[key] = addSummaryBlobs(status[key], coinSummary[key]);
            } else if (key in coinSummary) {
                status[key] = {...coinSummary[key]};
            }
        });
    }

    if (skill.defendType && (skill.defendType === "guard" || skill.defendType === "evade")) {
        damage = 0;
    }

    return {
        "clash": clash,
        "damage": damage,
        "status": status
    }
}

export { Skill, SkillIcons, evaluateSkillTags, getSkillSummary };
export type { skill, skillSummary };