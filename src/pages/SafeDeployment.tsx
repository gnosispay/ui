import { getApiV1SourceOfFunds, postApiV1SourceOfFunds, type KycQuestion } from "@/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

enum ScreenStep {
  AnswerSourceOfFunds = "answer-source-of-funds",
  TypePhone = "type-phone",
  OtpVerification = "otp-verification",
  DeploySafe = "deploy-safe",
}
export const SafeDeploymentRoute = () => {
  const [step, setStep] = useState<ScreenStep>(ScreenStep.AnswerSourceOfFunds);
  const { isAuthenticated } = useAuth();
  const { isUserSignedUp, user, safeConfig, refetchUser } = useUser();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [sourceOfFunds, setSourceOfFunds] = useState<KycQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("user", user);
  console.log("safeConfig", safeConfig);

  useEffect(() => {
    if (!user || !safeConfig) return;

    if (user.isSourceOfFundsAnswered === true && step === ScreenStep.AnswerSourceOfFunds) {
      setStep(ScreenStep.TypePhone);
    }

    if (user.isPhoneValidated === true && [ScreenStep.TypePhone, ScreenStep.OtpVerification].includes(step)) {
      setStep(ScreenStep.DeploySafe);
    }

    if (safeConfig.isDeployed) {
      // if the safe is already deployed, we can redirect to the home page
      navigate("/");
      return;
    }
  }, [user, safeConfig, step, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !isUserSignedUp) return;

    if (step === ScreenStep.AnswerSourceOfFunds) {
      getApiV1SourceOfFunds().then(({ data, error }) => {
        if (error) {
          console.error("Error fetching source of funds:", error);
          const errorMessage = "error" in error ? error.error : "message" in error ? error.message : "unkown";
          setError(`Error fetching source of funds: ${errorMessage || "Unknown error"}`);
          return;
        }

        setSourceOfFunds(data);
      });
    }
  }, [step, isAuthenticated, isUserSignedUp]);

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
            question: q.question || "",
            answer: answers[idx] || "",
          })),
        });
        refetchUser();
        setStep(ScreenStep.TypePhone);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to submit answers";
        setError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, sourceOfFunds, refetchUser],
  );

  // todo make this better
  if (!isAuthenticated || !isUserSignedUp) {
    return <div>Error, not authenticated...</div>;
  }

  return (
    <div className="grid grid-cols-6 gap-4 h-full">
      {error && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      {step === ScreenStep.AnswerSourceOfFunds && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <h3 className="text-lg font-semibold mb-4">Source of Funds Questionnaire</h3>
          <form onSubmit={handleSOFSubmit} className="space-y-6">
            {sourceOfFunds.map((q, idx) => {
              const qId = `sof-q-${idx}`;
              return (
                <div key={q.question} className="mb-4">
                  <label htmlFor={qId} className="block mb-2 font-medium">
                    {q.question}
                  </label>
                  <Select value={answers[idx] || ""} onValueChange={(value) => handleSoFAnswer(idx, value)}>
                    <SelectTrigger id={qId} className="w-full">
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
            <Button loading={isSubmitting} type="submit" disabled={isSourceOfFundsSubmitDisabled}>
              Submit
            </Button>
          </form>
        </div>
      )}
      {step === ScreenStep.TypePhone && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <h3 className="text-lg font-semibold mb-4">Phone verification</h3>
        </div>
      )}
    </div>
  );
};
