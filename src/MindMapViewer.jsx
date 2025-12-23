import { useMemo, createElement } from "react"
import { MindMapCanvas } from "./components/MindMapCanvas";
import { parseMindMap } from "./utils/parseMindMap";

export function MindMapViewer(props) {
    const mindMapData = useMemo(() => {
        // Priority: deltaJson > mindMapJson
        const jsonSource = props.deltaJson?.value || props.mindMapJson?.value;
        if (jsonSource) {
            return parseMindMap(jsonSource);
        }
        return null;
    }, [props.deltaJson?.value, props.mindMapJson?.value]);

    if (!mindMapData) {
        return <div style={{ padding: 8 }}>Invalid Mind Map data</div>;
    }

    return (
        <MindMapCanvas
            mindMap={mindMapData}
            onNodeClick={props.onNodeClick}
            onLabelChange={props.onLabelChange}
            deltaJson={props.deltaJson}
        />
    );
}