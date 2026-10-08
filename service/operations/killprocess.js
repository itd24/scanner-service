const { exec } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'scripts', 'killProcess.bat');

/**
 * Executes the killProcess.bat script with the provided process name
 * and formats the output as required.
 *
 * @param {Object} payload - The payload containing the process name.
 * @returns {Promise<Object>} - The formatted result.
 */
module.exports = async (payload) => {
    return new Promise((resolve, reject) => {
        const { processName } = payload;

        if (!processName) {
            return resolve({
                errorCode: 1,
                errorMessage: 'Category is required',
            });
        }

        // Path to the bat file
        const batFilePath = scriptPath;

        // Execute the bat file with the processName as a parameter
        exec(`cmd.exe /c ${batFilePath} "${processName}"`, (error, stdout, stderr) => {                        
            if (error) {
                console.error(`Error executing killProcess.bat: ${error.message}`);
                return resolve({
                    errorCode: 99,
                    errorMessage: error.message//'Internal server error',
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
                    result.killedPIDs = output.killedPIDs;
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