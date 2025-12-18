export function buildEdges(connections = []) {
    return connections.map((c, i) => ({
        id: `e-${i}`,
        source: c.from,
        target: c.to,

        // 🔑 KEY CHANGE
        type: "bezier",

        // Optional edge label (can be removed if not needed)
        label: "",

        // 🎨 STYLE MATCHING YOUR IMAGE
        style: {
            stroke: "#9bbcf2",        // soft light blue
            strokeWidth: 1.6,         // thin but visible
            opacity: 0.9,
            strokeLinecap: "round",   // rounded line ends
            strokeLinejoin: "round"   // smooth corners
        }
    }));
}
