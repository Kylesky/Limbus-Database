import { ReactElement, useState, Dispatch, SetStateAction } from "react";
import { identities, getIdPortraitPath } from "items/identity";
import { sinners } from "items/sinners";
import { getSkillSummary } from "components/skill";
import { getPassiveSummary } from "components/passive";
import { Status, getStatusParentFromId } from "components/status";
import { addSummaryBlobs, SummaryBlob, summaryBlob } from "components/summaryBlob";
import css from "./teamBuilding.module.css";
import Select from "react-select";
import { ids } from "webpack";

type SinnerPanelProps = {
    sinner: number,
    selectedIds: string[],
    setSelectedIds: Dispatch<SetStateAction<any[]>>
    deploymentOrder: number[],
    setDeploymentOrder: Dispatch<SetStateAction<any[]>>
}

function SinnerPanel({ sinner, selectedIds, setSelectedIds, deploymentOrder, setDeploymentOrder }: SinnerPanelProps) {
    let idOptions = sinners[sinner + ""].ids.map(id => { return { "value": id, "label": identities[id].name } });

    const handleChange = (value: any, action: any) => {
        let newIds: string[] = [...selectedIds];
        if (value) newIds[sinner - 1] = value.value;
        else newIds[sinner - 1] = "";

        setSelectedIds(newIds);
        if (deploymentOrder.includes(sinner)) setDeploymentOrder(deploymentOrder.filter(x => { return x != sinner; }));
    }

    const handleDeploy = () => {
        if (deploymentOrder.includes(sinner)) setDeploymentOrder(deploymentOrder.filter(x => { return x != sinner; }));
        else setDeploymentOrder([...deploymentOrder, sinner]);
    }

    return <div className={css.sinnerPanel}>
        <Select options={idOptions} className={css.dropdown} isClearable={true} onChange={handleChange}></Select>
        {selectedIds[sinner - 1] ? <img src={getIdPortraitPath(identities[selectedIds[sinner - 1]])} className={deploymentOrder.includes(sinner) ? css.deployedPortrait : css.portrait} onClick={handleDeploy}></img> : null}

    </div>
}

type IdSelectionProps = {
    selectedIds: string[],
    setSelectedIds: Dispatch<SetStateAction<any[]>>,
    deploymentOrder: number[],
    setDeploymentOrder: Dispatch<SetStateAction<any[]>>
}

function IdSelection({ selectedIds, setSelectedIds, deploymentOrder, setDeploymentOrder }: IdSelectionProps) {
    let panels = [];
    for (let i = 1; i <= 12; i++) {
        panels.push(<SinnerPanel sinner={i} selectedIds={selectedIds} setSelectedIds={setSelectedIds} deploymentOrder={deploymentOrder} setDeploymentOrder={setDeploymentOrder} />);
    }
    return <div className={css.idSelection}>{panels}</div>;
}

function getIdSummary(id: string, withConditionals: boolean, withPassives: boolean, isAllSkill3: boolean) {
    let identity = identities[id];
    let passiveSummaries = withPassives ? [...identity.passives.map(passive => { return getPassiveSummary(passive); })] : [];

    let skillSummaries = identity.skills.map(skill => {
        if (withPassives) {
            return getSkillSummary(skill, withConditionals, passiveSummaries);
        } else {
            return getSkillSummary(skill, withConditionals);
        }
    });

    let statusSet = new Set<string>();
    // let hpHealing = false;
    // let spHealing = false;
    // let offenseLevel = false;
    // let defenseLevel = false;
    // let lifesteal = false;
    skillSummaries.forEach(skill => {
        Object.keys(skill.status).forEach(key => {
            if (!isNaN(Number(key))) { statusSet.add(key); }
            // if (key == "hp") hpHealing = true;
            // if (key == "lifesteal") lifesteal = true;
            // if (key == "sp") spHealing = true;
            // if (key == "offenseLevel") offenseLevel = true;
            // if (key == "defenseLevel") defenseLevel = true;
        });
    });

    let clashSum = 0;
    let damageSum = 0;
    let statusSum: { [key: string]: summaryBlob } = {};
    let count = 0;
    let replacements: { [key: string]: number } = {};
    for (let i = 0; i < identity.skills.length; i++) {
        if ("skillReplace" in skillSummaries[i].status) {
            replacements[skillSummaries[i].status["skillReplace"].label ?? ""] = identity.skills[i].count ?? 0;
        } else {
            let n = (identity.skills[i].count ?? 0) + (identity.skills[i].label in replacements ? replacements[identity.skills[i].label] : 0);
            if(isAllSkill3 && !identity.skills[i].label.includes("Skill 3")) n = 0;
            clashSum += skillSummaries[i].clash * n;
            damageSum += skillSummaries[i].damage * n;
            Object.keys(skillSummaries[i].status).forEach(status => {
                if (n && status in skillSummaries[i].status) {
                    if (status in statusSum) {
                        statusSum[status] = addSummaryBlobs(statusSum[status], skillSummaries[i].status[status], n);
                    } else {
                        statusSum[status] = addSummaryBlobs({}, skillSummaries[i].status[status], n);
                    }
                }
            })
            count += n;
        }
    }

    Object.entries(statusSum).forEach(([status, blob]) => {
        if (blob.potency) blob.potency /= count;
        if (blob.count) blob.count /= count;
        if (blob.value) blob.value /= count;
        if (blob.selfPotency) blob.selfPotency /= count;
        if (blob.selfCount) blob.selfCount /= count;
        statusSum[status] = blob;
    })

    return {
        id: id,
        clash: clashSum / count,
        damage: damageSum / count,
        status: statusSum
    }
}

type TeamSummaryTableProps = {
    selectedIds: string[],
    deploymentOrder: number[],
    isConditionalsOn: boolean,
    isPassivesOn: boolean,
    isAllSkill3: boolean,
    deploymentSlots: number
}

function TeamSummaryTable({ selectedIds, deploymentOrder, isConditionalsOn, isPassivesOn, isAllSkill3, deploymentSlots }: TeamSummaryTableProps) {
    let idSummaries = deploymentOrder.map(sinner => { return getIdSummary(selectedIds[sinner - 1], isConditionalsOn, isPassivesOn, isAllSkill3); });

    let headerRow: ReactElement[] = [<th />];
    let clashRow: ReactElement[] = [<td>Clash</td>];
    let clashSum = 0;
    let damageRow: ReactElement[] = [<td>Damage</td>];
    let damageSum = 0;

    let statusSet = new Set<string>();
    idSummaries.forEach(({ status: status }) => {
        Object.keys(status).forEach(key => {
            if (!isNaN(Number(key))) { statusSet.add(key); }
        });
    });
    let statusList = Array.from(statusSet).sort(function (a, b) {
        // return Number(a) - Number(b);
        let aparent = getStatusParentFromId(a);
        let bparent = getStatusParentFromId(b);
        if (aparent && bparent) {
            if (aparent == bparent) return Number(a) - Number(b);
            else return Number(aparent) - Number(bparent);
        } else {
            return Number(aparent ?? a) - Number(bparent ?? b);
        }
    });
    let statusRows: { [key: string]: ReactElement[] } = {};
    let statusSum: { [key: string]: summaryBlob } = {};
    statusList.forEach(key => {
        statusRows[key] = [<td><Status status={{ "id": key }} includeText={false} /></td>];
        statusSum[key] = {};
    });

    for (let i = 0; i < idSummaries.length; i++) {
        let moveCount = Math.floor(deploymentSlots / idSummaries.length) + (i < deploymentSlots % idSummaries.length ? 1 : 0);
        headerRow.push(<th><img src={getIdPortraitPath(identities[idSummaries[i].id])} className={css.summaryPortrait} /> x{moveCount}</th>);
        clashSum += idSummaries[i].clash * moveCount;
        clashRow.push(<td>{idSummaries[i].clash.toFixed(2)}</td>);
        damageSum += idSummaries[i].damage * moveCount;
        damageRow.push(<td>{idSummaries[i].damage.toFixed(2)}</td>);
        Object.entries(statusRows).forEach(([key, row]) => {
            if (key in idSummaries[i].status) {
                statusRows[key].push(<td><SummaryBlob summaryBlob={idSummaries[i].status[key]} /></td>);
                statusSum[key] = addSummaryBlobs(statusSum[key], idSummaries[i].status[key], moveCount);
            } else {
                statusRows[key].push(<td />);
            }
        });
    }

    headerRow.push(<th>Avg Clash<br />Total Values:</th>);
    clashRow.push(<td>{(clashSum / deploymentSlots).toFixed(2)}</td>);
    damageRow.push(<td>{damageSum.toFixed(2)}</td>);
    Object.entries(statusRows).forEach(([key, row]) => { row.push(<td><SummaryBlob summaryBlob={statusSum[key]} /></td>); });

    return <table className={css.summaryTable}>
        <thead>
            <tr>{headerRow}</tr>
        </thead>
        <tbody>
            <tr>{clashRow}</tr>
            <tr>{damageRow}</tr>
            {statusList.map(status => { return <tr>{statusRows[status]}</tr> })}
        </tbody>
    </table>
}

type TeamSummaryProps = {
    selectedIds: string[],
    deploymentOrder: number[]
}


function TeamSummary({ selectedIds, deploymentOrder }: TeamSummaryProps) {
    const [isConditionalsOn, setIsConditionalsOn] = useState(false);
    const toggleIsConditionalsOn = () => {
        setIsConditionalsOn(!isConditionalsOn);
    }

    const [isPassivesOn, setIsPassivesOn] = useState(false);
    const toggleIsPassivesOn = () => {
        setIsPassivesOn(!isPassivesOn);
    }

    const [isAllSkill3, setIsAllSkill3] = useState(false);
    const toggleIsAllSkill3 = () => {
        setIsAllSkill3(!isAllSkill3);
    }

    const [deploymentSlots, setDeploymentSlots] = useState(6);
    const handleChange = (event: any) => {
        setDeploymentSlots(Number(event.target.value));
    }

    return <div className={css.summary}>
        <div className={css.summaryOptions}>
            <label className="conditionals-toggle">
                <input type="checkbox" checked={isConditionalsOn} onChange={toggleIsConditionalsOn} />
                <span className="slider round">with conditionals</span>
            </label>
            <label className="passives-toggle">
                <input type="checkbox" checked={isPassivesOn} onChange={toggleIsPassivesOn} />
                <span className="slider round">with passives</span>
            </label>
            <label className="skill3-toggle">
                <input type="checkbox" checked={isAllSkill3} onChange={toggleIsAllSkill3} />
                <span className="slider round">Skill 3s only</span>
            </label>
            <label className="slots-counter">
                <input type="number" value={deploymentSlots} onChange={handleChange} min="0" step="1" />
                <span> deployment slots</span>
            </label>
        </div>
        <TeamSummaryTable selectedIds={selectedIds} deploymentOrder={deploymentOrder} isConditionalsOn={isConditionalsOn} isPassivesOn={isPassivesOn} isAllSkill3={isAllSkill3} deploymentSlots={deploymentSlots} />
    </div>
}

function TeamBuilding() {
    const [selectedIds, setSelectedIds] = useState<string[]>(new Array(12).fill(""));
    const [deploymentOrder, setDeploymentOrder] = useState<number[]>([]);

    return <div className={css.teamBuilding}>
        <IdSelection selectedIds={selectedIds} setSelectedIds={setSelectedIds} deploymentOrder={deploymentOrder} setDeploymentOrder={setDeploymentOrder} />
        <TeamSummary selectedIds={selectedIds} deploymentOrder={deploymentOrder} />
    </div>
}

export default TeamBuilding;