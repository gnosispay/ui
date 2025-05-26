# ui

React components and screens to kickstart your integration to the Gnosis Pay API.

# Environment variables
Set this variables in a `.env` file
- VITE_PSE_RELAY_SERVER_ROUTE the url of the relay server to request the PSE ephemeral token, e.g https://my-server.com/get-token
- VITE_IFRAME_HOST (optional, staging is used per default) Gnosis pay public Partner Secure Elements endpoint
- VITE_BASE_URL (optional, staging url is used per default) Gnosis pay api endpoint

# Commands
- `pnpm install` to install dependancies
- `pnpm dev` to run the ui locally
- `pnpm lint --fix` to lint and fix any error that can be fixed for you
- `pnpm build` to build
- `pnpm generate-api-types` to generate a client and types to interract with the gnosispay api