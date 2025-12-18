import dagre from "dagre";

const WIDTH = 240;
const HEIGHT = 90;

export function applyAutoLayout(nodes, edges) {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR", ranksep: 120, nodesep: 60 });

    nodes.forEach(n => {
        g.setNode(n.id, { width: WIDTH, height: HEIGHT });
    });

    edges.forEach(e => {
        g.setEdge(e.source, e.target);
    });

    dagre.layout(g);

    return nodes.map(n => {
        const pos = g.node(n.id);
        return {
            ...n,
            position: {
                x: pos.x - WIDTH / 2,
                y: pos.y - HEIGHT / 2
            }
        };
    });
}
