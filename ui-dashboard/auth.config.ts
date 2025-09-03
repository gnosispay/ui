import { PrismaAdapter } from "@auth/prisma-adapter";
import Sendgrid from "next-auth/providers/sendgrid";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "@auth/core/jwt";
import prisma from "@gnosispay/prisma";
import { type UserStatus } from "@gnosispay/prisma/client";
import { SiweMessage } from "siwe";
import { initEventTracker, trackEvent } from "@gnosispay/event-tracker";
import {
  generateVerificationToken,
  sendOTPEmail,
  OTP_FROM_EMAIL,
  OTP_MAX_AGE_IN_SECONDS,
} from "@gnosispay/email-otp-verification";
import PostHogClient from "./lib/posthog-node";
import { verifySmartSignature } from "./lib/verification";
import type { DefaultSession, NextAuthConfig } from "next-auth";

initEventTracker({
  posthogApiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  sendgridApiKey: process.env.SENDGRID_SECRET,
  loopsApiKey: process.env.LOOPS_API_KEY,
  spindlApiKey: process.env.SPINDL_API_KEY,
});

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      siweAddress?: string;
      email?: string;
      status?: UserStatus;
    };
  }

  interface User {
    siweAddress?: string;
    status?: UserStatus;
  }
}

export const authConfig = {
  basePath: "/auth",
  session: { strategy: "jwt" },
  // @ts-ignore - unexpected type if Prisma is used with extensions.
  // See https://github.com/nextauthjs/next-auth/issues/9413
  adapter: PrismaAdapter(prisma),
  events: {
    async createUser({ user }) {
      if (user.id && user.email) {
        trackEvent({
          userId: user.id,
          type: "user",
          event: "signed_up",
          integrations: ["posthog", "sendgrid", "loops", "spindl"],
          posthogProperties: {
            $set: {
              email: user.email,
              latestKycStatus: "none",
              latestCardOrderStatus: "none",
              latestCardStatus: "none",
            },
          },
          sendgridCustomFields: {
            latest_kyc_status: "none",
            latest_card_order_status: "none",
            latest_card_status: "none",
          },
          loopsProperties: {
            latestCardOrderStatus: "none",
            latestCardStatus: "none",
            latestKycStatus: "none",
          },
        });
      } else {
        console.error("Authjs: User event created without user id or email!");
      }
    },
    async signIn({ user }) {
      if (user.id && user.email) {
        PostHogClient().identify({ distinctId: user.id });
      }
    },
  },
  providers: [
    Sendgrid({
      maxAge: OTP_MAX_AGE_IN_SECONDS,
      apiKey: process.env.SENDGRID_SECRET,
      from: OTP_FROM_EMAIL,
      generateVerificationToken,
      sendVerificationRequest: async (params) => {
        const { identifier: to, provider, token } = params;

        const apiKey = provider.apiKey ?? process.env.SENDGRID_SECRET;

        if (!apiKey) {
          throw new Error("Sendgrid API key not found");
        }

        if (!provider.from) {
          throw new Error("from needs to be set");
        }

        const res = await sendOTPEmail({
          from: provider.from,
          sendgridApiKey: apiKey,
          to,
          token,
        });

        if (!res.ok) {
          throw new Error("Sendgrid error: " + (await res.text()));
        }
      },
    }),
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials, req) {
        if (!credentials || !credentials.message || !credentials.signature) {
          throw new Error("Invalid credentials");
        }

        const message = credentials.message as string;
        const signature = credentials.signature as string;

        const siwe = new SiweMessage(JSON.parse(message));
        const result = await verifySmartSignature(siwe, signature);

        if (!result.success) {
          throw new Error("Invalid signature");
        }

        const { address, chainId } = siwe;

        const token = await getToken({
          req,
          secret: process.env.AUTH_SECRET!,
          secureCookie: process.env.NODE_ENV === "production",
        });

        const existingAccount = await prisma.eOAAccount.findUnique({
          where: { address },
        });

        if (!existingAccount && !token?.sub) {
          throw new Error("Account not found");
        }

        if (
          existingAccount &&
          token?.sub &&
          existingAccount.userId !== token.sub
        ) {
          throw new Error("Wallet is already configured for another user");
        }

        /*
          When a user is already signed in (with an email address) and they use a siwe button,
          then we add their wallet as an EOA account (sign-in wallet).
          We need this because of the activation flow
        */
        if (!existingAccount && token?.sub) {
          await prisma.eOAAccount.create({
            data: {
              userId: token.sub,
              address,
            },
          });
        }

        const user = await prisma.user.findUnique({
          where: { id: existingAccount?.userId ?? token?.sub },
        });

        if (!user) {
          throw new Error("Could not find user to sign in with");
        }

        return {
          id: user.id,
          email: user.email,
          siweAddress: `eip155:${chainId}:${address}`,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, user, session }) {
      if (trigger === "update") {
        token.email = session?.user.email;
      }

      if (user?.siweAddress) {
        token.siweAddress = user.siweAddress;
      }

      // Only fetch user data if we don't have status and it wasn't provided by the authentication provider (this covers both email and siwe)
      if (!token.status && !user?.status && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        token.status = dbUser?.status;
      }

      token.status = user?.status ?? token.status;

      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.siweAddress) {
        session.user.siweAddress = token.siweAddress as string;
      }

      session.user.status = token.status as UserStatus;
      return session;
    },
  },
} satisfies NextAuthConfig;
