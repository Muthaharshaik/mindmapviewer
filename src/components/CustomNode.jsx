import { Handle, Position } from "reactflow";
import { useState, createElement, useEffect, useRef } from "react";
import rightIcon from "../assets/cheveron-right.svg";
import leftIcon from "../assets/cheveron-left.svg";
import whiteDownload from "../assets/whitedownload.svg";
import React from "react";

const PLACEHOLDER = "Double-click to edit";

export function CustomNode({ id, data }) {

    // ADD STATE (does NOT affect existing logic)
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");
    const inputRef = useRef(null);

    useEffect(() => {
        setValue(data.label || "");
    }, [data.label]);

    // Focus input when editing starts
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const commit = () => {
        const finalValue = value.trim();
        
        // Exit edit mode first
        setEditing(false);
        
        // Only update if value changed and is not empty
        if (!finalValue || finalValue === data.label) {
            setValue(data.label || ""); // Reset to original if empty
            return;
        }

        // Use setTimeout to ensure state updates happen after render cycle
        setTimeout(() => {
            data.onLabelChange?.(id, finalValue);
        }, 0);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            commit();
        } else if (e.key === "Escape") {
            e.stopPropagation();
            setEditing(false);
            setValue(data.label || ""); // Reset to original
        }
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setEditing(true);
    };

    const handleBlur = () => {
        // Small delay to allow other events to complete
        setTimeout(() => {
            commit();
        }, 50);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
    }

    // Handle single click to position cursor
    const handleInputClick = (e) => {
        e.stopPropagation();
        // If text is selected, deselect and position cursor
        if (inputRef.current) {
            const clickPosition = inputRef.current.selectionEnd;
            // Small timeout to ensure click is processed
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.setSelectionRange(clickPosition, clickPosition);
                }
            }, 0);
        }
    };

    // NEW: Handle node export
    const handleNodeDownload = (e) => {
        e.stopPropagation();
        if (data.onNodeExport) {
            data.onNodeExport(id);
        }
    };

    return (
        <div
            style={{
                position: "relative",
                 "--node-color": data.color,
                backgroundColor: `color-mix(in srgb, ${data.color} 85%, black)`,
                padding: "14px 22px",
                color: "#fff",
                fontFamily: "Inter, system-ui",
                fontSize: 13,
                minWidth: 200,
                maxWidth: 300,
                lineHeight: 1.4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
            }}
        >
            {/* LABEL - Updated with proper event handling */}
            {!editing ? (
                <div
                    style={{ fontWeight: 600, cursor: "text", width: "85%" }}
                    onDoubleClick={handleDoubleClick}
                >
                    {data.label && data.label.trim()
                        ? data.label
                        : PLACEHOLDER}
                </div>
            ) : (
                <input
                    ref={inputRef}
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    onMouseDown={handleMouseDown} // Prevent drag
                    onClick={handleInputClick}
                    style={{
                        width: "85%",
                        border: "none",
                        outline: "none",
                        padding: 4,
                        borderRadius: 6,
                        color: '#000',
                        backgroundColor: '#fff',
                        fontFamily: "Inter, system-ui",
                        fontSize: 13
                    }}
                />
            )}

            {/* Toggle button and Download button */}
            {data.hasChildren && (
                <>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onToggle();
                    }}
                    className="button-styles"
                >
                    <img
                        src={data.isExpanded ? rightIcon : leftIcon}
                        title={data.isExpanded ? "Collapse" : "Expand"}
                        alt="toggle"
                        style={{
                            width: 12,
                            height: 12
                        }}
                    />
                </button>

                <button
                    onClick={handleNodeDownload}
                    className="node-download"
                >
                    <img 
                       src={whiteDownload}
                       title="Download This Node & Expanded Children"
                       alt="Download Node Subtree"
                       style={{
                        width: 12,
                        height: 12
                       }}
                    />
                </button>
                </>
            )}

            {/* React Flow Handles */}
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: "transparent", border: "none" }}
            />
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: "transparent", border: "none" }}
            />
        </div>
    );
}