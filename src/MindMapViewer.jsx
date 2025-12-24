import { useMemo, createElement } from "react"
import { MindMapCanvas } from "./components/MindMapCanvas";
import { parseMindMap } from "./utils/parseMindMap";

export function MindMapViewer(props) {
    const mindMapData = useMemo(() => {
        let jsonSource = null;
        
        // Priority: deltaJson > mindMapJson
        if (props.deltaJson?.value && props.deltaJson.value.trim()) {
            console.info("Using deltaJson");
            jsonSource = props.deltaJson.value;
        } else if (props.mindMapJson?.value && props.mindMapJson.value.trim()) {
            console.info("Using mindMapJson");
            jsonSource = props.mindMapJson.value;
        } else {
            console.warn("No JSON data provided");
            return null;
        }
        
        // Try to parse
        try {
            const parsed = parseMindMap(jsonSource);
            
            // Validate parsed data
            if (!parsed || !parsed.rootNode || !parsed.rootNode.id) {
                console.error("Invalid mindmap structure:", parsed);
                return null;
            }
            
            console.log("Successfully parsed mindmap:", parsed);
            return parsed;
        } catch (error) {
            console.error("Failed to parse mindmap:", error);
            return null;
        }
    }, [props.deltaJson?.value, props.mindMapJson?.value]);

    if (!mindMapData) {
        return (
            <div style={{ 
                padding: 20, 
                textAlign: 'center',
                color: '#666',
                fontFamily: 'Inter, system-ui'
            }}>
                <p>No mind map data available.</p>
                <p style={{ fontSize: 12, marginTop: 10 }}>
                    Please generate mindmap.
                </p>
            </div>
        );
    }

    return (
        <MindMapCanvas
            mindMap={mindMapData}
            onNodeClick={props.onNodeClick}
            onLabelChange={props.onLabelChange}
            deltaJson={props.deltaJson}
            mindMapJson={props.mindMapJson}
        />
    );
}