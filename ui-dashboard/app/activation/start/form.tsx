"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import api, { getFutureCardPublicKey } from "@/lib/api";
import {
  generateSessionKey,
  encryptSessionKey,
  generateIV,
  encryptSecret,
} from "@/lib/cryptography";
import Input from "@/components/inputs/input-base";
import Spinner from "@/components/spinner";
import Button from "@/components/buttons/buttonv2";
import {
  GNOSIS_PAY_PRIVACY_POLICY_URL,
  GNOSIS_PAY_TOS_URL,
  MONAVATE_PRIVACY_POLICY_URL,
  MONAVATE_TOS_URL,
} from "../../../lib/constants";
import type { SubmitHandler } from "react-hook-form";
import type { FC } from "react";

export const CardPanForm: FC = () => {
  const {
    handleSubmit,
    setError,
    control,
    formState: {
      errors,
      isLoading,
      isSubmitting,
      isSubmitSuccessful,
      isValid,
      isDirty,
    },
  } = useForm<{ pan: string }>();

  const { push } = useRouter();
  const showLoading =
    isDirty && (isLoading || isSubmitting || isSubmitSuccessful);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const legalLinks = useMemo(() => {
    return [
      {
        title: "Gnosis Pay WebApp Terms of Service",
        href: GNOSIS_PAY_TOS_URL,
      },
      {
        title: "Gnosis Pay Privacy and Cookies Policy",
        href: GNOSIS_PAY_PRIVACY_POLICY_URL,
      },
      {
        // Use internal server-side dynamic redirect based on user country
        title: "Monavate Cardholder Terms",
        href: MONAVATE_TOS_URL,
      },
      {
        title: "Monavate Privacy Policy",
        href: MONAVATE_PRIVACY_POLICY_URL,
      },
    ];
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = event.target;
    value = value.replace(/\D/g, ""); // Remove all non-digit characters

    value = value.replace(/\s/g, "");
    value = value.match(/.{1,4}/g)?.join(" ") || "";
    return value;
  };

  const handleVerify: SubmitHandler<FormValues> = async (data) => {
    const { pan: unSanitizedPan } = data;

    // verify that the card is valid
    try {
      const pan = unSanitizedPan.replace(/\s/g, "").trim();
      // https://developer.paymentology.com/docs/paysecure-api#end-to-end-flow
      const key = generateSessionKey();
      const publicKey = await getFutureCardPublicKey();
      const encryptedKey = await encryptSessionKey(key, publicKey);
      const iv = generateIV();
      const encryptedPan = await encryptSecret(pan, key, iv);
      if (!encryptedPan) {
        throw new Error("Failed to encrypt PAN");
      }

      const res = await api().post("/cards/verify", {
        iv,
        encryptedKey,
        encryptedPan,
      });
      const data = await res.json();
      const cardId = data.cardId;
      if (!cardId) {
        throw new Error("Failed to verify card");
      }
      push(`/activation/configure-safe/${cardId}`);
    } catch (error: any) {
      console.error(error);
      if (!error?.message) {
        return;
      }
      setError("pan", {
        type: "server",
        message: error?.message,
      });
    }
  };
  const disableSubmit = showLoading || !isValid || !termsAccepted;

  return (
    <form onSubmit={handleSubmit(handleVerify)}>
      <label className="flex-col justify-start items-start gap-1.5 inline-flex w-full">
        <span className="text-stone-800 text-sm font-medium font-['SF Pro Rounded'] leading-tight">
          Card number
        </span>
      </label>
      <Controller
        name="pan"
        defaultValue=""
        control={control}
        rules={{
          required: true,
          validate: {
            validLength: (value) => {
              const numDigits = value.replace(/\s/g, "").length;
              return (
                (numDigits >= 13 && numDigits <= 16) || "Invalid card number"
              );
            },
          },
        }}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value}
            type="text"
            inputmode="numeric"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              field.onChange(handleInputChange(e));
            }}
            className="text-sm font-normal leading-normal self-stretch px-3 py-2 bg-white rounded-lg shadow border border-neutral-200 justify-start items-center gap-2 inline-flex w-full placeholder-gray-300"
            placeholder="4567 1234 5678 9010"
          />
        )}
      />
      <div className="h-6">
        {errors.pan && typeof errors.pan.message === "string" && (
          <span className="text-xs text-red-500">{errors.pan.message}</span>
        )}
      </div>

      <div className="-mt-1 mb-3">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="shadow border border-neutral-200 w-4 h-4 gp-bg-subtle rounded text-lime-500 hover:cursor-pointer -mt-0.5 !ring-transparent"
        />

        <span className="ml-1 text-sm text-gray-700">
          Click here to confirm you have read and accept the:
          <ul className="ml-8 list-disc">
            {legalLinks.map(({ title, href }) => (
              <li className="mt-1" key={title}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </span>
      </div>

      <Button
        className="px-5 py-3 min-w-[200px] ml-auto disabled:bg-gp-text-lc"
        type="submit"
        disabled={disableSubmit}
      >
        {showLoading ? (
          <div className="flex items-center gap-3 relative">
            <Spinner
              monochromatic
              className="w-3 h-3 absolute left-[-1.5rem]"
            />
            <span>Link</span>
          </div>
        ) : (
          "Link"
        )}
      </Button>
    </form>
  );
};

export type FormValues = {
  pan: string;
};
