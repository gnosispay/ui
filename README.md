# ui

User interface for Gnosis Pay.

# Environment variables
Set this variables in a `.env` file
- `VITE_PSE_RELAY_SERVER_ROUTE` the url of the relay server to request the PSE ephemeral token, e.g https://my-server.com/get-token
- `VITE_PSE_APP_ID` the app id that you after registering as a partner to Gnosis Pay, e.g `gp_abc...`
- `VITE_IFRAME_HOST` (optional, prod is used per default) Gnosis pay public Partner Secure Elements endpoint
- `VITE_GNOSIS_PAY_API_BASE_URL` (optional, prod url is used per default) Gnosis pay api endpoint
- `VITE_ZENDESK_KEY` (optional) Zendesk key to enable Zendesk chat

# Commands
- `pnpm install` to install dependancies
- `pnpm dev` to run the ui locally
- `pnpm lint --fix` to lint and fix any error that can be fixed for you
- `pnpm build` to build
- `pnpm generate-api-types` to generate a client and types to interract with the gnosispay api
