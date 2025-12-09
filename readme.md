# MockFlow


## Project summary

MockFlow is a lightweight toolkit for standing up a local mock backend to accelerate frontend development and prototype API behavior. It exposes configurable HTTP routes that return static payloads, templated responses, or generated data. The goal is fast iteration: define behavior, run a small server, and integrate without waiting on a real backend.

## Core design principles

- Minimal configuration: route definitions are plain files (JSON or YAML) that declare method + path and the response body.
- Deterministic or generated: responses can be fixed fixtures or use simple templating to produce realistic test data.
- Developer ergonomics: small CLI, hot-reload on changes, and built-in CORS for browser testing.
- Extendable: plug in middlewares, adjust defaults, or wire dynamic handlers as needed.

## How it works (high level)

1. The server loads route definitions from a configured location.
2. Each route key follows a "METHOD path" convention (e.g., POST /v1/login).
3. When a request matches, the server returns the associated payload. Optionally it can:
  - Delay the response to simulate latency
  - Use templates or generators to vary data per-request
  - Return status codes and headers defined with the response

## Route definition schema (examples)

- Supported formats: JSON or YAML files containing a map of route keys to response descriptors.
- Route key: string combining HTTP verb and path.
- Response descriptor: can be a raw object (200), or an object with fields like `status`, `headers`, `body`, and `delayMs`.

Example JSON definition (illustrative, adapt to your config):
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

Template example (pseudo-syntax — see project config for supported templating):
```yaml
GET /v1/random-user:
  status: 200
  body:
   id: "{{uuid}}"
   name: "{{name.first}} {{name.last}}"
   createdAt: "{{now}}"
```

## CLI and developer commands

- Start the server in production/test mode with the provided script (see package.json).
- Run in watch mode to reload definitions when files change.
- Configure runtime via environment variables (port, definitions folder, default delay, logging level).

Common tasks:
- serve locally and expose endpoints to your frontend
- run the server while editing mock files to verify behavior instantly
- run tests that depend on the mock backend

(Consult package.json for exact script names used in this repository.)

## Configuration options

Configurable items include:
- HTTP port (environment override)
- Path(s) to load mock files from (single file or a directory)
- Default response delay to emulate network latency
- CORS options and allowed origins
- Logging verbosity and format

## Project layout (typical)

- bin/ or cli/ — small executable to run the mock server
- src/ — server implementation, loader utilities, and template engines
- examples/ — sample mock definitions and usage snippets
- tests/ — unit and integration tests
- config/ or docs/ — additional configuration samples and guidelines

## Extending and customization

- Add custom middlewares: authentication stubs, request inspection, or conditional responses.
- Use generator helpers or integrate faker libraries for more realistic payloads.
- Compose large API surfaces by splitting route files into logical modules and loading them together.

## Best practices

- Keep mocks small and focused per feature to simplify maintenance.
- Version large mock datasets to align with frontend feature branches.
- Use clear route naming and include comments in YAML files for intent.
- Prefer deterministic outputs in unit tests; use generated responses for manual exploratory testing.

## Troubleshooting

- If routes are not loading: verify the loader is pointed at the correct files and that file extensions are supported.
- CORS errors in the browser: confirm `Access-Control-Allow-Origin` is enabled for your development host.
- Unexpected 500 responses: enable debug logs to see template processing or loader errors.

## Contributing guidance

- Add tests for new behavior and ensure linting passes.
- Keep interface changes backward compatible where possible.
- Document any new configuration flags in the docs folder.

## Additional resources

- Check examples in the repository for common patterns.
- Use the CLI help command to list available options and environment variable overrides.

If you need a tailored README with exact commands and script names taken from package.json, indicate that and I will generate the final file using the repository's scripts and configuration values.
