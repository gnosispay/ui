import { createPublicClient, fallback } from "viem";
import { mainnet } from "viem/chains";
import { type NextRequest, NextResponse } from "next/server";
import { transports } from "@/lib/viem-transports";

const viemClient = createPublicClient({
  transport: fallback([transports.gateway, transports.llamaRpc]),
  chain: mainnet,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await viemClient.request(body);

    return NextResponse.json({
      jsonrpc: "2.0",
      id: body.id || 1,
      result: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: (await request.json().catch(() => ({})))?.id || 1,
        error: {
          code: error.code || -32603,
          message: error.message || "Internal error",
          data: error.data,
        },
      },
      { status: 200 }, // JSON-RPC spec uses HTTP 200 even for errors
    );
  }
}
