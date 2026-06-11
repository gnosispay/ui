import { isAnvilAvailable, startAnvil } from "./utils/anvil";

export default async function globalSetup() {
  if (!isAnvilAvailable()) {
    return;
  }

  await startAnvil();
}
