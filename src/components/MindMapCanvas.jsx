import { useState, useMemo, useCallback, createElement, useEffect, useRef } from "react";
import ReactFlow, { Controls } from "reactflow";
import "reactflow/dist/style.css";
import "../ui/MindMapViewer.css";

import expandIcon from "../assets/chevrons-up-down.svg";
import collapseIcon from "../assets/chevrons-down-up.svg";
import infoIcon from "../assets/info-circle-svgrepo-com.svg"
import downloadIcon from "../assets/download.svg"

import { buildNodes } from "../utils/buildNodes";
import { buildEdges } from "../utils/buildEdges";
import { applyAutoLayout } from "../utils/applyAutoLayout";
import { getVisibleGraph } from "../utils/getVisibleGraph";
import { exportReactFlowToSvg } from "../utils/exportToSvg";
import { CustomNode } from "./CustomNode";

const nodeTypes = { customNode: CustomNode };

export function MindMapCanvas({ mindMap, onNodeClick, onLabelChange, deltaJson }) {

    
    /* =========================================================
       SOURCE OF TRUTH
    ========================================================== */
    const [localMindMap, setLocalMindMap] = useState(mindMap);
    const updateTimeoutRef = useRef(null);
    const reactFlowRef = useRef(null);

    /* =========================================================
       EXISTING STATE – UNCHANGED
    ========================================================== */
    useEffect(() => {
        setLocalMindMap(mindMap);
    }, [mindMap]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    // Root expanded by default
    const [expandedNodeIds, setExpandedNodeIds] = useState(
        new Set([mindMap.rootNode.id])
    );
    const [animateEdges, setAnimateEdges] = useState(false);

    /** Helper to check whether the node has children or not */
    const hasChildrenMap = useMemo(() => {
        const map = {};
        localMindMap.connections.forEach(c => {
            map[c.from] = true;
        });
        return map;
    }, [localMindMap]);

    /* =========================================================
       EXPAND / COLLAPSE HELPERS – UNCHANGED
    ========================================================== */

    const toggleNode = useCallback((nodeId) => {
        setAnimateEdges(true);
        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
            return next;
        });
        setTimeout(() => setAnimateEdges(false), 600);
    }, []);

    const expandAll = () => {
        const all = new Set(
            [localMindMap.rootNode.id, ...localMindMap.nodes.map(n => n.id)]
        );
        setExpandedNodeIds(all);

        //Trigger fitview after layout recalculates
        setTimeout(() => {
            if (reactFlowRef.current) {
                reactFlowRef.current.fitView();
            }
        }, 50);
    };

    const collapseAll = () => {
        // First, trigger fitView to smoothly zoom to root
        if (reactFlowRef.current) {
            reactFlowRef.current.fitView();
        }
        
        // Then collapse after the zoom animation starts
        setTimeout(() => {
            setExpandedNodeIds(new Set([localMindMap.rootNode.id]));
            
            // Final fitView after collapse
            setTimeout(() => {
                if (reactFlowRef.current) {
                    reactFlowRef.current.fitView();
                }
            }, 50);
        }, 200);
    };

    const handleExport = () => {
        if (reactFlowRef.current) {
            exportReactFlowToSvg(reactFlowRef.current, "mindmap.svg");
        } else {
            console.error("ReactFlow instance not ready");
        }
    };

    /* =========================================================
       LABEL UPDATE HANDLER
    ========================================================== */
    const handleLabelChange = useCallback((nodeId, newLabel) => {
        const trimmed = newLabel.trim();

        // Clear any pending updates
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Update UI immediately
        setLocalMindMap(prev => {
            const updated = {
                ...prev,
                nodes: prev.nodes.map(n =>
                    n.id === nodeId ? { ...n, label: trimmed } : n
                ),
                rootNode: prev.rootNode.id === nodeId 
                    ? { ...prev.rootNode, label: trimmed }
                    : prev.rootNode
            };

            // Do not send empty values
            if (!trimmed) {
                return updated;
            }

            // Debounce external updates
            updateTimeoutRef.current = setTimeout(() => {
                if (deltaJson?.setValue) {
                    deltaJson.setValue(JSON.stringify(updated));
                }
                onLabelChange?.execute();
            }, 150);

            return updated;
        });

    }, [onLabelChange, deltaJson]);

    /* =========================================================
       VISIBLE GRAPH
    ========================================================== */

    const { visibleNodeIds, visibleEdges } = useMemo(
        () => getVisibleGraph(localMindMap, expandedNodeIds),
        [localMindMap, expandedNodeIds]
    );

    /* =========================================================
       STABLE LAYOUT KEY - PREVENTS RECALCULATION ON LABEL CHANGE
    ========================================================== */
    const layoutKey = useMemo(() => {
        return JSON.stringify({
            connections: localMindMap.connections,
            nodeIds: localMindMap.nodes.map(n => n.id),
            rootId: localMindMap.rootNode.id,
            expanded: Array.from(expandedNodeIds).sort()
        });
    }, [localMindMap.connections, localMindMap.nodes, localMindMap.rootNode.id, expandedNodeIds]);

    /* =========================================================
       BUILD NODES WITH LAYOUT - MEMOIZED BY STRUCTURE ONLY
    ========================================================== */
    const { nodes: layoutedNodes, edges: finalEdges } = useMemo(() => {
        const rawNodes = buildNodes(localMindMap)
            .filter(n => visibleNodeIds.includes(n.id))
            .map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isExpanded: expandedNodeIds.has(node.id),
                    onToggle: () => toggleNode(node.id),
                    hasChildren: !!hasChildrenMap[node.id],
                    onLabelChange: handleLabelChange
                }
            }));

        const rawEdges = buildEdges(visibleEdges, animateEdges);
        const positioned = applyAutoLayout(rawNodes, rawEdges);
        
        return {
            nodes: positioned,
            edges: rawEdges
        };
    }, [layoutKey, visibleNodeIds, hasChildrenMap, visibleEdges, animateEdges]);

    const totalNodeCount = localMindMap.nodes.length + 1;
    const isAllExpanded = expandedNodeIds.size >= totalNodeCount;

    /* callback to store reactflow instance */
    const onInit = useCallback((instance) => {
        reactFlowRef.current = instance;
    }, []);

    /* =========================================================
       RENDER
    ========================================================== */

    return (
        <div className="main-layout">
            <ReactFlow
                nodes={layoutedNodes}
                edges={finalEdges}
                nodeTypes={nodeTypes}
                onInit={onInit}
                fitView
                // fitViewOptions={{ padding: 0.2, duration: 200 }}
                // minZoom={0.5}
                // maxZoom={2}
                onNodeClick={(e, node) => {
                    if (onNodeClick?.canExecute) {
                        onNodeClick.execute();
                    }
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls showInteractive={false} />
            </ReactFlow>

            {/*Info-detail */}
            <div className="info-detail">
                <img src={infoIcon} title="info" alt="Info"/>
                <span>Double Click on the Node to edit, Click Enter to save & Escape to clear the changes.</span>
            </div>

            {/* Toolbar */}
            <div className="tool-bar">
                {!isAllExpanded ? (
                    <button
                        onClick={expandAll}
                        title="Expand All"
                        className="icon-btn"
                    >
                        <img src={expandIcon} alt="Expand" />
                    </button>
                ) : (
                    <button
                        onClick={collapseAll}
                        title="Collapse All"
                        className="icon-btn"
                    >
                        <img src={collapseIcon} alt="Collapse" />
                    </button>
                )}
               <button onClick={handleExport} className="icon-btn" style={{marginTop: '5px'}}>
                <img src={downloadIcon} alt="Download" title="Download" style={{width:'18px', height:'18px'}}/>
               </button>
            </div>
        </div>
    );
}