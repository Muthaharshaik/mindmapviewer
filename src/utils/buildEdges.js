export function buildEdges(connections = [], animate = false) {
    return connections.map((c, i) => ({
        id: `e-${i}`,
        source: c.from,
        target: c.to,

        // 🔑 KEY CHANGE
        type: "bezier",

        // IMPORTANT: keep this false to avoid dotted animation
        animated: false,

        style: {
            stroke: "#9bbcf2",
            strokeWidth: 1.6,
            opacity: 0.9,
            strokeLinecap: "round",   // rounded line ends
            strokeLinejoin: "round"   // smooth corners
        }
    }));
}
