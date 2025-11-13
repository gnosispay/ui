"use client";

import { Suspense } from "react";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
