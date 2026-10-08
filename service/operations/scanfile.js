const { exec } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'scripts', 'scanWin.bat');

/**
 * Executes the scanWin.bat script with the provided category
 * and formats the output as required.
 *
 * @param {Object} payload - The payload containing the category.
 * @returns {Promise<Object>} - The formatted result.
 */
module.exports = async (payload) => {
    return new Promise((resolve, reject) => {
        const { category } = payload;

        if (!category) {
            return resolve({
                errorCode: 1,
                errorMessage: 'Category is required',
            });
        }

        // Path to the bat file
        const batFilePath = scriptPath;

        // Execute the bat file with the category as a parameter
        exec(`cmd.exe /c ${batFilePath} ${category}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing scanWin.bat: ${error.message}`);
                return resolve({
                    errorCode: 99,
                    errorMessage: 'Internal server error',
                });
            }

            try {
                const message = stdout.trim();
                const output = JSON.parse(message);

                const result = {
                    errorCode: output.errorCode,
                };

                if (output.success === false || output.errorCode !== 0) {
                    result.errorMessage = output.message;
                } else {
                    result.message = output.message;
                    result.filename = output.filename;
                    result.filepath = output.filepath;
                }

                resolve(result);
            } catch (parseError) {
                console.error(`Error parsing JSON output: ${parseError.message}`);
                reject({
                    errorCode: 4,
                    errorMessage: 'Failed to parse script output',
                });
            }
        });
    });
};