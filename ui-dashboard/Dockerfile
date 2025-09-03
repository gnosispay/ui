FROM node:22.18.0-alpine3.21 AS base
FROM base AS builder

ENV HUSKY=0
ENV CI=true
# See https://github.com/pnpm/pnpm/issues/784
ENV PNPM_HOME=/usr/local/bin

RUN apk update
RUN apk add --no-cache dumb-init libc6-compat openssl \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/cache/apk/*

WORKDIR /app

RUN corepack enable && pnpm add -g turbo@2.0.12
COPY . .
RUN turbo prune @gnosispay/web --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat python3 make gcc g++ libc-dev linux-headers
RUN apk update
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GNOSIS_PAY_API_URL \
    NEXT_PUBLIC_FRACTAL_CLIENT_ID \
    NEXT_PUBLIC_FRACTAL_FRONTEND_URL \
    NEXT_PUBLIC_ENABLE_INTERCOM \
    NEXT_PUBLIC_INTERCOM_APP_ID \
    NEXT_PUBLIC_ORDER_DEPOSIT_ADDRESS \
    NEXT_PUBLIC_PAYMENTOLOGY_PUBLIC_KEY \
    NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_RECEIVER_ADDRESS \
    NEXT_PUBLIC_SENTRY_DSN= \
    NEXT_PUBLIC_SPENDER_ADDRESS \
    NEXT_PUBLIC_WALLET_CONNECT_ID \
    NEXT_PUBLIC_ENABLE_MARKETING_SCRIPTS \
    NEXT_PUBLIC_SPINDL_SDK_KEY \ 
    NEXT_PUBLIC_SAFE_TRANSACTION_API_URL \
    NEXT_PUBLIC_ZENDESK_KEY

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_GNOSIS_PAY_API_URL=$NEXT_PUBLIC_GNOSIS_PAY_API_URL \
    NEXT_PUBLIC_FRACTAL_CLIENT_ID=$NEXT_PUBLIC_FRACTAL_CLIENT_ID \
    NEXT_PUBLIC_FRACTAL_FRONTEND_URL=$NEXT_PUBLIC_FRACTAL_FRONTEND_URL \
    NEXT_PUBLIC_ENABLE_INTERCOM=$NEXT_PUBLIC_ENABLE_INTERCOM \
    NEXT_PUBLIC_INTERCOM_APP_ID=$NEXT_PUBLIC_INTERCOM_APP_ID \
    NEXT_PUBLIC_ORDER_DEPOSIT_ADDRESS=$NEXT_PUBLIC_ORDER_DEPOSIT_ADDRESS \
    NEXT_PUBLIC_PAYMENTOLOGY_PUBLIC_KEY=$NEXT_PUBLIC_PAYMENTOLOGY_PUBLIC_KEY \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_RECEIVER_ADDRESS=$NEXT_PUBLIC_RECEIVER_ADDRESS \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_SPENDER_ADDRESS=$NEXT_PUBLIC_SPENDER_ADDRESS \
    NEXT_PUBLIC_WALLET_CONNECT_ID=$NEXT_PUBLIC_WALLET_CONNECT_ID \
    NEXT_PUBLIC_ENABLE_MARKETING_SCRIPTS=$NEXT_PUBLIC_ENABLE_MARKETING_SCRIPTS \
    NEXT_PUBLIC_SPINDL_SDK_KEY=$NEXT_PUBLIC_SPINDL_SDK_KEY \ 
    NEXT_PUBLIC_SAFE_TRANSACTION_API_URL=$NEXT_PUBLIC_SAFE_TRANSACTION_API_URL \
    NEXT_PUBLIC_ZENDESK_KEY=$NEXT_PUBLIC_ZENDESK_KEY

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full/ .

RUN if [ ! -e /lib/libssl.so.3 ]; then ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3; fi

# Build the project
RUN corepack enable && pnpm install
RUN pnpm turbo run build --filter=@gnosispay/web...

FROM base AS runner
WORKDIR /app

# Create app
COPY --from=installer /app .
RUN corepack enable && \
    # Prisma expects libssl to be under /lib so we create a symbolic link to it
    ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3
CMD cd ./apps/ui-dashboard && pnpm start
