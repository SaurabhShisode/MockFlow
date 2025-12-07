# MockFlow

A simple, lightweight project scaffold for creating mock APIs and UI flow prototypes. Use MockFlow to quickly define endpoints, return static or generated responses, and iterate on frontend integration without a live backend.

## Features
- Define mock endpoints in JSON or YAML
- Support for static responses and templated/generated data
- CORS enabled for frontend development
- Configurable routes and delays to simulate latency
- Simple CLI to run and watch mock definitions

## Requirements
- Node.js 14+ (or adjust to your runtime)
- npm or yarn

## Installation
1. Clone the repository:
    ```
    git clone <repo-url> .
    ```
2. Install dependencies:
    ```
    npm install
    ```

## Quick start
1. Create a mock definition file (examples/mocks.json):
    ```json
    {
      "GET /api/users": [{ "id": 1, "name": "Alice" }]
    }
    ```
2. Run the mock server:
    ```
    npm start
    ```
3. Open http://localhost:3000/api/users

## Configuration
- Port: configurable via `PORT` environment variable
- Routes: load from `mocks/` folder (`.json`, `.yaml`) or a single `mocks.json`
- Latency: set `DEFAULT_DELAY_MS` in config to simulate network delay

## Development
- Start in watch mode:
  ```
  npm run dev
  ```
- Linting and formatting:
  ```
  npm run lint
  npm run format
  ```

## Testing
- Run unit tests:
  ```
  npm test
  ```

## Contributing
- Fork the repo, create a branch, open a PR
- Keep changes small and focused
- Add tests for new features or bug fixes

## License
Specify a license in LICENSE file (MIT recommended).

## Contact
For issues or feature requests, open an issue in the repository.
