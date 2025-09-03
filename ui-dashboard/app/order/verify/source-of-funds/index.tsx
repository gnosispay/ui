"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useFeatureFlagEnabled } from "posthog-js/react";
import Spinner from "@/components/spinner";
import Button from "@/components/buttons/buttonv2";
import { TitleSubtitle } from "../../../../components/layout/title-subtitle";
import { fetchApi } from "../../../../lib/api";
import { createOrder } from "../../details/customize/actions";
import type { Me } from "@/lib/get-user";

export interface Question {
  question: string;
  answers: string[];
}

interface Answer {
  answer: string;
  question: string;
}

const getAnswersFromValues = (values: Record<string, string>) => {
  return Object.entries(values).map(([question, answer]) => ({
    question,
    answer,
  }));
};

const SourceOfFunds: React.FC<{
  kycUser?: { approved?: boolean | null } | null;
  user?: Me | null;
}> = ({ kycUser, user }) => {
  const [success, setSuccess] = useState(false);
  const { push } = useRouter();

  const { register, handleSubmit } = useForm();

  const isBrazilPilotEnabled = useFeatureFlagEnabled("brazil-cards-pilot");
  const posthogFeatureFlagsInitialized =
    typeof isBrazilPilotEnabled !== "undefined";

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["source-of-funds"],
    queryFn: async () => {
      const { data } = await fetchApi("/source-of-funds");
      return data;
    },
  });

  const { mutate: postSourceOfFunds, isPending: isSubmitting } = useMutation({
    mutationFn: (qaPairs: Answer[]) =>
      fetchApi("/source-of-funds", { method: "POST", body: qaPairs }),
    onSuccess: async () => {
      setSuccess(true);

      if (
        posthogFeatureFlagsInitialized &&
        isBrazilPilotEnabled &&
        user?.country === "BR"
      ) {
        const order = await createOrder({
          personalizationSource: "ENS",
          ensName: "Brazil card : n/a",
          coupon: false,
        });
        push(`/order/deposit/${order.id}`);
      } else {
        push("/order/details/customize");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: Record<string, string>) => {
    const questionAnswerPairs: Answer[] = getAnswersFromValues(values);

    return postSourceOfFunds(questionAnswerPairs);
  };

  if (isLoading || !questions) {
    return <Spinner monochromatic className="w-6 h-6 m-auto" />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg m-auto my-8 p-6">
      <TitleSubtitle
        title={
          kycUser?.approved
            ? "Identity verified! Just a few more questions"
            : "Verification in progress! Just a few more questions"
        }
        subtitle="We need this information to comply with our legal obligations"
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {questions.map(({ question, answers }) => (
            <div className="space-y-2" key={question}>
              <label htmlFor={question} className="text-secondary text-sm">
                {question}
              </label>

              <select
                required
                {...register(question)}
                className="w-full rounded-lg border border-low-contrast px-4 py-2.5 pr-2 placeholder-black-400 focus:border-stone-600 focus:ring-0"
              >
                <option value="">Select...</option>
                {answers.map((answer) => (
                  <option key={answer} value={answer}>
                    {answer}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {!success && (
          <Button className="w-full disabled:opacity-50 disabled:cursor-not-allowed mt-8">
            {isSubmitting && <Spinner monochromatic className="w-6 h-6" />}
            {isSubmitting ? "Submitting..." : "Continue"}
          </Button>
        )}
      </form>
      {success && <Button className="w-full">Thank you</Button>}
    </div>
  );
};

export default SourceOfFunds;
