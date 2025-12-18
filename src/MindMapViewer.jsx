import { useMemo,createElement}from "react"
import { MindMapCanvas } from "./components/MindMapCanvas";
import { parseMindMap } from "./utils/parseMindMap";
import { mindMapMock } from "./mock/mindMapMock";

export function MindMapViewer(props) {
    const mindMapData = useMemo(() => {
        if (props.mindMapJson?.value) {
            return parseMindMap(props.mindMapJson.value);
        }
        return parseMindMap(mindMapMock);
    }, [props.mindMapJson?.value]);

    if (!mindMapData) {
        return <div style={{ padding: 8 }}>Invalid Mind Map data</div>;
    }

    return (
        <MindMapCanvas
            mindMap={mindMapData}
            onNodeClick={props.onNodeClick}
        />
    );
}
