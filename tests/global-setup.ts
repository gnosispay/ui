import { requireAnvil, startAnvil } from "./utils/anvil";

export default async function globalSetup() {
  requireAnvil();
  await startAnvil();
}
