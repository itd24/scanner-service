const express = require('express');
const fs = require('fs');
const path = require('path');


async function main(){
    const [, , operation, jsonData] = process.argv;

    // Check if operation is provided
    if (!operation) {
        console.error(JSON.stringify({ errorCode: 1, errorMessage: "Operation is required" }));
        process.exit(1);
    }

    // Path to the operation file
    const operationFilePath = path.join(__dirname, 'operations', `${operation}.js`);

    // Check if the operation file exists
    if (!fs.existsSync(operationFilePath)) {
        console.error(JSON.stringify({ errorCode: 2, errorMessage: `Operation '${operation}' not found` }));
        process.exit(1);
    }

    try {
        // Dynamically import the operation module
        const operationModule = require(operationFilePath);

        // Check if the module exports a default function
        if (typeof operationModule !== 'function') {
            console.error(JSON.stringify({ errorCode: 3, errorMessage: `Operation '${operation}' is not a valid function` }));
            process.exit(1);
        }

        let payload = {};
        if (jsonData) {
            try {
                payload = JSON.parse(jsonData);
            } catch (error) {
                console.error(JSON.stringify({ errorCode: 5, errorMessage: "Invalid JSON input" }));
                process.exit(1);
            }
        }

        // Execute the operation function with the request payload
        const result = await operationModule(payload);

        // Output result as JSON
        console.log(JSON.stringify({ errorCode: 0, errorMessage: null, ...result }));
    } catch (error) {
        console.error(JSON.stringify({
            errorCode: 4,
            errorMessage: `Failed to execute operation '${operation}': ${error.message}`
        }));
        process.exit(1);
    }
}
main();