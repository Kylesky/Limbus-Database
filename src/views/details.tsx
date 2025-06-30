import { evaluateIdentityTags, identity } from "items/identity";
import { Skill } from "components/skill";
import { Passive } from "components/passive";
import css from "./details.module.css";

type detailsProps = {
    item: identity
}

function prepareTags(tags: string[]){
    let textPieces = [];
    for (let i=0; i < tags.length; i++) {
        if(i > 0) {
            textPieces.push(<span className="tag-separator">, </span>);
        }
        textPieces.push(<span className="tag">{tags[i]}</span>);
    }
    return textPieces;

}


function Details({item}: detailsProps) {
    let skills = item.skills.map(skill => {return <Skill skill={skill}/>})
    let passives = item.passives.map(passive => {return <Passive passive={passive} passiveType="Combat Passive"/>})
    let supportPassives = item.supportPassives.map(passive => {return <Passive passive={passive} passiveType="Support Passive"/>})
    let officialTags = prepareTags(item.ingameTags);
    let automatedTags = prepareTags(evaluateIdentityTags(item));
    return <div className={css.details}>
        <div className={css.skills}>
            {skills}
            {passives}
            {supportPassives}
        </div>
        <div className={css.tags}>
            <div className={css.tagsList}><span>Official Tags: </span>{officialTags}</div>
            <div className={css.tagsList}><span>Automated Tags: </span>{automatedTags}</div>
        </div>
    </div>
}

export { Details };