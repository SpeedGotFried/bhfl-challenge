const graphService = require('../services/graphProcessor');
const { z } = require('zod');

// Define Zod schema for the expected request body
const requestSchema = z.object({
    data: z.array(z.string()).nonempty("Data array cannot be empty.")
});

const processData = (req, res) => {
    try {
        // Validate request body
        const validation = requestSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ 
                error: "Invalid Request Format", 
                details: validation.error.issues 
            });
        }
        
        const data = validation.data.data;
        
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
