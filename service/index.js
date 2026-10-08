const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4356;

var blockers = {};

var isBlocked = (operation) => {
    return blockers[operation] || false;
}
var block = (operation) => {
    blockers[operation] = true;
}
var release = (operation) => {
    blockers[operation] = false;
}

// Middleware to parse JSON request bodies
app.use(express.json());

app.get('/alive', async (req, res) => {
    return res.status(200).json({ message: 'hello' });
});

// Define a POST route with dynamic operation handling
app.post('/trigger/:operation', async (req, res) => {
    const { operation } = req.params;

    // Check if operation is provided
    if (!operation) {
        return res.status(400).json({ errorCode: 1, errorMessage: 'Operation is required' });
    }

    if(isBlocked(operation)){
        return res.status(400).json({ errorCode: 1, errorMessage: 'Operation is currently executing' });  
    }
    block(operation);

    // Path to the operation file
    const operationFilePath = path.join(__dirname, 'operations', `${operation}.js`);

    // Check if the operation file exists
    if (!fs.existsSync(operationFilePath)) {
        return res.status(404).json({ errorCode: 2, errorMessage: `Operation '${operation}' not found` });
    }

    try {
        // Dynamically import the operation module
        const operationModule = require(operationFilePath);

        // Check if the module exports a default function
        if (typeof operationModule !== 'function') {
            return res.status(500).json({ errorCode: 3, errorMessage: `Operation '${operation}' is not a valid function` });
        }

        // Execute the operation function with the request payload
        const result = await operationModule(req.body);

        // Format and send the result
        res.status(200).json({
            errorCode: 0,
            errorMessage: null,
            ...result,
        });
    } catch (error) {
        console.error(`Error executing operation '${operation}':`, error);
        res.status(500).json({
            errorCode: 4,
            errorMessage: `Failed to execute operation '${operation}': ${error.message}`,
        });
    }
    finally{
        release(operation);
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
