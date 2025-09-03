"use client";

import {
  Copy,
  ArrowUpRight,
  QrCode as QrCodeIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useState } from "react";
import QRCode from "react-qr-code";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import useHasMounted from "@/hooks/use-has-mounted";
import useMediaQuery from "@/hooks/use-media-query";
import { shortenAddress } from "@/lib/utils";
import Dialog from "@/components/dialog";
import Button from "./buttons/button";

interface CopyLinkDataProps {
  link?: string;
  originalValue: string;
  displayValue: string;
}

const CopyLinkData = ({
  link,
  originalValue,
  displayValue,
}: CopyLinkDataProps) => {
  const [, copy] = useClipboardCopy({ showToast: true });
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);

  return (
    <div className="flex justify-between items-center">
      <p className="leading-[24px] font-light">{displayValue}</p>

      <div className="flex gap-3 items-center">
        <button onClick={() => copy(originalValue)} type="button">
          <Copy size={20} />
        </button>

        <button onClick={() => setQrModalVisible(true)} type="button">
          <QrCodeIcon size={20} />
        </button>

        {link && (
          <Link
            href={link}
            target="_blank"
            referrerPolicy="no-referrer"
            className="flex items-center"
          >
            <button>
              <ArrowUpRight size={20} />
            </button>
          </Link>
        )}
      </div>

      <Dialog
        isOpen={qrModalVisible}
        handleClose={() => {
          setQrModalVisible(false);
        }}
        containerClassName="p-0 max-w-xl"
        absolutelyCentered
      >
        <div className="p-6 text-center space-y-8">
          <h1 className="text-xl mt-4 font-brand">Scan QR Code</h1>

          <div className="flex justify-center">
            <QRCode value={originalValue} size={200} />
          </div>

          <div className="mt-4 flex gap-3 flex-col flex-1">
            <Button
              className="w-full py-3 rounded-lg"
              onClick={() => copy(originalValue)}
            >
              <Copy /> Copy to clipboard
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CopyLinkData;

interface CopyLinkAddressProps {
  link?: string;
  address: string;
}

export const CopyLinkAddress = ({ link, address }: CopyLinkAddressProps) => {
  const hasMounted = useHasMounted();
  const shortAddress = hasMounted
    ? shortenAddress(address as `0x${typeof address}`)
    : address;
  const smallScreen = useMediaQuery("(max-width: 640px)");

  return (
    <CopyLinkData
      link={link}
      originalValue={address}
      displayValue={smallScreen ? shortAddress : address}
    />
  );
};
