import { Status, getStatusName } from "./components/status";

function getIconSource(type: string, icon: string): string {
    switch(type) {
        case "sin": 
            return process.env.PUBLIC_URL + "/assets/icons/sins/" + icon + ".png";
        case "damageType": case "defendType":
            icon = icon.charAt(0).toUpperCase() + icon.slice(1);
            return process.env.PUBLIC_URL + "/assets/icons/skill types/" + icon + ".png";
    }
    return "";
}

function addPlusIfNonnegative(num: number): string {
    return num >= 0 ? "+" + num : num.toString();
}

function toRoman(num: number): string {
    switch(num) {
        case 1:
            return "I";
        case 2:
            return "II";
        case 3:
            return "III";
        case 4:
            return "IV";
        case 5:
            return "V";
        case 6:
            return "VI";
        case 7:
            return "VII";
        case 8:
            return "VIII";
        case 9:
            return "IX";
        case 10:
            return "X";
    }
    return ""
}

function getSinColor(sin: string | undefined): string {
    if(!sin) {
        return "grey";
    }

    switch(sin) {
        case "wrath":
            return "#fe0000"; 
        case "lust":
            return "#fb6500";
        case "sloth":
            return "#f7c729";
        case "gluttony":
            return "#9dfe00";
        case "gloom":
            return "#0dc1eb"; 
        case "pride":
            return "#0049d3";
        case "envy":
            return "#9300db";
    }
    return "black";
}

function replaceVariablesAsElements(templateText: string, templateVars: { [key: string]: { type: string, [key: string]: any } }, vars: { [key: string]: any }) {
    let text = templateText;
    let textPieces = [];

    while (true) {
        // Returns ["${variable}", index: number, input: string, groups: undefined]
        let match = text.match(/\$\{[a-zA-Z0-9]+\}/);
        if (!match || match.index === undefined) {
            textPieces.push(<span>{text}</span>);
            break; // No more variables to replace
        }
        
        textPieces.push(<span>{text.slice(0, match.index)}</span>);
        text = text.slice(match.index + match[0].length);

        let varName = match[0].slice(2, -1);
        if (varName in templateVars && "fixed" in templateVars[varName]) {
            switch (templateVars[varName].type) {
                case "num": case "string":
                    textPieces.push(<span>{templateVars[varName].fixed}</span>);
                    break;
                case "status":
                    textPieces.push(<Status status={templateVars[varName].fixed} />);
                    break;
                default:
                    console.warn(`Unknown type: ${templateVars[varName].type}`);
            }
        } else if (varName in vars) {
            switch (templateVars[varName].type) {
                case "num": case "string":
                    textPieces.push(<span>{vars[varName]}</span>);
                    break;
                case "status":
                    textPieces.push(<Status status={vars[varName]} />);
                    break;
                default:
                    console.warn(`Unknown type: ${templateVars[varName].type}`);
            }
        } else {
            console.warn(`Variable ${varName} not found in vars.`);
        }
    }
    
    return <span>{textPieces.map(piece => (<span>{piece}</span>))}</span>;
}

function replaceVariablesAsString(templateText: string, templateVars: { [key: string]: { type: string, [key: string]: any } }, vars: { [key: string]: any }, useIds: boolean = false) {
    let text = templateText;
    let result = "";

    while (true) {
        // Returns ["${variable}", index: number, input: string, groups: undefined]
        let match = text.match(/\$\{[a-zA-Z0-9]+\}/);
        if (!match || match.index === undefined) {
            result += text;
            break; // No more variables to replace
        }
        
        result += text.slice(0, match.index);
        text = text.slice(match.index + match[0].length);
        
        let varName = match[0].slice(2, -1);
        if (varName in templateVars && "fixed" in templateVars[varName]) {
            switch (templateVars[varName].type) {
                case "num": case "string":
                    result += templateVars[varName].fixed;
                    break;
                case "status":
                    if(useIds) {
                        result += templateVars[varName].fixed.id;
                    } else {
                        result += getStatusName(templateVars[varName].fixed);
                    }
                    break;
                default:
                    console.warn(`Unknown type: ${templateVars[varName].type}`);
            }
        } else if (varName in vars) {
            switch (templateVars[varName].type) {
                case "num": case "string":
                    result += vars[varName];
                    break;
                case "status":
                    if(useIds) {
                        result += vars[varName].id;
                    } else {
                        result += getStatusName(vars[varName]);
                    }
                    break;
                default:
                    console.warn(`Unknown type: ${templateVars[varName].type}`);
            }
        } else {
            console.warn(`Variable ${varName} not found in vars.`);
        }
    }
    
    return result;
}

export { getIconSource, addPlusIfNonnegative, toRoman, getSinColor, replaceVariablesAsElements, replaceVariablesAsString };