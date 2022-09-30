const fs = require('fs');
const index = require('./index');
const sdk = require('@jiridj/wm-apigw-config-sdk');

jest.mock('@jiridj/wm-apigw-config-sdk');

jest.spyOn(sdk, 'getSpecInfo').mockImplementation(() => {
    return { 
        apiName: 'Swagger Petstore - OpenAPI 3.0',
        apiVersion: '1.0.11',
        apiType: 'openapi'
    };
});

const mockedSdk = jest.mocked(sdk, true);

const versions = JSON.parse(fs.readFileSync('resources/api-versions.json'));
const details = JSON.parse(fs.readFileSync('resources/api-details.json'));

beforeAll(() => {
    index.setupLogger(false);
});

describe('test registerApi', () => {

    it('should create a new API', async () => {
        mockedSdk.findApiByNameAndVersion.mockRejectedValueOnce('Failed to find');
        mockedSdk.createApi.mockResolvedValue(details);

        const result = await index.registerApi('https://petstore3.swagger.io/api/v3/openapi.json');
        expect(result.id).toEqual(details.id);
        expect(result.apiName).toEqual(details.apiName);
        expect(result.apiVersion).toEqual(details.apiVersion);
    });

    it('should add a new version of the API', async () => {
        mockedSdk.findApiByNameAndVersion.mockResolvedValueOnce([versions[0]]);
        mockedSdk.createApiVersion.mockResolvedValueOnce(versions[1].api);
        mockedSdk.updateApi.mockResolvedValueOnce(details);

        const result = await index.registerApi('https://petstore3.swagger.io/api/v3/openapi.json');
        expect(result.id).toEqual(details.id);
        expect(result.apiName).toEqual(details.apiName);
        expect(result.apiVersion).toEqual(details.apiVersion);
    });

    it('should update an existing version of the API', async () => {
        mockedSdk.findApiByNameAndVersion.mockResolvedValueOnce(versions);
        mockedSdk.deactivateApi.mockResolvedValueOnce(details);
        mockedSdk.updateApi.mockResolvedValueOnce(details);

        const result = await index.registerApi('https://petstore3.swagger.io/api/v3/openapi.json');
        expect(result.id).toEqual(details.id);
        expect(result.apiName).toEqual(details.apiName);
        expect(result.apiVersion).toEqual(details.apiVersion);
    });

});

describe('test run', () => {

    it('should succeed', async () => {
        // GitHub Actions inputs are passed into the step as environment variables
        process.env['INPUT_APIGW-URL'] = 'http://localhost:5555';
        process.env['INPUT_APIGW-USERNAME'] = 'Administrator';
        process.env['INPUT_APIGW-PASSWORD'] = 'manage';
        process.env['INPUT_API-SPEC'] = 'https://petstore3.swagger.io/api/v3/openapi.json';
        process.env['INPUT_ACTIVATE-AFTER-CREATION'] = false;
        process.env['INPUT_DEBUG'] = true;

        mockedSdk.findApiByNameAndVersion.mockResolvedValueOnce(versions);
        mockedSdk.updateApi.mockResolvedValueOnce(details);

        await index.run();
    });

});
