import { toSvg } from "html-to-image";
import { getNodesBounds, getViewportForBounds } from 'reactflow';

export async function exportReactFlowToSvg(
    reactFlowInstance, 
    fileName = "mindmap.svg"
) {
    if (!reactFlowInstance) {
        console.error("ReactFlow instance not provided");
        return;
    }

    // Create and show loading overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-size: 18px;
        font-weight: 500;
        color: #333;
    `;
    overlay.textContent = 'Downloading...';
    document.body.appendChild(overlay);

    try {
        // Get all nodes and calculate their bounds
        const nodes = reactFlowInstance.getNodes();
        const nodesBounds = getNodesBounds(nodes);
        
        // Store current viewport to restore later
        const originalViewport = reactFlowInstance.getViewport();
        
        // Calculate dimensions with padding
        const padding = 50;
        const width = nodesBounds.width + padding * 2;
        const height = nodesBounds.height + padding * 2;
        
        // Calculate viewport to fit all nodes
        const viewportForBounds = getViewportForBounds(
            nodesBounds,
            width,
            height,
            0.5,  // min zoom
            2,    // max zoom
            padding / width  // padding as ratio
        );

        // Set viewport to show all nodes (hidden by overlay)
        reactFlowInstance.setViewport(viewportForBounds, { duration: 0 });

        // Wait for React Flow to update the DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the viewport element
        const viewportElement = document.querySelector(".react-flow__viewport");
        
        if (!viewportElement) {
            console.error("ReactFlow viewport not found");
            document.body.removeChild(overlay);
            return;
        }

        // Export to SVG
        const svgDataUrl = await toSvg(viewportElement, {
            backgroundColor: 'white',
            cacheBust: true,
            pixelRatio: 2,
            width: width,
            height: height,
            filter: (node) => {
                const excludeClasses = [
                    'react-flow__minimap', 
                    'react-flow__controls',
                    'react-flow__background',
                    'react-flow__panel',
                    'button-styles',
                    'node-download'
                ];
                return !excludeClasses.some(className => 
                    node.classList?.contains(className)
                );
            }
        });

        // Download the SVG
        const link = document.createElement("a");
        link.href = svgDataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Restore original viewport
        reactFlowInstance.setViewport(originalViewport, { duration: 0 });

        // Wait a bit before removing overlay
        await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
        console.error("SVG Export failed:", error);
        // Try to restore viewport even on error
        try {
            const originalViewport = reactFlowInstance.getViewport();
            reactFlowInstance.setViewport(originalViewport, { duration: 0 });
        } catch (e) {
            console.error("Failed to restore viewport:", e);
        }
    } finally {
        // Remove overlay
        document.body.removeChild(overlay);
    }
}