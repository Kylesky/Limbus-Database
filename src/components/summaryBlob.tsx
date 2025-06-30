import { getStatusWithCount } from "./status";

type summaryBlob = {
    potency?: number;
    count?: number;
    selfPotency?: number;
    selfCount?: number;
    trigger?: boolean;
    isBonus?: boolean;
    value?: number;
    targets?: number;
    valuePercent?: number;
    fixed?: string[];
    withCount?: boolean;
    retrigger?: number;
    label?: string;
    always?: boolean;
};

function getSummaryMappingId(tokens: string[]): string {
    switch (tokens[0]) {
        case "status": case "statusMultiple": case "statusTrigger": case "statusBonus":
            return tokens[1];
        case "hp": case "sp": case "power": case "speed": case "lifesteal":
        case "clashPower": case "skillReplace": case "damage": case "atkweight": case "offenseLevel": case "defenseLevel": case "reuseCoin":
            return tokens[0];
        case "coinPower": 
            if(tokens.length > 2 && tokens.includes("nextCoin")){
                return tokens[0]+"-nextCoin";
            }
            return tokens[0];
        case "statusRetrigger":
            return "retrigger";
    }
    return ""
}

function addSummaryBlobs(a: summaryBlob, b: summaryBlob, num: number = 1): summaryBlob {
    let blob: summaryBlob = {}
    if ( b.retrigger ) {
        if(a.targets) return {...a, targets: a.targets+b.retrigger};
        return addSummaryBlobs(a, a, b.retrigger);
    } else if (b.isBonus) {
        blob = a;
        if ("potency" in a && (a.potency ?? 0) > 0 && "potency" in b) blob.potency = (a.potency ?? 0) + (b.potency ?? 0);
        if ("count" in a && (a.count ?? 0) > 0 && "count" in b) blob.count = (a.count ?? 0) + (b.count ?? 0);
        if ("always" in a || "always" in b) blob.always = (a.always ?? false) || (b.always ?? false);
    } else {
        if ("potency" in a || "potency" in b) blob.potency = (a.potency ?? 0) + (b.potency ? b.potency * num : 0);
        if ("count" in a || "count" in b) blob.count = (a.count ?? 0) + (b.count ? b.count * num : 0);
        if ("selfPotency" in a || "selfPotency" in b) blob.selfPotency = (a.selfPotency ?? 0) + (b.selfPotency ? b.selfPotency * num : 0);
        if ("selfCount" in a || "selfCount" in b) blob.selfCount = (a.selfCount ?? 0) + (b.selfCount ? b.selfCount * num : 0);
        if ("value" in a || "value" in b) blob.value = (a.value ?? 0) + (b.value ? b.value * num : 0);
        if ("valuePercent" in a || "valuePercent" in b) blob.valuePercent = (a.valuePercent ?? 0) + (b.valuePercent ? b.valuePercent * num : 0);

        if ("trigger" in a || "trigger" in b) blob.trigger = (a.trigger ?? false) || (b.trigger ?? false);
        if ("isBonus" in a || "isBonus" in b) blob.isBonus = (a.isBonus ?? false) || (b.isBonus ?? false);
        if ("withCount" in a || "withCount" in b) blob.withCount = (a.withCount ?? false) || (b.withCount ?? false);

        if ("fixed" in a || "fixed" in b) blob.fixed = [...(a.fixed ?? []), ...(b.fixed ?? [])];
        if ("label" in a || "label" in b) blob.label = a.label ?? b.label;
    }

    return blob;
}

function insertIntoSummaryBlob(tokens: string[], blob?: summaryBlob): summaryBlob {
    if (!blob) blob = {};

    let mods, num, str;
    switch (tokens[0]) {
        case "status":
            mods = new Set<string>(tokens.splice(3));
            num = Number(tokens[2]);
            if (mods.has("self")) {
                if (mods.has("count")) blob.selfCount ? blob.selfCount += num : blob.selfCount = num;
                else blob.selfPotency ? blob.selfPotency += num : blob.selfPotency = num;
            } else {
                if (mods.has("count")) blob.count ? blob.count += num : blob.count = num;
                else blob.potency ? blob.potency += num : blob.potency = num;
            }
            if (getStatusWithCount({ "id": tokens[1] })) {
                blob.withCount = true;
            }
            break;
        case "statusMultiple":
            str = Number(tokens[2]) + " x" + Number(tokens[3]);
            if (blob.fixed) blob.fixed.push(str);
            else blob.fixed = [str];
            break;
        case "statusTrigger":
            blob.trigger = true;
            if(tokens.length > 2) {
                blob.value = Number(tokens[2]);
            }
            break;
        case "statusRetrigger":
            blob.retrigger = Number(tokens[1]);
            break;
        case "statusBonus":
            mods = new Set<string>(tokens.splice(3));
            num = Number(tokens[2]);
            blob.isBonus = true;
            if (mods.has("count")) blob.count ? blob.count += num : blob.count = num;
            else blob.potency ? blob.potency += num : blob.potency = num;
            if (getStatusWithCount({ "id": tokens[1] })) {
                blob.withCount = true;
            }
            if (mods.has("always")) blob.always = true;
            break;
        case "hp": case "sp": 
            blob.value = Number(tokens[1])
            blob.targets = Number(tokens[2])
            break;
        case "power": case "coinPower": case "clashPower": case "atkweight": case "speed": case "offenseLevel": case "defenseLevel": case "reuseCoin":
            blob.value = Number(tokens[1])
            break;
        case "skillReplace":
            blob.label = tokens.slice(1).join(" ");
            break;
        case "lifesteal":
            blob.valuePercent = Number(tokens[1].slice(0, tokens[1].length - 1));
            break;
        case "damage":
            if (tokens[1].charAt(tokens[1].length - 1) === "%") {
                blob.valuePercent = Number(tokens[1].slice(0, tokens[1].length - 1));
            } else {
                blob.value = Number(tokens[1]);
            }
            break;
    }
    return blob;
}

type summaryBlobProps = {
    summaryBlob: summaryBlob,
    count?: number
}

function AverageSummaryBlob({ summaryBlob, count }: summaryBlobProps): React.ReactElement {
    let items: React.ReactElement[] = []
    if (!summaryBlob.trigger) {
        if ((summaryBlob.potency || summaryBlob.count) && count) {
            if (summaryBlob.withCount) {
                items.push(<div>{((summaryBlob.potency ?? 0) / count).toFixed(2)}/{((summaryBlob.count ?? 0) / count).toFixed(2)}</div>);
            } else {
                items.push(<div>{((summaryBlob.potency ?? 0) / count).toFixed(2)}</div>);
            }
        }
        if ((summaryBlob.selfPotency || summaryBlob.selfCount) && count) {
            if (summaryBlob.withCount) {
                items.push(<div>self {((summaryBlob.selfPotency ?? 0) / count).toFixed(2)}/{((summaryBlob.selfCount ?? 0) / count).toFixed(2)}</div>);
            } else {
                items.push(<div>self {((summaryBlob.selfPotency ?? 0) / count).toFixed(2)}</div>);
            }
        }
    }

    return <div>{items}</div>;
}

function SummaryBlob({ summaryBlob }: summaryBlobProps): React.ReactElement {
    let items: React.ReactElement[] = []
    if (summaryBlob.trigger) {
        if(summaryBlob.value){
            if (summaryBlob.value && summaryBlob.value%1 !== 0) summaryBlob.value = Number(summaryBlob.value.toFixed(2));
            items.push(<div>Yes x{summaryBlob.value}</div>);
        } else {
            items.push(<div>Yes</div>);
        }
    } else {
        if (summaryBlob.potency || summaryBlob.count) {
            if (summaryBlob.potency && summaryBlob.potency%1 !== 0) summaryBlob.potency = Number(summaryBlob.potency.toFixed(2));
            if (summaryBlob.count && summaryBlob.count%1 !== 0) summaryBlob.count = Number(summaryBlob.count.toFixed(2));

            if (summaryBlob.withCount) {
                items.push(<div>{summaryBlob.potency ?? 0}/{summaryBlob.count ?? 0}</div>);
            } else {
                items.push(<div>{summaryBlob.potency ?? 0}</div>);
            }
        }
        if (summaryBlob.value || summaryBlob.valuePercent) {
            if (summaryBlob.value && summaryBlob.value%1 !== 0) summaryBlob.value = Number(summaryBlob.value.toFixed(2));

            if (!summaryBlob.value) {
                items.push(<div>{summaryBlob.valuePercent}%</div>);
            } else if (summaryBlob.targets) {
                items.push(<div>{summaryBlob.value ?? 0} x{summaryBlob.targets}</div>);
            } else if (summaryBlob.valuePercent){
                items.push(<div>{summaryBlob.value ?? 0}+{summaryBlob.valuePercent}%</div>);
            } else {
                items.push(<div>{summaryBlob.value ?? 0}</div>);
            }
        }
    }
    if (summaryBlob.selfPotency || summaryBlob.selfCount) {
        if (summaryBlob.selfPotency && summaryBlob.selfPotency%1 !== 0) summaryBlob.selfPotency = Number(summaryBlob.selfPotency.toFixed(2));
        if (summaryBlob.selfCount && summaryBlob.selfCount%1 !== 0) summaryBlob.selfCount = Number(summaryBlob.selfCount.toFixed(2));

        if (summaryBlob.withCount) {
            items.push(<div>self {summaryBlob.selfPotency ?? 0}/{summaryBlob.selfCount ?? 0}</div>);
        } else {
            items.push(<div>self {summaryBlob.selfPotency ?? 0}</div>);
        }
    }
    if (summaryBlob.fixed) {
        summaryBlob.fixed.forEach(item => { items.push(<div>{item}</div>) });
    }

    return <div>{items}</div>;
}

export { getSummaryMappingId, addSummaryBlobs, insertIntoSummaryBlob, SummaryBlob, AverageSummaryBlob };
export type { summaryBlob };