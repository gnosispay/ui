# PSE backend demo

This is a reference implementation of a backend relaying a front-end request to `/token` to a mTLS authenticated `/ephemeral-token` of the Gnosis Pay PSE service. The ephemeral-token is then returned back.

More info [in the Partner Secure Elements guide](https://docs.gnosispay.com/pse-integration).

This server exposes the following routes:
- `/token` to relay an ephemeral-token request
- `/health-check` to verify the liveness of the sever

## 🛠️ Getting Started

#### ⚙️ Environment Configuration

Copy `.env.template` to `.env` to get started

- `NODE_ENV` Options: 'development', 'production'
- `PORT` The port your server will listen on
- `HOST` Hostname for the server e.g "localhost"
- `CLIENT_CERT` the certificate signed by Gnosis Pay
- `CLIENT_KEY` your private key
- `GNOSIS_PSE_PRIVATE_API_BASE_URL` the authenticated api of the PSE service, e.g "https://api-pse.stg.gnosispay.com"

#### 🏃‍♂️ Running the Project

- Development Mode: `pnpm dev`
- Building: `pnpm build`
- Production Mode: Set `NODE_ENV="production"` in `.env` then `pnpm build && pnpm start:prod`