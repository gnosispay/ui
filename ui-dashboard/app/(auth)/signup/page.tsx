"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { EXTERNAL_SIGNUP_URL } from "@/lib/constants";
import Spinner from "@/components/spinner";

const SignupContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const url = new URL(EXTERNAL_SIGNUP_URL);

    // Preserve query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    router.push(url.toString());
  }, [searchParams, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Spinner monochromatic className="w-8 h-8" />
        <p>Redirecting to sign up...</p>
      </div>
    </div>
  );
};

const SignupPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Spinner monochromatic className="w-8 h-8" />
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
};

export default SignupPage;
