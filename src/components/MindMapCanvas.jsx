import {
    useState,
    useMemo,
    useCallback,
    useEffect,
    useRef,
    createElement
} from "react";

import ReactFlow, {
    Controls,
    useReactFlow
} from "reactflow";

import "reactflow/dist/style.css";
import "../ui/MindMapViewer.css";

import expandIcon from "../assets/expand-svgrepo-com.svg";
import collapseIcon from "../assets/collapse-svgrepo-com.svg";

import { buildNodes } from "../utils/buildNodes";
import { buildEdges } from "../utils/buildEdges";
import { applyAutoLayout } from "../utils/applyAutoLayout";
import { getVisibleGraph } from "../utils/getVisibleGraph";
import { CustomNode } from "./CustomNode";

const nodeTypes = {
    customNode: CustomNode
};

export function MindMapCanvas({ mindMap, onNodeClick }) {
    const { fitView } = useReactFlow();
    const fitTimeoutRef = useRef(null);

    const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());
    const [animateEdges, setAnimateEdges] = useState(false);

    /* ------------------------
       Auto-fit helper (SAFE)
    -------------------------*/
    const triggerFitView = useCallback(() => {
        if (fitTimeoutRef.current) {
            clearTimeout(fitTimeoutRef.current);
        }

        fitTimeoutRef.current = setTimeout(() => {
            fitView({
                padding: 0.25,
                duration: 300
            });
        }, 60); // small delay to wait for React Flow internal update
    }, [fitView]);

    useEffect(() => {
        return () => {
            if (fitTimeoutRef.current) {
                clearTimeout(fitTimeoutRef.current);
            }
        };
    }, []);

    /* ------------------------
       Expand / Collapse
    -------------------------*/
    const toggleNode = useCallback((nodeId) => {
        setAnimateEdges(true);

        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
            return next;
        });

        setTimeout(() => setAnimateEdges(false), 300);
    }, []);

    const expandAll = useCallback(() => {
        setExpandedNodeIds(
            new Set([
                mindMap.rootNode.id,
                ...mindMap.nodes.map(n => n.id)
            ])
        );
    }, [mindMap]);

    const collapseAll = useCallback(() => {
        setExpandedNodeIds(new Set());
    }, []);

    /* ------------------------
       Visible Graph
    -------------------------*/
    const { visibleNodeIds, visibleEdges } = useMemo(
        () => getVisibleGraph(mindMap, expandedNodeIds),
        [mindMap, expandedNodeIds]
    );

    /* ------------------------
       Nodes & Edges
    -------------------------*/
    const rawNodes = useMemo(() => {
        return buildNodes(mindMap)
            .filter(n => visibleNodeIds.includes(n.id))
            .map(node => ({
                ...node,
                data: {
                    ...node.data,
                    isExpanded: expandedNodeIds.has(node.id),
                    onToggle: () => toggleNode(node.id)
                }
            }));
    }, [mindMap, visibleNodeIds, expandedNodeIds, toggleNode]);

    const rawEdges = useMemo(
        () => buildEdges(visibleEdges, animateEdges),
        [visibleEdges, animateEdges]
    );

    const layoutedNodes = useMemo(
        () => applyAutoLayout(rawNodes, rawEdges),
        [rawNodes, rawEdges]
    );

    /* ------------------------
       AUTO FIT (KEY LOGIC)
    -------------------------*/
    useEffect(() => {
        if (layoutedNodes.length) {
            triggerFitView();
        }
    }, [layoutedNodes, triggerFitView]);

    /* ------------------------
       Toolbar state
    -------------------------*/
    const totalNodeCount = mindMap.nodes.length + 1;
    const isAllExpanded = expandedNodeIds.size >= totalNodeCount;

    return (
        <div className="main-layout">
            <ReactFlow
                nodes={layoutedNodes}
                edges={rawEdges}
                nodeTypes={nodeTypes}
                onNodeClick={() => {
                    if (onNodeClick?.canExecute) {
                        onNodeClick.execute();
                    }
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Controls showInteractive={false} />
            </ReactFlow>

            {/* Toolbar */}
            <div className="tool-bar">
                {!isAllExpanded ? (
                    <button
                        onClick={expandAll}
                        title="Expand All"
                        className="icon-btn"
                    >
                        <img src={expandIcon} alt="Expand All" />
                    </button>
                ) : (
                    <button
                        onClick={collapseAll}
                        title="Collapse All"
                        className="icon-btn"
                    >
                        <img src={collapseIcon} alt="Collapse All" />
                    </button>
                )}
            </div>
        </div>
    );
}
