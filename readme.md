# MockFlow

MockFlow is a lightweight local mock-backend toolkit for frontend development and API prototyping. It exposes configurable HTTP routes that return static fixtures, templated responses, or generated data so frontends can iterate independently of a real backend.

## What it does
- Hosts HTTP endpoints based on filesystem definitions (JSON/YAML).
- Returns static or dynamic responses (status, headers, body).
- Supports response delays, templating, and per-request data generation.
- Hot-reloads definitions for fast developer feedback and includes CORS support for browser testing.

## Core features
- File-based route definitions (single files or directories).
- Simple "METHOD path" keys that map to response descriptors.
- Support for raw responses or structured descriptors with status, headers, body, and delay.
- Pluggable templating/generator helpers to produce UUIDs, names, timestamps, or faker-based data.
- CLI with run/watch modes and environment-driven configuration.

## How it works (high level)
1. Load route definition files (JSON/YAML) from configured paths.
2. Parse each top-level key as "METHOD path" (e.g., GET /v1/users).
3. Match incoming requests to the route key and return the defined response:
  - Use raw body or apply template rendering/generators per-request.
  - Apply configured status, headers, and optional delay.
  - Emit logs according to the configured verbosity.

## Route definition schema (examples)
- Supported formats: JSON or YAML.
- Route key: "VERB path" (case-insensitive method).
- Response descriptor:
  - Raw value => 200 response with that body.
  - Object with optional fields: status (number), headers (object), body (any), delayMs (number).

Example JSON:
```json
{
  "GET /v1/users": {
   "status": 200,
   "headers": { "content-type": "application/json" },
   "body": [
    { "id": "u_01", "name": "Sam", "email": "sam@example.test" },
    { "id": "u_02", "name": "Nora", "email": "nora@example.test" }
   ]
  },
  "POST /v1/login": {
   "status": 201,
   "body": { "token": "mock-token-123", "userId": "u_01" },
   "delayMs": 300
  }
}
```

Example YAML with templating (pseudo-syntax — adapt to your template engine):
```yaml
GET /v1/random-user:
  status: 200
  body:
   id: "{{uuid}}"
   name: "{{name.first}} {{name.last}}"
   createdAt: "{{now}}"
```

## Technologies used (typical stack and libraries)

- MERN :
  - MongoDB — simple persisted store for demo datasets and stateful mocks.
  - Express — API layer and route hosting (server).
  - React — example frontend to consume the mock APIs.
  - Node.js — runtime for server and build scripts.
- Firebase:
  - Firebase Auth — use real or stubbed auth flows for frontend integration testing.
  - Firestore / Realtime Database — hosted datastore alternative for demos and collaboration.


