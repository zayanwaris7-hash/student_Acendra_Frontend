"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import AuthCard from "./authCard";


interface VerifyOtpFormProps {
  email: string;
}

export default function VerifyOtpForm({ email }: VerifyOtpFormProps) {
  const router = useRouter();

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = window.setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [seconds]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter a valid six-digit OTP");
      return;
    }

    const success = await verifyOtp({ email, otp });

    if (success) {
      toast.success("Email verified successfully!");
      router.replace("/login?verified=true");
    }
  };

  const handleResend = async () => {
    if (seconds > 0 || resendLoading) return;

    setResendLoading(true);

    try {
      const success = await resendOtp({ email });

      if (success) {
        setOtp("");
        setSeconds(60);
        toast.success("A new OTP has been sent!");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthCard
      title="Verify your email"
      description="Enter the verification code sent to your email."
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail size={26} />
        </div>

        <p className="text-sm text-muted-foreground">
          We sent a verification code to
        </p>

        <p className="mt-1 break-all font-semibold">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          required
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="auth-input text-center text-2xl font-bold tracking-[0.5em]"
        />

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="auth-button"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            "Verify email"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={seconds > 0 || resendLoading}
          className="font-semibold text-primary disabled:opacity-50"
        >
          {resendLoading
            ? "Sending..."
            : seconds > 0
              ? `Resend code in ${seconds}s`
              : "Resend verification code"}
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Wrong email?{" "}
        <Link href="/register" className="font-semibold text-primary">
          Register again
        </Link>
      </p>
    </AuthCard>
  );
}