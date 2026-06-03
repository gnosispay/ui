import * as legacy from "@gnosispay/account-kit";
import * as next from "@gnosispay/account-kit-next";

export type SafeKind = "legacy" | "next";

export const getAccountKit = (kind: SafeKind) => (kind === "legacy" ? legacy : next);
