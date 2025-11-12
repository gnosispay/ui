import { useEffect, useState, useMemo, useCallback } from "react";
import { getApiV1SourceOfFunds, postApiV1SourceOfFunds, type KycQuestion } from "@/client";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/utils/errorHelpers";

export type SourceOfFundsStepProps = {
  onComplete: () => void;
  setError: (err: string) => void;
};

const SourceOfFundsStep = ({ onComplete, setError }: SourceOfFundsStepProps) => {
  const [sourceOfFunds, setSourceOfFunds] = useState<KycQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getApiV1SourceOfFunds().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching source of funds:", error);
        const errorMessage = extractErrorMessage(error, "Unknown error");
        setError(`Error fetching source of funds: ${errorMessage}`);
        return;
      }
      setSourceOfFunds(data);
    });
  }, [setError]);

  const handleSoFAnswer = (index: number, answer: string) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[index] = answer;
      return newAnswers;
    });
  };

  const isSourceOfFundsSubmitDisabled = useMemo(
    () => isSubmitting || answers.length !== sourceOfFunds.length || answers.some((a) => !a),
    [isSubmitting, answers, sourceOfFunds.length],
  );

  const handleSOFSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setIsSubmitting(true);
      try {
        await postApiV1SourceOfFunds({
          body: sourceOfFunds.map((q, idx) => ({
            question: q.question,
            answer: answers[idx],
          })),
        });
        onComplete();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to submit answers";
        setError(errorMsg);
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, sourceOfFunds, onComplete, setError],
  );

  return (
    <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0" data-testid="source-of-funds-step">
      <h2 className="text-lg font-semibold my-4">Please answer the following questions:</h2>
      <form onSubmit={handleSOFSubmit} className="space-y-6" data-testid="source-of-funds-form">
        {sourceOfFunds.map((q, idx) => {
          const qId = `sof-q-${idx}`;
          return (
            <div key={q.question} className="mb-4" data-testid={`source-of-funds-question-${idx}`}>
              <label htmlFor={qId} className="block mb-2 font-medium">
                {q.question}
              </label>
              <Select value={answers[idx] || ""} onValueChange={(value) => handleSoFAnswer(idx, value)}>
                <SelectTrigger id={qId} className="w-full" data-testid={`source-of-funds-select-${idx}`}>
                  <SelectValue placeholder="Select an answer" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  {(q.answers || []).map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
        <Button
          loading={isSubmitting}
          type="submit"
          disabled={isSourceOfFundsSubmitDisabled}
          data-testid="source-of-funds-submit-button"
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default SourceOfFundsStep;
