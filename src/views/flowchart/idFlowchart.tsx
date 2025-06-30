import Dagre from '@dagrejs/dagre';
import React, { useEffect, useRef } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    useReactFlow,
    useNodesInitialized,
    MarkerType
} from '@xyflow/react';
import { identity } from "items/identity";
import CustomEdge from './CustomEdge';
import CustomNode from './CustomNode';
import {nodeType} from "./CustomNode";
// import css from "./idFlowchart.module.css";

import '@xyflow/react/dist/style.css';

type state = {
    "id": string,
    "data": {
        "text": string,
        "vars"?: { [key: string]: { "id": string } | undefined }
    }
}

type transition = {
    "id": string,
    "source": string,
    "target": string,
    "data"?: {
        "text": string,
        "vars"?: { [key: string]: { "id": string } | undefined }
    }
}

type flowChartData = {
    states: state[],
    transitions: transition[]
}

const nodeTypes = {
    "custom": CustomNode
};

const edgeTypes = {
    "custom": CustomEdge
}

type SummaryFlowchartProps = {
    item: identity
}

function IdFlowchartInner({ item }: SummaryFlowchartProps) {
    let positionedStates: nodeType[] = item.flowChart ? item.flowChart.states.map(state => {
        return {...state, "type": "custom", "position": { "x": 0, "y": 0 }};
    }) : [];

    let transitions = item.flowChart ? item.flowChart.transitions.map(transition => {
        return {...transition, "type": "custom", "selectable": false, "markerEnd": {"type": MarkerType.ArrowClosed}, "animated": true}
    }) : []

    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState(positionedStates);
    const [edges, setEdges, onEdgesChange] = useEdgesState(transitions);
    const nodesInitialized = useNodesInitialized();
    const effectExecuted = useRef(false);

    useEffect(() => {
        if (nodesInitialized && !effectExecuted.current) {
            const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
            g.setGraph({ rankdir: "LR", ranksep: 150, nodesep: 5 });

            edges.forEach((edge) => g.setEdge(edge.source, edge.target));
            nodes.forEach((node) => {
                g.setNode(node.id, {
                    ...node,
                    width: node.measured?.width ?? 0,
                    height: node.measured?.height ?? 0,
                })
            });

            Dagre.layout(g);

            let layoutedNodes = nodes.map((node) => {
                const position = g.node(node.id);
                // We are shifting the dagre node position (anchor=center center) to the top left
                // so it matches the React Flow node anchor point (top left).
                const x = position.x - (node.measured?.width ?? 0) / 2;
                const y = position.y - (node.measured?.height ?? 0) / 2;

                return { ...node, position: { x, y }};
            });


            setNodes([...layoutedNodes]);
            setEdges([...edges]);

            fitView();
            effectExecuted.current = true;
        }
    }, [nodesInitialized, edges, fitView, nodes, setEdges, setNodes]);

    if (!item.flowChart) return null;

    return <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={false}
        fitView
    > 
        {/* <Background color="#ccc" variant={BackgroundVariant.Dots} /> */}
    </ReactFlow>;
}

function IdFlowchart({ item }: SummaryFlowchartProps) {
    return <ReactFlowProvider>
        <IdFlowchartInner item={item} />
    </ReactFlowProvider>
}

export { IdFlowchart };
export type { flowChartData };