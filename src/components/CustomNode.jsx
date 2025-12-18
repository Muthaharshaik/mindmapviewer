import { Handle, Position } from "reactflow";
import { createElement } from "react";
export function CustomNode({ data }) {
    return (
        <div
            style={{
                padding: "12px 16px",
                borderRadius: 14,
                color: "#fff",
                fontFamily: "Inter, system-ui",
                fontSize: 13,
                maxWidth: 240,
                lineHeight: 1.4,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
            }}
        >
            <strong style={{color:'black'}}>{data.label}</strong>

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
