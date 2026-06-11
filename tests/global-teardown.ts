import { stopAnvil } from "./utils/anvil";

export default async function globalTeardown() {
  await stopAnvil();
}
