import { useState, useMemo, useCallback, createElement } from "react";
import ReactFlow, { Controls } from "reactflow";
import "reactflow/dist/style.css";
import "../ui/MindMapViewer.css"
import expandIcon from "../assets/expand-svgrepo-com.svg";
import collapseIcon from "../assets/collapse-svgrepo-com.svg"

import { buildNodes } from "../utils/buildNodes";
import { buildEdges } from "../utils/buildEdges";
import { applyAutoLayout } from "../utils/applyAutoLayout";
import { getVisibleGraph } from "../utils/getVisibleGraph";
import { CustomNode } from "./CustomNode";

const nodeTypes = { customNode: CustomNode };

export function MindMapCanvas({ mindMap, onNodeClick }) {


    // Root expanded by default
    const [expandedNodeIds, setExpandedNodeIds] = useState(
        new Set([mindMap.rootNode.id])
    );
    const [animateEdges, setAnimateEdges] = useState(false)

    /** Helper to check whether the node has children or not */
    const hasChildrenMap = useMemo(()=> {
        const map = {}
        mindMap.connections.forEach(c => {
            map[c.from] = true;
        })
        return map;
    },[mindMap])

    /* ------------------------
       Expand / Collapse helpers
    -------------------------*/

    const toggleNode = useCallback((nodeId) => {
        setAnimateEdges(true)
        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
            return next;
        });
        setTimeout(() => setAnimateEdges(false), 600);
    }, []);

    const expandAll = () => {
        const all = new Set(
            [mindMap.rootNode.id, ...mindMap.nodes.map(n => n.id)]
        );
        setExpandedNodeIds(all);
    };

    const collapseAll = () => {
        setExpandedNodeIds(new Set([mindMap.rootNode.id]));
    };

    /* ------------------------
       Visible graph
    -------------------------*/

    const { visibleNodeIds, visibleEdges } = useMemo(
        () => getVisibleGraph(mindMap, expandedNodeIds),
        [mindMap, expandedNodeIds]
    );

    /* ------------------------
       Build nodes with controls
    -------------------------*/

    const rawNodes = buildNodes(mindMap)
        .filter(n => visibleNodeIds.includes(n.id))
        .map(node => ({
            ...node,
            data: {
                ...node.data,
                isExpanded: expandedNodeIds.has(node.id),
                onToggle: () => toggleNode(node.id),
                hasChildren: !!hasChildrenMap[node.id] 
            }
        }));

    const rawEdges = buildEdges(visibleEdges,animateEdges);
    const layoutedNodes = applyAutoLayout(rawNodes, rawEdges);
    const totalNodeCount = mindMap.nodes.length + 1;
    const isAllExpanded = expandedNodeIds.size >= totalNodeCount;

    return (
        <div className="main-layout">
            <ReactFlow
                nodes={layoutedNodes}
                edges={rawEdges}
                nodeTypes={nodeTypes}
                fitView
                onNodeClick={(e, node) => {
                    if (onNodeClick?.canExecute) {
                        onNodeClick.execute();
                    }
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls showInteractive={false}/>
            </ReactFlow>

            {/* Toolbar */}
            <div className="tool-bar">
                {!isAllExpanded ? (
                    <button onClick={expandAll} title="Expand All" className="icon-btn">
                        <img src={expandIcon} alt="Expand"/>
                    </button>
                ) : (
                    <button onClick={collapseAll} title="Collapse All" className="icon-btn">
                        <img src={collapseIcon} alt="Collapse"/>
                    </button>
                )
            }
            </div>
        </div>
    );
}
