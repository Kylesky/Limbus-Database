import sinnersData from "data/sinners.json";

const sinners: {[key: string]: sinner} = sinnersData;

type sinner = {
    "id": string,
    "name": string,
    "ids": string[],
    "egos": string[]
}

export { sinners }
export type { sinner }