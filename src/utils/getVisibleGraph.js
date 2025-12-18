export function getVisibleGraph(mindMap, expandedNodeIds) {
    const visible = new Set([mindMap.rootNode.id]);
    const edges = [];

    const childrenMap = {};
    mindMap.connections.forEach(c => {
        if (!childrenMap[c.from]) childrenMap[c.from] = [];
        childrenMap[c.from].push(c.to);
    });

    function dfs(nodeId) {
        if (!expandedNodeIds.has(nodeId)) return;
        (childrenMap[nodeId] || []).forEach(child => {
            visible.add(child);
            dfs(child);
        });
    }

    dfs(mindMap.rootNode.id);

    mindMap.connections.forEach(c => {
        if (visible.has(c.from) && visible.has(c.to)) {
            edges.push(c);
        }
    });

    return {
        visibleNodeIds: [...visible],
        visibleEdges: edges
    };
}
