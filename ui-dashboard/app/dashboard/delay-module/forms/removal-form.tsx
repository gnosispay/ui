"use client";

import { createPublicClient, http, encodeFunctionData, parseAbi } from "viem";
import { gnosis } from "viem/chains";
import { predictAddresses } from "@gnosispay/account-kit";
import { Trash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { SENTINEL_ADDRESS, getGnosisAddressUrl } from "@/lib/constants";
import useDelayRelay from "@/hooks/use-delay-relay";

const publicClient = createPublicClient({
  chain: gnosis,
  transport: http("/api/v1/rpc/gnosis"),
});

export default function RemovalForm({ account }: { account: `0x${string}` }) {
  const [modules, setModules] = useState<undefined | `0x${string}`[]>();
  const [delayAddress, setDelayAddress] = useState<undefined | `0x${string}`>(
    undefined,
  );
  const [rolesAddress, setRolesAddress] = useState<undefined | `0x${string}`>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getSafeModules = async () => {
      setIsLoading(true);

      try {
        const [data] = await publicClient.readContract({
          address: account,
          abi: parseAbi([
            "function getModulesPaginated(address, uint256 pageSize) external view returns (address[] memory array, address next)",
          ]),
          functionName: "getModulesPaginated",
          args: [SENTINEL_ADDRESS, BigInt(10)],
        });

        setModules(data as `0x${string}`[]);
      } catch (error) {}

      setIsLoading(false);
    };

    if (typeof modules === "undefined") {
      getSafeModules();
    }
  }, [account, modules]);

  useEffect(() => {
    const { delay, roles } = predictAddresses(account);

    setDelayAddress(delay as `0x${string}`);
    setRolesAddress(roles as `0x${string}`);
  }, [account]);

  const { delayRelay } = useDelayRelay(account);

  const removeModule = async (moduleToRemove: `0x${string}`) => {
    const previousModule =
      modules?.[modules?.indexOf(moduleToRemove) - 1] ?? SENTINEL_ADDRESS;

    try {
      await delayRelay({
        to: account,
        data: encodeFunctionData({
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "prevModule",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "module",
                  type: "address",
                },
              ],
              name: "disableModule",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          args: [previousModule, moduleToRemove],
          functionName: "disableModule",
        }),
        value: 0,
      });
    } catch (e) {}
  };

  const getAddressActions = (address: `0x${string}`) => {
    /**
     * We detected Delay Module address
     */
    if (address === delayAddress) {
      return <span className="ml-2 font-semibold">Delay Module</span>;
    }

    /**
     * We detected Roles Module address
     */
    if (address === rolesAddress) {
      return <span className="ml-2 font-semibold">Roles Module</span>;
    }

    /**
     * We detected external / unknown Module address
     */
    return (
      <>
        <span className="ml-2 font-semibold">Unknown Module</span>
        <Trash
          className="inline -mt-1 ml-2 cursor-pointer text-red-600"
          onClick={() => {
            removeModule(address);
          }}
        />
      </>
    );
  };

  if (isLoading) {
    return <div className="my-4">Loading...</div>;
  }

  return (
    <div>
      {modules && modules.length > 0 ? (
        <div className="my-4">
          <p>Enabled Safe modules:</p>
          <ol className="list-disc ">
            {modules?.map((address) => (
              <li className="ml-6 mt-1" key={address}>
                <a
                  className="underline"
                  href={getGnosisAddressUrl(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {address}
                </a>

                {getAddressActions(address)}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="mt-4">You don&apos;t have any enabled Safe modules.</p>
      )}
    </div>
  );
}
