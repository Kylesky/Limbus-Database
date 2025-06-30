import { ReactElement, useState } from "react";
import { identity } from "items/identity";
import { skill, SkillIcons, getSkillSummary, skillSummary } from "components/skill";
import { passive, PassiveIcons, getPassiveSummary, passiveSummary } from "components/passive";
import { Status, getStatusParentFromId } from "components/status";
import { SummaryBlob, AverageSummaryBlob, addSummaryBlobs } from "components/summaryBlob";
import css from "./summary.module.css";

type itemsAsProps = {
    skills: skill[],
    skillSummaries?: skillSummary[],
    passives: passive[],
    support: passive[],
    withConditionals?: boolean,
    withPassives?: boolean
}

function HeaderRow({ skills, skillSummaries, passives, support }: itemsAsProps) {
    if(!skillSummaries) return null;
    let cells: ReactElement[] = [<th></th>];

    let replacements: {[key: string]: number} = {};
    for (let i=0; i<skills.length; i++){
        let count;
        if ("skillReplace" in skillSummaries[i].status) {
            replacements[skillSummaries[i].status["skillReplace"].label ?? ""] = skills[i].count ?? 0;
            count = 0;
        } else {
            count = (skills[i].count ?? 0) + (skills[i].label in replacements ? replacements[skills[i].label] : 0);
        }
        cells.push(<th>{skills[i].label}<br />x{count}</th>)
    }
    cells.push(<th>Avg</th>);
    passives.forEach(() => { cells.push(<th>Passive</th>) });
    support.forEach(() => { cells.push(<th>Support<br />Passive</th>) });

    return <tr>{cells}</tr>
}

function TypesRow({ skills, passives, support }: itemsAsProps) {
    let cells: ReactElement[] = [<td>Keywords</td>];

    skills.forEach(skill => { cells.push(<td><SkillIcons skill={skill} /></td>); });
    cells.push(<td />);
    passives.forEach(passive => { cells.push(<td><PassiveIcons passive={passive} /></td>); });
    support.forEach(passive => { cells.push(<td><PassiveIcons passive={passive} /></td>); });

    return <tr>{cells}</tr>;
}

type summaries = {
    status?: string,
    skills?: skill[],
    skillSummaries: skillSummary[],
    passiveSummaries: passiveSummary[]
}

function ClashRow({ skills, skillSummaries, passiveSummaries }: summaries) {
    if (!skills) return null;
    let cells: ReactElement[] = [<td>Max Clash</td>];

    let sum = 0;
    let count = 0;
    let replacements: {[key: string]: number} = {};
    for (let i = 0; i < skills.length; i++) {
        if ("skillReplace" in skillSummaries[i].status) {
            replacements[skillSummaries[i].status["skillReplace"].label ?? ""] = skills[i].count ?? 0;
        } else {
            let n = (skills[i].count ?? 0) + (skills[i].label in replacements ? replacements[skills[i].label] : 0);
            sum += skillSummaries[i].clash * n;
            count += n;
        }
        cells.push(<td>{skillSummaries[i].clash}</td>);
    }
    cells.push(<td>{(count === 0 ? 0 : sum / count).toFixed(2)}</td>);
    passiveSummaries.forEach(passive => { cells.push(<td></td>); });

    return <tr>{cells}</tr>;
}

function DamageRow({ skills, skillSummaries, passiveSummaries }: summaries) {
    if (!skills) return null;
    let cells: ReactElement[] = [<td>Max Damage Est</td>];

    let sum = 0;
    let count = 0;
    let replacements: {[key: string]: number} = {};
    for (let i = 0; i < skills.length; i++) {
        if ("skillReplace" in skillSummaries[i].status) {
            replacements[skillSummaries[i].status["skillReplace"].label ?? ""] = skills[i].count ?? 0;
        } else {
            let n = (skills[i].count ?? 0) + (skills[i].label in replacements ? replacements[skills[i].label] : 0);
            sum += skillSummaries[i].damage * n;
            count += n;
        }
        cells.push(<td>{skillSummaries[i].damage.toFixed(2)}</td>);
    }
    cells.push(<td>{(count === 0 ? 0 : sum / count).toFixed(2)}</td>);
    passiveSummaries.forEach(passive => { cells.push(<td></td>); });

    return <tr>{cells}</tr>;
}

function OffenseLevelRow({skillSummaries, passiveSummaries}: summaries) {
    let cells: ReactElement[] = [<td>Bonus Offense Level</td>];
    skillSummaries.forEach(skill => {
        if("offenseLevel" in skill.status) cells.push(<td><SummaryBlob summaryBlob={skill.status["offenseLevel"]}/></td>);
        else cells.push(<td />);
    })
    cells.push(<td />);
    passiveSummaries.forEach(passive => {cells.push(<td />);});

    return <tr>{cells}</tr>;
}

function DefenseLevelRow({skillSummaries, passiveSummaries}: summaries) {
    let cells: ReactElement[] = [<td>Bonus Defense Level</td>];
    skillSummaries.forEach(skill => {
        if("defenseLevel" in skill.status) cells.push(<td><SummaryBlob summaryBlob={skill.status["defenseLevel"]}/></td>);
        else cells.push(<td />);
    })
    cells.push(<td />);
    passiveSummaries.forEach(passive => {cells.push(<td />);});

    return <tr>{cells}</tr>;
}

function HpRow({skillSummaries, passiveSummaries}: summaries) {
    let cells: ReactElement[] = [<td>HP Healing</td>];
    skillSummaries.forEach(skill => {
        if("hp" in skill.status) cells.push(<td><SummaryBlob summaryBlob={skill.status["hp"]}/></td>);
        else cells.push(<td />);
    })
    cells.push(<td />);
    passiveSummaries.forEach(passive => {
        if("hp" in passive.status) cells.push(<td><SummaryBlob summaryBlob={passive.status["hp"]}/></td>);
        else cells.push(<td />);
    })

    return <tr>{cells}</tr>;
}

function LifestealRow({skillSummaries, passiveSummaries}: summaries) {
    let cells: ReactElement[] = [<td>HP Healing<br/>from Damage Dealt</td>];
    skillSummaries.forEach(skill => {
        if("lifesteal" in skill.status) cells.push(<td><SummaryBlob summaryBlob={skill.status["lifesteal"]}/></td>);
        else cells.push(<td />);
    })
    cells.push(<td />);
    passiveSummaries.forEach(passive => {
        if("lifesteal" in passive.status) cells.push(<td><SummaryBlob summaryBlob={passive.status["lifesteal"]}/></td>);
        else cells.push(<td />);
    })

    return <tr>{cells}</tr>;
}

function SpRow({skillSummaries, passiveSummaries}: summaries) {
    let cells: ReactElement[] = [<td>SP Healing</td>];
    skillSummaries.forEach(skill => {
        if("sp" in skill.status) cells.push(<td><SummaryBlob summaryBlob={skill.status["sp"]}/></td>);
        else cells.push(<td />);
    })
    cells.push(<td />);
    passiveSummaries.forEach(passive => {
        if("sp" in passive.status) cells.push(<td><SummaryBlob summaryBlob={passive.status["sp"]}/></td>);
        else cells.push(<td />);
    })

    return <tr>{cells}</tr>;
}

function StatusRow({ status, skills, skillSummaries, passiveSummaries }: summaries) {
    if (!status || !skills) return null;
    let cells: ReactElement[] = [<td><Status status={{ "id": status }} includeText={false} /></td>];

    let sumBlob = {};
    let count = 0;
    let replacements: {[key: string]: number} = {};
    for (let i = 0; i < skills.length; i++) {
        if ("skillReplace" in skillSummaries[i].status) {
            replacements[skillSummaries[i].status["skillReplace"].label ?? ""] = skills[i].count ?? 0;
        } else {
            let n = (skills[i].count ?? 0) + (skills[i].label in replacements ? replacements[skills[i].label] : 0);
            if (n && status in skillSummaries[i].status) {
                sumBlob = addSummaryBlobs(sumBlob, skillSummaries[i].status[status], n);
            }
            count += n;
        }
        if (status in skillSummaries[i].status) {
            cells.push(<td><SummaryBlob summaryBlob={skillSummaries[i].status[status]} /></td>);
        } else {
            cells.push(<td />);
        }
    }
    cells.push(<td><AverageSummaryBlob summaryBlob={sumBlob} count={count} /></td>);
    passiveSummaries.forEach(passive => {
        {
            if (status in passive.status) {
                cells.push(<td><SummaryBlob summaryBlob={passive.status[status]} /></td>);
            } else {
                cells.push(<td />);
            }
        }
    });

    return <tr>{cells}</tr>;
}

function SummaryTable({ skills, passives, support, withConditionals = false, withPassives = false }: itemsAsProps) {
    let passiveSummaries = [
        ...passives.map(passive => { return getPassiveSummary(passive); })
    ];

    let supportSummaries = [
        ...support.map(passive => { return getPassiveSummary(passive); })
    ]

    let skillSummaries = [
        ...skills.map(skill => {
            if (withPassives) {
                return getSkillSummary(skill, withConditionals, passiveSummaries);
            } else {
                return getSkillSummary(skill, withConditionals);
            }
        })
    ];

    passiveSummaries = [...passiveSummaries, ...supportSummaries];

    let statusSet = new Set<string>();
    let hpHealing = false;
    let spHealing = false;
    let offenseLevel = false;
    let defenseLevel = false;
    let lifesteal = false;
    skillSummaries.forEach(skill => {
        Object.keys(skill.status).forEach(key => {
            if (!isNaN(Number(key))) { statusSet.add(key); }
            if (key == "hp") hpHealing = true;
            if (key == "lifesteal") lifesteal = true;
            if (key == "sp") spHealing = true;
            if (key == "offenseLevel") offenseLevel = true;
            if (key == "defenseLevel") defenseLevel = true;
        });
    });
    passiveSummaries.forEach(passive => {
        Object.keys(passive.status).forEach(key => {
            if (!isNaN(Number(key))) { statusSet.add(key); }
            if (key == "hp") hpHealing = true;
            if (key == "lifesteal") lifesteal = true;
            if (key == "sp") spHealing = true;
            if (key == "offenseLevel") offenseLevel = true;
            if (key == "defenseLevel") defenseLevel = true;
        });
    });
    let statusList = Array.from(statusSet).sort(function (a, b) {
        // return Number(a) - Number(b);
        let aparent = getStatusParentFromId(a);
        let bparent = getStatusParentFromId(b);
        if(aparent && bparent) {
            if(aparent == bparent) return Number(a) - Number(b);
            else return Number(aparent) - Number(bparent);
        } else {
            return Number(aparent ?? a) - Number(bparent ?? b);
        }
    });

    return <table className={css.summaryTable}>
        <thead>
            <HeaderRow skills={skills} skillSummaries={skillSummaries} passives={passives} support={support} />
        </thead>
        <tbody>
            <TypesRow skills={skills} passives={passives} support={support} />
            <ClashRow skills={skills} skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} />
            <DamageRow skills={skills} skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} />
            {offenseLevel ? <OffenseLevelRow skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} /> : null}
            {defenseLevel ? <DefenseLevelRow skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} /> : null}
            {hpHealing ? <HpRow skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} /> : null}
            {lifesteal ? <LifestealRow skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} /> : null}
            {spHealing ? <SpRow skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} /> : null}
            {statusList.map(status => { return <StatusRow status={status} skills={skills} skillSummaries={skillSummaries} passiveSummaries={passiveSummaries} /> })}
        </tbody>
    </table>
}

type SummaryProps = {
    item: identity
}

function Summary({ item }: SummaryProps) {
    const [isConditionalsOn, setIsConditionalsOn] = useState(false);
    const toggleIsConditionalsOn = () => {
        setIsConditionalsOn(!isConditionalsOn);
    }

    const [isPassivesOn, setIsPassivesOn] = useState(false);
    const toggleIsPassivesOn = () => {
        setIsPassivesOn(!isPassivesOn);
    }

    return <div className={css.summary}>
        <div>
            <label className="conditionals-toggle">
                <input type="checkbox" checked={isConditionalsOn} onChange={toggleIsConditionalsOn} />
                <span className="slider round">with conditionals</span>
            </label>
            <label className="passives-toggle">
                <input type="checkbox" checked={isPassivesOn} onChange={toggleIsPassivesOn} />
                <span className="slider round">with passives</span>
            </label>
        </div>
        <SummaryTable skills={item.skills} passives={item.passives} support={item.supportPassives} withConditionals={isConditionalsOn} withPassives={isPassivesOn} />
    </div>
}

export { Summary };