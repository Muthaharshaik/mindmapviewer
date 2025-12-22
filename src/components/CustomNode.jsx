import { Handle, Position } from "reactflow";
import { useState, createElement, useEffect } from "react";
import rightIcon from "../assets/expand-right-svgrepo-com.svg";
import leftIcon from "../assets/expand-left-svgrepo-com.svg";

const PLACEHOLDER = "Double-click to edit";

export function CustomNode({ id, data }) {

    // ADD STATE (does NOT affect existing logic)
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(data.label || "");

    useEffect(() => {
        setValue(data.label || "");
    }, [data.label]);

    const commit = () => {
        setEditing(false);
        const finalValue = value.trim();
        if (!finalValue) return
        data.onLabelChange?.(id, finalValue);
    };

    return (
        <div
            style={{
                position: "relative",
                backgroundColor: data.color,
                padding: "14px 22px",
                borderRadius: 14,
                color: "#fff",
                fontFamily: "Inter, system-ui",
                fontSize: 13,
                minWidth: 200,
                maxWidth: 300,
                lineHeight: 1.4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
            }}
        >
            {/* LABEL (ONLY THIS PART CHANGED) */}
            {!editing ? (
                <div
                    style={{ fontWeight: 600, cursor: "text" }}
                    onDoubleClick={() => setEditing(true)}
                >
                {data.label && data.label.trim()
                        ? data.label
                        : PLACEHOLDER}
                </div>
            ) : (
                <input
                    autoFocus
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    onBlur={commit}
                    onKeyDown={e => e.key === "Enter" && commit()}
                    style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        padding: 4,
                        borderRadius: 6,
                        color:'#000',
                        backgroundColor:'#fff'
                    }}
                />
            )}

            {/*  EVERYTHING BELOW IS UNCHANGED */}

            {data.hasChildren && (
                <button
                    onClick={data.onToggle}
                    style={{
                        position: "absolute",
                        top: "50%",
                        transform: "translateY(-50%)",
                        right: "-14px",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        border: "none",
                        background: "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                    }}
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
