---
title: ORD Sample Application — ISS Reference Application
layout: default
---

# ORD Sample Application

**ISS Reference Application — SAP BTP ORD Integration Demo**

[![ORD](https://img.shields.io/badge/ORD-1.12-blue)](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/introduction)
[![Policy](https://img.shields.io/badge/policy-sap%3Acore%3Av1-blue)](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/introduction)
[![BTP](https://img.shields.io/badge/SAP%20BTP-Cloud%20Foundry-0a6ed1)](https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com)
[![Region](https://img.shields.io/badge/region-eu01--canary-lightgrey)](https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com)

This application demonstrates a complete [Open Resource Discovery (ORD)](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/introduction) integration on SAP BTP, exposing a CRM API with tenant-aware metadata discovery. It is branched from the [ORD reference application (PR #26)](https://github.com/open-resource-discovery/reference-application/pull/26).

**Deployed at:** `https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com`

---

## How ORD Discovery Works

An ORD-aware consumer (e.g. SAP Integration Hub) discovers APIs in three steps:

```
1. GET /.well-known/open-resource-discovery
        ↓  lists document URLs
2. GET /open-resource-discovery/v1/documents/system-version
        ↓  describes all API resources, packages, products
3. GET /iss/v1/openapi/oas3.json
        ↓  full OpenAPI 3.0 specification
```

---

## ORD Document API — `open-resource-discovery/v1`

### `GET /.well-known/open-resource-discovery`

|                 |                                                                                                                                              |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| **Auth**        | Open                                                                                                                                         |
| **Description** | ORD well-known configuration — lists available ORD document URLs and their access strategies. This is the entry point for all ORD consumers. |

```bash
curl https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/.well-known/open-resource-discovery | jq .
```

<details>
<summary>Response payload</summary>

```json
{
  "openResourceDiscoveryV1": {
    "documents": [
      {
        "url": "/open-resource-discovery/v1/documents/system-version",
        "accessStrategies": [{ "type": "open" }],
        "perspective": "system-version"
      },
      {
        "url": "/open-resource-discovery/v1/documents/system-instance",
        "accessStrategies": [{ "type": "basic-auth" }],
        "perspective": "system-instance"
      }
    ]
  }
}
```

</details>

---

### `GET /open-resource-discovery/v1/documents/system-version`

|                 |                                                                                                                                                          |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Auth**        | Open                                                                                                                                                     |
| **Description** | Static ORD document (system-version perspective). Describes the CRM API resource, package, product, and consumption bundles. No authentication required. |

```bash
curl https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/open-resource-discovery/v1/documents/system-version | jq .
```

<details>
<summary>Response payload</summary>

```json
{
  "openResourceDiscovery": "1.12",
  "policyLevels": ["sap:core:v1"],
  "perspective": "system-version",
  "describedSystemVersion": { "version": "1.1.1" },
  "describedSystemInstance": {
    "baseUrl": "https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com"
  },
  "products": [
    {
      "ordId": "sap.xref:product:Intelligent_Selling_Services:",
      "title": "ORD Reference App",
      "vendor": "sap:vendor:SAP:",
      "shortDescription": "Open Resource Discovery Reference Application"
    }
  ],
  "packages": [
    {
      "ordId": "sap.xref:package:Intelligent_Selling_Services-apis:v1",
      "title": "ORD Reference Application APIs",
      "shortDescription": "This is a reference application for the Open Resource Discovery protocol",
      "version": "1.0.0",
      "policyLevels": ["sap:core:v1"],
      "partOfProducts": ["sap.xref:product:Intelligent_Selling_Services:"],
      "vendor": "sap:vendor:SAP:",
      "tags": ["reference application"],
      "packageLinks": [
        {
          "type": "license",
          "url": "https://github.com/open-resource-discovery/reference-application/blob/main/LICENSE"
        }
      ],
      "links": [
        {
          "title": "ORD Reference app description",
          "url": "https://github.com/open-resource-discovery/reference-application/blob/main/README.md"
        },
        {
          "title": "ORD Reference app GitHub repository",
          "url": "https://github.com/open-resource-discovery/reference-application/"
        }
      ],
      "labels": {
        "example:customLabel": ["labels are more flexible than tags as you can define your own keys"]
      }
    }
  ],
  "apiResources": [
    {
      "ordId": "sap.xref:apiResource:iss:v1",
      "title": "ISS SAMPLE API",
      "shortDescription": "The CRM API allows you to manage customers...",
      "description": "This API is **protected** via BasicAuth and is tenant aware",
      "version": "1.0.0",
      "visibility": "internal",
      "releaseStatus": "beta",
      "apiProtocol": "rest",
      "partOfPackage": "sap.xref:package:Intelligent_Selling_Services-apis:v1",
      "partOfConsumptionBundles": [
        { "ordId": "sap.xref:consumptionBundle:basicAuth:v1" }
      ],
      "entryPoints": ["/iss/v1"],
      "apiResourceLinks": [
        { "type": "api-documentation", "url": "/swagger-ui.html?urls.primaryName=CRM%20V1%20API" }
      ],
      "resourceDefinitions": [
        {
          "type": "openapi-v3",
          "mediaType": "application/json",
          "url": "/iss/v1/openapi/oas3.json",
          "accessStrategies": [
            { "type": "custom", "customType": "sap.xref:open-global-tenant-id:v1" },
            { "type": "custom", "customType": "sap.xref:open-local-tenant-id:v1" },
            { "type": "open" }
          ]
        }
      ],
      "extensible": {
        "supported": "manual",
        "description": "This API can be extended with custom fields."
      },
      "changelogEntries": [
        { "version": "0.3.0", "date": "2021-05-25", "releaseStatus": "beta" }
      ]
    }
  ],
  "consumptionBundles": [
    {
      "ordId": "sap.xref:consumptionBundle:noAuth:v1",
      "version": "1.0.0",
      "title": "Unprotected resources",
      "shortDescription": "Bundle of unprotected resources",
      "description": "This Consumption Bundle contains all resources of the reference app which are unprotected and do not require authentication"
    }
  ],
  "eventResources": [],
  "entityTypes": [],
  "tombstones": []
}
```

</details>

---

### `GET /open-resource-discovery/v1/documents/system-instance`

|                 |                                                                                                                                                                                                     |
|-----------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Auth**        | Basic Auth                                                                                                                                                                                          |
| **Description** | Dynamic ORD document (system-instance perspective). Tenant-aware: credentials identify which tenant's metadata to return. The CRM API resource is omitted when the tenant does not have it enabled. |

```bash
curl -H 'Authorization: Basic Zm9vOmJhcg==' \
  https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/open-resource-discovery/v1/documents/system-instance | jq .
```

<details>
<summary>Response payload (tenant T1 — credentials: foo/bar)</summary>

```json
{
  "openResourceDiscovery": "1.12",
  "policyLevels": ["sap:core:v1"],
  "perspective": "system-instance",
  "describedSystemVersion": { "version": "1.1.1" },
  "describedSystemInstance": { "localId": "T1" },
  "description": "This is an example ORD document which describes the entire reference app in one document.\nThis ORD Document is specific to tenant \"T1\"",
  "products": [
    {
      "ordId": "sap.xref:product:Intelligent_Selling_Services:",
      "title": "ORD Reference App",
      "vendor": "sap:vendor:SAP:",
      "shortDescription": "Open Resource Discovery Reference Application"
    }
  ],
  "packages": [
    {
      "ordId": "sap.xref:package:Intelligent_Selling_Services-apis:v1",
      "title": "ORD Reference Application APIs",
      "version": "1.0.0",
      "policyLevels": ["sap:core:v1"],
      "vendor": "sap:vendor:SAP:"
    }
  ],
  "apiResources": [
    {
      "ordId": "sap.xref:apiResource:iss:v1",
      "title": "ISS SAMPLE API",
      "version": "1.0.0",
      "visibility": "internal",
      "releaseStatus": "beta",
      "apiProtocol": "rest",
      "entryPoints": ["/iss/v1"],
      "extensible": { "supported": "manual", "description": "This API can be extended with custom fields." }
    }
  ],
  "eventResources": [],
  "consumptionBundles": [
    {
      "ordId": "sap.xref:consumptionBundle:noAuth:v1",
      "title": "Unprotected resources"
    }
  ],
  "entityTypes": [],
  "tombstones": []
}
```

</details>

---

## CRM API — `/iss/v1`

> All data endpoints require **Basic Auth**. See [test credentials](#test-credentials) below.

### `GET /iss/v1/openapi/oas3.json`

|                 |                                                                                                                                                                                                                            |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Auth**        | Open (tenant header optional)                                                                                                                                                                                              |
| **Description** | OpenAPI 3.0 specification for the CRM API. Pass `local-tenant-id` or `global-tenant-id` header to get a tenant-specific schema with field extensions on the `Customer` object.                                             |
| **Links**       | [Raw JSON](https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/iss/v1/openapi/oas3.json) · [Swagger UI](https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/swagger-ui.html?url=/iss/v1/openapi/oas3.json) |

```bash
curl https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/iss/v1/openapi/oas3.json | jq .
```

---

### `GET /iss/v1/customers`

|                 |                                                            |
|-----------------|------------------------------------------------------------|
| **Auth**        | Basic Auth                                                 |
| **Description** | Returns all customers for the authenticated user's tenant. |

```bash
curl -u foo:bar \
  https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/iss/v1/customers | jq .
```

<details>
<summary>Response payload</summary>

```json
{
  "value": [
    {
      "id": 1,
      "firstName": "Hans",
      "lastName": "Wurst",
      "email": "hanswurst@example.com"
    }
  ]
}
```

</details>

---

### `GET /iss/v1/customers/:id`

|                 |                                                                                                          |
|-----------------|----------------------------------------------------------------------------------------------------------|
| **Auth**        | Basic Auth                                                                                               |
| **Description** | Returns a single customer by numeric ID for the authenticated user's tenant. Returns `404` if not found. |

```bash
curl -u foo:bar \
  https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com/iss/v1/customers/1 | jq .
```

<details>
<summary>Response payload</summary>

```json
{
  "id": 1,
  "firstName": "Hans",
  "lastName": "Wurst",
  "email": "hanswurst@example.com",
  "extensions": {
    "customField": "value"
  }
}
```

</details>

#### Customer schema

| Field        | Type             | Required | Description                                                     |
|--------------|------------------|----------|-----------------------------------------------------------------|
| `id`         | `number`         | ✓        | Unique identifier (≥ 0)                                         |
| `firstName`  | `string`         | ✓        | First name                                                      |
| `lastName`   | `string`         | ✓        | Last name                                                       |
| `email`      | `string` (email) | ✓        | Email address                                                   |
| `extensions` | `object`         | —        | Tenant-specific field extensions `{ [name]: string \| number }` |

---

## Test Credentials

| Tenant | Username  | Password      | CRM enabled |
|--------|-----------|---------------|-------------|
| T1     | `foo`     | `bar`         | ✓           |
| T2     | `bar`     | `foo`         | ✓           |
| T2     | `mariusz` | `mariusz1234` | ✓           |

Basic Auth header for T1: `Authorization: Basic Zm9vOmJhcg==`

---

## SAP Integration Hub

The CRM API is registered in the SAP Integration Hub via ORD:

- **ORD ID:** `sap.xref:apiResource:iss:v1`
- **Hub overview (staging):** [int.hub.cloud.sap/api/sap-xref-iss-v1/overview?context=staging](https://int.hub.cloud.sap/api/sap-xref-iss-v1/overview?context=staging)

---

## References

| Resource                                | Link                                                                                                                                         |
|-----------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| ORD Specification                       | [ORD Introduction & Specification](https://pages.github.tools.sap/CentralEngineering/open-resource-discovery-specification/introduction)     |
| Source — Reference Application (PR #26) | [github.com/open-resource-discovery/reference-application/pull/26](https://github.com/open-resource-discovery/reference-application/pull/26) |
| API Metadata Validator Playground       | [pages.github.tools.sap/CPA/api-metadata-validator/playground](https://pages.github.tools.sap/CPA/api-metadata-validator/playground)         |
| App Home                                | [ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com](https://ordSampleAppMD.cfapps.eu01-canary.hana.ondemand.com)                           |
