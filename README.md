# webMethods API Gateway "Register API" action for GitHub Actions

![build](https://img.shields.io/github/actions/workflow/status/jiridj/wm-apigw-actions-register-api/ci.yml?branch=main)
![coverage](https://img.shields.io/codecov/c/gh/jiridj/wm-apigw-actions-register-api?token=35GE4E56NO)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/jiridj/wm-apigw-actions-register-api)
[![open issues](https://img.shields.io/github/issues-raw/jiridj/wm-apigw-actions-register-api)](https://github.com/jiridj/wm-apigw-actions-register-api/issues)

With this action you can register an API or API version in webMethods API Gateway. The step output from this action provides information you can use in following steps in your GitHub Actions workflow job.

If you feel a particular feature is missing, or if you have found a bug, feel free to submit a pull request! :wink:

## Table of contents

- [Inputs](#inputs)
- [Outputs](#outputs)
- [Example](#example)
- [Questions and Issues](#questions-and-issues)
- [License Summary](#license-summary)

## Inputs

|Input|Required|Description|
|-|-|-|
|apigw-url|yes|The url of your (master) API Gateway instance.|
|apigw-username|yes|The API Gateway user to execute this action with.|
|apigw-password|yes|The password for the API Gateway user to execute this action with.|
|api-spec|yes|The file or url for the API specification.|
|set-active|no|Activate the API project after registration. Default if false.|
|debug|no|Use debug logging. Default if false.|

## Outputs

|Output|Description|
|-|-|
|api-id|The unique identifier of the API project.|
|api-name|The name of the API project. This will be pulled from the API specification.|
|api-version|The version of the API project. This will be pulled from the API specification.|
|api-type|The type of the API project.|
|api-is-active|Indicates whether the API project is currently active.|

## Example

The action reads the API name and version from the specification file and applies following logic:
1. If no API exists with this name, create a new API.
2. If the API exists with the specified version, update it. 
3. If the API exists but not with the specified version, a new version is created.

This example workflow illustrates how to use the action in your CICD configuration.

``` yaml
name: 'Example workflow'
on: [ push ]
jobs:
  register-and-print-api-info:
    runs-on: ubuntu-latest
    steps: 
      - uses: jiridj/wm-apigw-actions-register-api@v1
        id: register-api
        with: 
          apigw-url: ${{ secrets.APIGW_URL }}
          apigw-username: ${{ secrets.APIGW_USERNAME }}
          apigw-password: ${{ secrets.APIGW_PASSWORD }}
          api-spec: https://petstore3.swagger.io/api/v3/openapi.json
          set-active: true
          debug: ${{ secrets.ACTIONS_STEP_DEBUG }}
      - name: print-api-info
        run: |
          echo "ID      = ${{ steps.register-api.outputs.api-id }}"
          echo "Name    = ${{ steps.register-api.outputs.api-name }}"
          echo "Version = ${{ steps.register-api.outputs.api-version }}"
          echo "Type    = ${{ steps.register-api.outputs.api-type }}"
          echo "Active  = ${{ steps.register-api.outputs.api-is-active }}"
```

## Questions and Issues

Any questions or issues can be raised via the repository [issues](https://github.com/jiridj/wm-apigw-actions-register-api/issues).

## License Summary

This code is made avialable under the [MIT license](./LICENSE).
