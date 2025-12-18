export function parseMindMap(input) {
    if (!input) return null;

    try {
        const data = typeof input === "string" ? JSON.parse(input) : input;

        if (data.mindMap?.rootNode) {
            return data.mindMap;
        }

        if (data.rootNode) {
            return data;
        }

        return null;
    } catch (e) {
        console.error("MindMap parse error", e);
        return null;
    }
}
