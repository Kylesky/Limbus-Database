import React, { type FC } from 'react';
import {
    getBezierPath,
    EdgeLabelRenderer,
    BaseEdge,
    type EdgeProps,
    type Edge,
    MarkerType,
} from '@xyflow/react';
import { replaceVariablesAsElements } from 'utils';
import css from "./CustomEdge.module.css";

type edgeData = {
    "text": string,
    "returning"?: boolean,
    "vars"?: { [key: string]: { "id": string } | undefined }
}

function getText(data: edgeData) {
    let vars: { [key: string]: any } = {};
    if (data && data.vars) {
        Object.entries(data.vars).forEach(([k, v]) => {
            vars[k] = { "type": "status", "fixed": v };
        });
    };
    return replaceVariablesAsElements(data.text, vars, {});
}

const curvature = 0.25;

const CustomEdge: FC<EdgeProps<Edge<edgeData>>> = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}) => {
    let [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature
    });

    if(data && "returning" in data && data["returning"]){
        let radiusX = (sourceX - targetX) * 0.6;
        let radiusY = 25;
        edgePath = `M ${sourceX - 5} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${targetX + 2} ${targetY}`;
    }

    return (
        <>
            <BaseEdge id={id} path={edgePath} markerEnd={MarkerType.ArrowClosed} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    }}
                    className={css.edgeContents}
                >
                    {data ? getText(data) : null}
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default CustomEdge;