import { getApiV1SourceOfFunds, postApiV1SourceOfFunds, type KycQuestion } from "@/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { OtpInput } from "@/components/otpInput";
import { postApiV1Verification, postApiV1VerificationCheck } from "@/client";
import { useTimer } from "@/hooks/useTimer";
import { CheckCircle2, LoaderCircle } from "lucide-react";

enum ScreenStep {
  AnswerSourceOfFunds = "answer-source-of-funds",
  TypePhone = "type-phone",
  VerifyPhoneNumber = "verify-phone-number",
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
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const { timer: resendTimer, start: startResendTimer } = useTimer(60);

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

  useEffect(() => {
    if (step === ScreenStep.OtpVerification) {
      startResendTimer();
    }
  }, [step, startResendTimer]);

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
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [answers, sourceOfFunds, refetchUser],
  );

  const handlePhoneContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(ScreenStep.VerifyPhoneNumber);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { error, data } = await postApiV1Verification({ body: { phoneNumber: phone } });

      if (error || !data?.ok) {
        let message = "Unknown error";
        if (error && typeof error === "object") {
          message =
            "error" in error
              ? (error.error as string)
              : "message" in error
                ? (error.message as string)
                : "Unknown error";
        }
        setError(`Error sending code: ${message}`);
        return;
      }
      setStep(ScreenStep.OtpVerification);
    } catch (err) {
      setError("Error sending code");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsOtpLoading(true);
    try {
      const { error, data } = await postApiV1VerificationCheck({ body: { code: otp } });
      if (error || !data?.ok) {
        let message = "Unknown error";
        if (error && typeof error === "object") {
          if ("error" in error && typeof error.error === "string") message = error.error;
          else if ("message" in error && typeof error.message === "string") message = error.message;
        }
        setError(`Error verifying code: ${message}`);
        return;
      }
      setStep(ScreenStep.DeploySafe);
      refetchUser();
    } catch (err) {
      setError("Error verifying code");
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (resendTimer > 0) return;

    await handlePhoneSubmit(e);
    startResendTimer();
  };

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
          <h2 className="text-lg font-semibold mb-4 mt-4">Please answer the following questions:</h2>
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
          <h2 className="text-lg font-semibold mb-4 mt-4">Mobile phone verification</h2>
          <p className="text-muted-foreground mb-4">
            A one time code will be sent to your phone. Please enter your phone number to continue.
          </p>
          <form className="space-y-4 mt-4 lg:w-1/4" onSubmit={handlePhoneContinue}>
            <PhoneInput value={phone} onChange={setPhone} disabled={isSubmitting} />
            <Button type="submit" disabled={!phone || isSubmitting}>
              Continue
            </Button>
          </form>
        </div>
      )}
      {step === ScreenStep.VerifyPhoneNumber && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <form className="space-y-4 mt-4" onSubmit={handlePhoneSubmit}>
            <h2 className="text-lg font-semibold mb-4 mt-4">This number will be used to send you a one time code:</h2>
            <div className="mb-4 font-mono text-lg">{phone}</div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(ScreenStep.TypePhone)}
                disabled={isSubmitting}
              >
                Edit
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                Send code
              </Button>
            </div>
          </form>
        </div>
      )}
      {step === ScreenStep.OtpVerification && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <form className="space-y-4 mt-4" onSubmit={handleOtpSubmit}>
            <label htmlFor="otp" className="block mb-4 font-medium mt-4">
              Enter the 6-digit code sent to your phone
            </label>
            <OtpInput value={otp} onChange={setOtp} isLoading={isOtpLoading} disabled={isOtpLoading} />
            <Button type="submit" loading={isOtpLoading} disabled={isOtpLoading || otp.length !== 6}>
              Verify
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={handleResendCode}
              disabled={isSubmitting || isOtpLoading || resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend code (${resendTimer}s)` : "Resend code"}
            </Button>
          </form>
        </div>
      )}
      {step === ScreenStep.DeploySafe && (
        <div className="col-span-6 lg:col-start-2 lg:col-span-4 mx-4 lg:mx-0">
          <div className="flex flex-col items-center justify-center h-full">
            <div>
              <h2 className="text-lg font-semibold mb-4 mt-4 flex items-center">
                <CheckCircle2 className="w-10 h-10 mr-2 text-success" /> Phone verified
              </h2>
              <h2 className="text-lg font-semibold mb-4 mt-4 flex items-center">
                <LoaderCircle className="w-10 h-10 mr-2 animate-spin" /> Deploying your safe...
              </h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
