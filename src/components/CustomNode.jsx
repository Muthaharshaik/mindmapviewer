import { Handle, Position } from "reactflow";
import { createElement } from "react";
import rightIcon from "../assets/expand-right-svgrepo-com.svg";
import leftIcon from "../assets/expand-left-svgrepo-com.svg";

export function CustomNode({ data }) {
    const showButton = data.hasChildren;

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
            {/* Node Text */}
            <div style={{ fontWeight: 600 }}>
                {data.label}
            </div>

            {/* Edge-attached expand / collapse button */}
            {showButton && (
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
