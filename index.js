const core = require('@actions/core');
const sdk = require('@jiridj/wm-apigw-config-sdk');
const winston = require('winston');

let logger;

/**
 * Register an API based upon the information from the spec.
 * 
 * @param {String} spec The specification file
 */
async function registerApi(spec) {
    let api;

    const info = sdk.getSpecInfo(spec);
    logger.debug(`Registering ${info.apiName} with version ${info.apiVersion}`);

    try {
        const versions = await sdk.findApiByNameAndVersion(info.apiName);

        // An error is thrown if no versions exist, so we would never get here 
        // in that case.
        let current = versions.find(item => item.api.apiVersion == info.apiVersion);
        if (current) {
            // The version already exists and only needs updating.
            current = current.api;
        }
        else {
            // The version does not exist and we have to add it.
            logger.debug(`Adding new version ${info.apiVersion}`);
            current = await sdk.createApiVersion(versions[0].api.id, info.apiVersion);
        }

        logger.debug('Updating specification');
        api = await sdk.updateApi(current.api, spec, info.apiType);
    }
    catch(error) {
        if (error.startsWith('Failed to find')) {
            // The API does not exist and we have to create it.
            logger.debug('Creating new API');
            api = await sdk.createApi(spec, info.apiType);
        }
        else {
            throw error;
        }
    }

    return api;
}

/**
 * Configures a logger for this action. 
 * 
 * @param {Boolean} debug     Enable debug logging.
 */
function setupLogger(debug) {
    logger = winston.createLogger({
        transports: [ 
            new winston.transports.Console({
                level: debug ? 'debug' : 'info',
                timestamp: true,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.colorize(),
                    winston.format.printf(log => `${log.timestamp} - ${log.level} ${log.message}`)
                )
            })
         ]
    });    
}

/**
 * Main logic for the GitHub Action step which parses inputs, invokes the 
 * proper function and sets outputs.
 */
async function run() {
    try {
        // Setup logging
        setupLogger((core.getInput('debug').toLowerCase() == 'true'));

        // Setup the API Gateway connection parameters
        logger.debug(`Setup connection to ${core.getInput('apigw-url')}`);
        sdk.setup(
            core.getInput('apigw-url'), 
            core.getInput('apigw-username'), 
            core.getInput('apigw-password')
        );

        // Register the new API based on its specification
        let api = await registerApi(core.getInput('api-spec'));

        // Should the API be activated after registration?
        if (core.getInput('set-active').toLowerCase() == 'true') {
            logger.debug(`Activating ${api.apiName} version ${api.apiVersion}`);
            api = await sdk.activateApi(api.id);
        }

        if (api != null) {
            // Set the outputs according to the found API object
            core.setOutput('api-id', api.id);
            core.setOutput('api-name', api.apiName);
            core.setOutput('api-version', api.apiVersion);
            core.setOutput('api-type', api.type);
            core.setOutput('api-is-active', api.isActive);
        }
        else {
            core.setFailed('Failed to create API project!');
        }
    }
    catch(error) {
        core.setFailed(error.message);
    }
}

module.exports = {
    registerApi,
    setupLogger,
    run
}

if (require.main === module) {
    run();
}