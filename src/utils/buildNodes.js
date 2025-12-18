export function buildNodes(mindMap) {
    if (!mindMap?.rootNode) return [];

    const nodes = [];

    // Root node
    nodes.push({
        id: mindMap.rootNode.id,
        type: "customNode",
        data: {
            label: mindMap.rootNode.label,
            description: mindMap.rootNode.description
        },
        style: {
            backgroundColor: mindMap.rootNode.color   // ✅ FROM JSON
        }
    });

    // Other nodes
    mindMap.nodes.forEach(node => {
        nodes.push({
            id: node.id,
            type: "customNode",
            data: {
                label: node.label,
                description: node.description
            },
            style: {
                backgroundColor: node.color           // ✅ FROM JSON
            }
        });
    });

    return nodes;
}
