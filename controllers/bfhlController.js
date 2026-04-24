const graphService = require('../services/graphProcessor');

const processData = (req, res) => {
    try {
        const data = req.body.data || [];

        // Let the service handle the complex graph logic
        const result = graphService.processGraph(data);

        // Format and return the final JSON response
        res.json({
            user_id: "vaishnav dasari",
            email_id: "vaishnav_dasari@srmap.edu.in",
            college_roll_number: "AP23110010329",
            hierarchies: result.hierarchies,
            invalid_entries: result.invalid_entries,
            duplicate_edges: result.duplicate_edges,
            summary: result.summary
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Something went wrong processing the graph data" });
    }
};

module.exports = {
    processData
};
