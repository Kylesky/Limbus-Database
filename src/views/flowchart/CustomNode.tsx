import {Handle, Position, Node, NodeProps } from '@xyflow/react';
import { replaceVariablesAsElements } from 'utils';
import css from "./CustomNode.module.css";

type nodeData = {
    "text": string,
    "vars"?: { [key: string]: { "id": string } | undefined }
}
type nodeType = Node<nodeData, 'custom'>

export default function CustomNode({ data }: NodeProps<nodeType>) {
// function NodeElement({ data }: NodeProps<nodeType>) {
    let vars: {[key: string]: any} = {};
    if (data.vars) {
        Object.entries(data.vars).forEach(([k, v]) => {
            vars[k] = { "type": "status", "fixed": v };
        });
    };
    let text = replaceVariablesAsElements(data.text, vars, {});
    return <div>
        <div className={css.nodeContents}>{text}</div>
        <Handle className={css.handle} type="target" position={Position.Left} />
        <Handle className={css.handle} type="source" position={Position.Right} />
    </div>
}

export type {nodeType};