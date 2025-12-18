import { useState, useMemo,createElement}from "react";
import ReactFlow, { Controls } from "reactflow";
import "reactflow/dist/style.css";

import { buildNodes } from "../utils/buildNodes";
import { buildEdges } from "../utils/buildEdges";
import { applyAutoLayout } from "../utils/applyAutoLayout";
import { getVisibleGraph } from "../utils/getVisibleGraph";
import { CustomNode } from "./CustomNode";

const nodeTypes = { customNode: CustomNode };

export function MindMapCanvas({ mindMap, onNodeClick }) {
    const [expandedNodeIds, setExpandedNodeIds] = useState(
        new Set([mindMap.rootNode.id])
    );

    const { visibleNodeIds, visibleEdges } = useMemo(
        () => getVisibleGraph(mindMap, expandedNodeIds),
        [mindMap, expandedNodeIds]
    );

    const rawNodes = buildNodes(mindMap).filter(n =>
        visibleNodeIds.includes(n.id)
    );

    const rawEdges = buildEdges(visibleEdges);
    const layoutedNodes = applyAutoLayout(rawNodes, rawEdges);

    return (
        <div style={{ width: "100%", height: "100vh" }}>
            <ReactFlow
                nodes={layoutedNodes}
                edges={rawEdges}
                nodeTypes={nodeTypes}
                fitView
                onNodeClick={(e, node) => {
                    setExpandedNodeIds(prev => {
                        const next = new Set(prev);
                        next.has(node.id) ? next.delete(node.id) : next.add(node.id);
                        return next;
                    });

                    if (onNodeClick?.canExecute) {
                        onNodeClick.execute();
                    }
                }}
                 defaultEdgeOptions={{
                        type: "bezier",
                        style: {
                            stroke: "#9bbcf2",
                            strokeWidth: 1.6,
                            opacity: 0.9
                        }
    }}
            >
                <Controls />
            </ReactFlow>
        </div>
    );
}
