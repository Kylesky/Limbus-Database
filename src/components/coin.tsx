import { EventEffect, eventEffect } from "./eventEffect";
import { toRoman } from "../utils";
import css from "./coin.module.css";

const COIN_ICON_PATH = process.env.PUBLIC_URL + "/assets/icons/Coin Outline.png";

type CoinProps = {
    coinEffects: eventEffect[],
    number: number
}

function Coin({coinEffects, number}: CoinProps) {
    if(coinEffects.length == 0){
        return null;
    }
    
    let texts = coinEffects.map(ee => {return <EventEffect eventEffect={ee}/>});
    return <div className={css.coin}>
        <div className={css.coinIconContainer}>
            <img src={COIN_ICON_PATH} alt="Coin" className={css.coinIcon} />
            <div className={css.coinNumber}> {toRoman(number)} </div>
        </div>
        <div className={css.coinEffects}>
            {texts}
        </div>
    </div>;
}

export { Coin };