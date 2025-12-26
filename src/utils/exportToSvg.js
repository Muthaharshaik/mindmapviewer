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

/**
 * Export a specific node and its expanded children to SVG
 * @param {Object} reactFlowInstance - The ReactFlow instance
 * @param {Array} nodeIdsToExport - Array of node IDs to include in export
 * @param {String} fileName - Name for the downloaded file
 */
export async function exportNodeWithChildren(
    reactFlowInstance, 
    nodeIdsToExport,
    fileName = "node_subtree.svg"
) {
    if (!reactFlowInstance) {
        console.error("ReactFlow instance not provided");
        return;
    }

    if (!nodeIdsToExport || nodeIdsToExport.length === 0) {
        console.error("No nodes to export");
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
    overlay.textContent = 'Downloading node...';
    document.body.appendChild(overlay);

    try {
        // Get all nodes and filter to only those we want to export
        const allNodes = reactFlowInstance.getNodes();
        const nodesToExport = allNodes.filter(node => 
            nodeIdsToExport.includes(node.id)
        );

        if (nodesToExport.length === 0) {
            console.error("No matching nodes found");
            document.body.removeChild(overlay);
            return;
        }

        // Store current viewport to restore later
        const originalViewport = reactFlowInstance.getViewport();
        
        // Create a Set for quick lookup
        const nodeIdSet = new Set(nodeIdsToExport);
        
        // Get all edges and find which ones to keep
        const allEdges = reactFlowInstance.getEdges();
        console.log('All edges in ReactFlow:', allEdges.map(e => `${e.id}: ${e.source} → ${e.target}`));
        
        const edgesToKeep = allEdges.filter(edge => 
            nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)
        );
        const edgeIdsToKeep = new Set(edgesToKeep.map(e => e.id));
        
        console.log('Nodes to export:', Array.from(nodeIdSet));
        console.log('Edges to keep:', edgesToKeep.map(e => `${e.id}: ${e.source} → ${e.target}`));
        
        // Find DOM elements to hide temporarily
        const nodesToHide = [];
        const edgesToHide = [];
        
        // Hide unwanted nodes
        document.querySelectorAll('.react-flow__node').forEach(nodeEl => {
            const nodeId = nodeEl.getAttribute('data-id');
            if (!nodeIdSet.has(nodeId)) {
                nodesToHide.push({ element: nodeEl, originalDisplay: nodeEl.style.display });
                nodeEl.style.display = 'none';
            }
        });
        
        // Different approach for edges: Since edges don't have reliable data-id attributes,
        // we'll match them by their order in the ReactFlow edges array
        const allEdgeElements = document.querySelectorAll('.react-flow__edge');
        console.log('Found', allEdgeElements.length, 'edge elements in DOM');
        console.log('ReactFlow has', allEdges.length, 'edges total');
        
        // Create a set of indices for edges we want to keep
        const edgeIndicesToKeep = new Set();
        allEdges.forEach((edge, index) => {
            if (nodeIdSet.has(edge.source) && nodeIdSet.has(edge.target)) {
                edgeIndicesToKeep.add(index);
            }
        });
        
        console.info('Edge indices to keep:', Array.from(edgeIndicesToKeep));
        
        // Hide edges that we don't want
        allEdgeElements.forEach((edgeEl, index) => {
            if (!edgeIndicesToKeep.has(index)) {
                edgesToHide.push({ element: edgeEl, originalDisplay: edgeEl.style.display });
                edgeEl.style.display = 'none';
            }
        });
        
        console.log('Hidden', nodesToHide.length, 'nodes and', edgesToHide.length, 'edges');
        
        // Calculate bounds for only the nodes we're exporting
        const nodesBounds = getNodesBounds(nodesToExport);
        
        // Calculate dimensions with padding
        const padding = 50;
        const width = nodesBounds.width + padding * 2;
        const height = nodesBounds.height + padding * 2;
        
        // Calculate viewport to fit selected nodes
        const viewportForBounds = getViewportForBounds(
            nodesBounds,
            width,
            height,
            0.5,  // min zoom
            2,    // max zoom
            padding / width  // padding as ratio
        );

        // Set viewport to show selected nodes (hidden by overlay)
        reactFlowInstance.setViewport(viewportForBounds, { duration: 0 });

        // Wait for React Flow to update the DOM and for hidden elements to take effect
        await new Promise(resolve => setTimeout(resolve, 200));

        // Get the viewport element
        const viewportElement = document.querySelector(".react-flow__viewport");
        
        if (!viewportElement) {
            console.error("ReactFlow viewport not found");
            // Restore hidden elements
            nodesToHide.forEach(({ element, originalDisplay }) => {
                element.style.display = originalDisplay;
            });
            edgesToHide.forEach(({ element, originalDisplay }) => {
                element.style.display = originalDisplay;
            });
            document.body.removeChild(overlay);
            return;
        }

        // Export to SVG - filter only excludes controls, hidden elements are already not visible
        const svgDataUrl = await toSvg(viewportElement, {
            backgroundColor: 'white',
            cacheBust: true,
            pixelRatio: 2,
            width: width,
            height: height,
            filter: (node) => {
                // Skip hidden elements
                if (node.style && node.style.display === 'none') {
                    return false;
                }
                
                // Exclude control elements only
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
        
        // Restore hidden elements
        nodesToHide.forEach(({ element, originalDisplay }) => {
            element.style.display = originalDisplay;
        });
        edgesToHide.forEach(({ element, originalDisplay }) => {
            element.style.display = originalDisplay;
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
        console.error("Node SVG Export failed:", error);
        
        // Restore any hidden elements
        try {
            document.querySelectorAll('.react-flow__node, .react-flow__edge').forEach(el => {
                if (el.style.display === 'none') {
                    el.style.display = '';
                }
            });
        } catch (e) {
            console.error("Failed to restore hidden elements:", e);
        }
        
        // Try to restore viewport even on error
        try {
            const nodes = reactFlowInstance.getNodes();
            if (nodes.length > 0) {
                reactFlowInstance.fitView({ duration: 0 });
            }
        } catch (e) {
            console.error("Failed to restore viewport:", e);
        }
    } finally {
        // Remove overlay
        document.body.removeChild(overlay);
    }
}