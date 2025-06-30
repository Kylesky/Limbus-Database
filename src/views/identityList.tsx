import { ReactElement, Dispatch, SetStateAction } from "react";
import { identities, identity } from "items/identity"
import { sinners } from "items/sinners"
import { SkillIcons } from "components/skill";
import css from "./identityList.module.css";

type IdentityRowProps = {
    identity: identity,
    setIdFunction: Dispatch<SetStateAction<string>>
}

function IdentityRow({identity, setIdFunction}: IdentityRowProps) {
    let cells: ReactElement[] = [];
    cells.push(<td><img className={css.portrait} src={process.env.PUBLIC_URL + "/assets/ids/" + identity.id + ".png"} alt={identity.name} /></td>);
    cells.push(<td className={css.name} onClick={() => setIdFunction(identity.id)}>[{identity.name}]<br/>{sinners[identity.sinner].name}</td>);
    cells.push(<td><img className={css.rarity} src={process.env.PUBLIC_URL + "/assets/icons/" + identity.rarity + ".png"} alt={identity.rarity} /></td>);
    cells.push(<td><SkillIcons skill={identity.skills.find(skill => skill.label == "Skill 1")} typesOnly={true}/></td>)
    cells.push(<td><SkillIcons skill={identity.skills.find(skill => skill.label == "Skill 2")} typesOnly={true}/></td>)
    cells.push(<td><SkillIcons skill={identity.skills.find(skill => skill.label == "Skill 3")} typesOnly={true}/></td>)
    cells.push(<td><SkillIcons skill={identity.skills.find(skill => skill.label == "Defense")} typesOnly={true}/></td>)
    return <tr className={css.identityRow}>{cells}</tr>
}

type IdentityListProps = {
    setIdFunction: Dispatch<SetStateAction<string>>
}

function IdentityList({setIdFunction}: IdentityListProps) {
    return (
        <div className={css.wrapper}>
            <table className={css.identitiesTable}>
                <thead className={css.tableHead}>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Rarity</th>
                        <th>Skill 1</th>
                        <th>Skill 2</th>
                        <th>Skill 3</th>
                        <th>Defense</th>
                    </tr>
                </thead>
                <tbody className={css.tableBody}>
                    {Object.entries(identities).map(([_id, identity]) => {return <IdentityRow identity={identity} setIdFunction={setIdFunction}/>;})}
                </tbody>
            </table>
        </div>
    );
}

export default IdentityList;
