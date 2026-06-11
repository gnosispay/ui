import { isAnvilAvailable, stopAnvil } from "./utils/anvil";

export default async function globalTeardown() {
  if (!isAnvilAvailable()) {
    return;
  }

  await stopAnvil();
}
