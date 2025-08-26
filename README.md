[![REUSE status](https://api.reuse.software/badge/github.com/open-resource-discovery/reference-application)](https://api.reuse.software/info/github.com/open-resource-discovery/reference-application)

# Open Resource Discovery - Reference Application

This is a reference application that demonstrates the implementation of [Open Resource Discovery](https://open-resource-discovery.github.io/specification/) (ORD) protocol.

It consists of a backend (implemented in TypeScript / Node.js) that exposes some resources (e.g. APIs and Events). Those resources are described via metadata through ORD and the applicable resource definition formats like [OpenAPI v3.0](https://spec.openapis.org/oas/v3.0.3).

## Explore by a role

### ORD Consumer: How to discover the metadata via ORD

There is an example [./docs/http/ORD_Document_API.http](./docs/http/ORD_Document_API.http) file which documents the process and is executable through the [REST Client VSCode Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

### ORD Provider: How to describe your application/service via ORD

An exemplary ORD Provider implementation (ORD Endpoint API) that implements the pull transport of ORD Documents can be found at [./src/api/open-resource-discovery/v1](./src/api/open-resource-discovery/v1/).

## API Access

Protected APIs can be accessed via BasicAuth authentication.
The usernames and passwords can be found in [./src/data/user/users.ts](./src/data/user/users.ts).

The API may be tenant aware with tenant isolation.
Different users may therefore get different results or API features.
The tenants and their configuration be found in [./src/data/user/tenants.ts](./src/data/user/tenants.ts).

## Access Strategies

Some resources in the ORD Reference App are system instance aware.
When fetching the metadata, we need to select for which tenant we need the information.

Therefore we defined custom [Access Strategies](https://open-resource-discovery.github.io/specification/spec-v1/interfaces/document#api-resource-definition_accessstrategies) how the ORD information and the related metadata can be accessed.

To see some examples how the access strategies are used, have a look at [./docs/http/CRM_API.http](./docs/http/CRM_API.http) and [./docs/http/ORD_Document_API.http](./docs/http/ORD_Document_API.http).
They contain documented example requests and are executable through the [REST Client VSCode Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

### `sap.foo.bar:open-global-tenant-id:v1`

The metadata is openly accessible and is system instance aware.
Depending on the **tenant** the metadata return can potentially vary (reflecting customizations).
This strategy therefore only applies to multi-tenant systems.

When fetching metadata for a specific tenant, the request REQUIRES to add an additional HTTP Header `global-tenant-id` with a Tenant ID as a value (use value `740000101` for test purposes in this app).
The application internally maps from the global tenant ID to a local tenant and returns the metadata for the local tenant as requested (see [./src/data/user/tenantMapping.ts](./src/data/user/tenantMapping.ts)).
Therefore the application MUST support the mapping of the global tenant ID to its own tenant IDs.

If the specified header is missing the request will be identical to the `open` access strategy.
Whether this is supported or not is defined by additionally adding an `open` access strategy.
In this case metadata would be returned without considering tenant specifics.

### `sap.foo.bar:open-local-tenant-id:v1`

The metadata is openly accessible, but system instance aware.
Depending tenant the metadata that is return can vary (reflecting customizations).

When fetching metadata for a specific tenant, the request REQUIRES an additional HTTP Header `local-tenant-id` with a local tenant ID (that the application locally understands) as a value (use value `T1` for test purpose in this app).

If the specified header is missing the request will be identical to the `open` access strategy.
Whether this is supported is defined by additionally supporting the `open` access strategy.
In this case metadata would be returned without considering tenant specifics.

## Extensibility

The CRM API can be extended with custom fields.
Each tenant can have `fieldExtensions` defined in their tenant configuration.

The tenants and their configuration be found in [src/data/user/tenants.ts](/src/data/user/tenants.ts).



## How to run app locally

### Prerequisites

Install (Node.js](https://nodejs.org/en/) v20 or up

### Run the app
```bash
npm install
npm run dev
```

## ORD Implementation / Aspects

| Feature                 | Status |
| ----------------------- | ------ |
| ORD Document with open access strategy | ✅ |
| ORD Document with [custom access strategy](docs/README.md#access-strategies) | ✅ |
| System instance aware ORD Document (optional API resources) | ✅ |
| System instance aware resource definitions (e.g. field extensibility) | ✅ |
| Protected metadata, accessible via SAP aligned Access Strategy | 🟥 |

If you miss some features or use case, please get in contact.


## License

Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/open-resource-discovery/reference-application).