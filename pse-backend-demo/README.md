# Express TypeScript Server


## 🛠️ Getting Started

### Video Demo

For a visual guide, watch the [video demo](https://github.com/token-attachments/assets/b1698dac-d582-45a0-8d61-31131732b74e) to see the setup and running of the project.

#### ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### 🏃‍♂️ Running the Project

- Development Mode: `pnpm dev`
- Building: `pnpm build`
- Production Mode: Set `NODE_ENV="production"` in `.env` then `pnpm build && pnpm start:prod`

## 📁 Folder Structure

```code
├── biome.json
├── Dockerfile
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── src
│   ├── api
│   │   ├── healthCheck
│   │   │   ├── __tests__
│   │   │   │   └── healthCheckRouter.test.ts
│   │   │   └── healthCheckRouter.ts
│   │   └── token
│   │       ├── __tests__
│   │       │   ├── tokenRouter.test.ts
│   │       │   └── tokenService.test.ts
│   │       ├── tokenController.ts
│   │       ├── tokenModel.ts
│   │       ├── tokenRepository.ts
│   │       ├── tokenRouter.ts
│   │       └── tokenService.ts
│   ├── api-docs
│   │   ├── __tests__
│   │   │   └── openAPIRouter.test.ts
│   │   ├── openAPIDocumentGenerator.ts
│   │   ├── openAPIResponseBuilders.ts
│   │   └── openAPIRouter.ts
│   ├── common
│   │   ├── __tests__
│   │   │   ├── errorHandler.test.ts
│   │   │   └── requestLogger.test.ts
│   │   ├── middleware
│   │   │   ├── errorHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── models
│   │   │   └── serviceResponse.ts
│   │   └── utils
│   │       ├── commonValidation.ts
│   │       ├── envConfig.ts
│   │       └── httpHandlers.ts
│   ├── index.ts
│   └── server.ts
├── tsconfig.json
└── vite.config.mts
```
