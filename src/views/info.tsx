import { identity, getIdPortraitPath } from "items/identity";
import { sinners } from "items/sinners";
import css from "./info.module.css";

type infoProps = {
    item: identity
}

const LEVEL="55";

function computeHp(formula: string) {
    let tokens = formula.split("+");
    let base = Number(tokens[0]);
    tokens = tokens[1].substring(1, tokens[1].length-1).split("*");
    return Math.floor(base + (Number(tokens[0]) * Number(LEVEL)));
}

function Info({item}: infoProps) {
    let hp = computeHp(item.hp);
    return <div className={css.info}>
        <img className={css.portrait} src={getIdPortraitPath(item)} alt={item.name} />
        <div className={css.infoRow}>
            <span className={css.sinner}>{sinners[item.sinner].name}</span>
            <span className={css.name}>{item.name}<img src={process.env.PUBLIC_URL + "/assets/icons/" + item.rarity + ".png"} alt={item.rarity} /></span>
        </div>
        <div className={css.infoRow}>
            <span className={css.infoCell}>Release Date:<br/>{item.release}</span>
            <span className={css.infoCell}>Release Season: {item.releaseSeason}</span>
            <span className={css.infoCell}>Dispense Season: {item.season}</span>
        </div>
        <div className={css.infoRow}>
            <span className={css.infoCell}><img src={process.env.PUBLIC_URL + "/assets/icons/hp.png"} alt={"hp"} />{hp}</span>
            <span className={css.infoCell}><img src={process.env.PUBLIC_URL + "/assets/icons/speed.png"} alt={"speed"} />{item.speed[0]}-{item.speed[1]}</span>
            <span className={css.infoCell}><img src={process.env.PUBLIC_URL + "/assets/icons/defense level.png"} alt={"defense level"} />{item.defenseLevel}</span>
        </div>
        <div className={css.infoRow}>
            <span className={css.staggerThresholds}>Stagger Thresholds</span>
            <span className={css.infoRow} style={{"width": "66.67%"}}>
                {
                    item.staggerThresholds.map(threshold => {
                        return <span className={css.infoCell}>{Math.floor(hp*threshold)}</span>
                    })
                }
            </span>
        </div>
        <div className={css.infoRow}>
            <span className={css.infoCell}><img src={process.env.PUBLIC_URL + "/assets/icons/skill types/Slash.png"} alt={"slash"} />x{item.slashResist}</span>
            <span className={css.infoCell}><img src={process.env.PUBLIC_URL + "/assets/icons/skill types/Pierce.png"} alt={"pierce"} />x{item.pierceResist}</span>
            <span className={css.infoCell}><img src={process.env.PUBLIC_URL + "/assets/icons/skill types/Blunt.png"} alt={"blunt"} />x{item.bluntResist}</span>
        </div>
    </div>
}

export { Info };