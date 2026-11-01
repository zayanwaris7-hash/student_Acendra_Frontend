"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

interface VerifyOtpFormProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
}

export default function VerifyOtpForm({
  isOpen,
  email,
  onClose,
}: VerifyOtpFormProps) {
  const router = useRouter();

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || seconds <= 0) return;

    const timer = window.setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isOpen, seconds]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setOtp("");
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter a valid six-digit OTP");
      return;
    }

    const success = await verifyOtp({ email, otp });

    if (success) {
      toast.success("Email verified successfully!");
      onClose();
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="otp-title"
        className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl border border-border bg-background p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close OTP dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail size={26} />
          </div>

          <h2
            id="otp-title"
            className="text-2xl font-bold tracking-tight"
          >
            Verify your email
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Enter the verification code sent to
          </p>

          <p className="mt-2 break-all font-semibold">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            required
            autoFocus
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
          <button
            type="button"
            onClick={() => {
              onClose();
              router.replace("/register");
            }}
            className="font-semibold text-primary"
          >
            Register again
          </button>
        </p>
      </div>
    </div>
  );
}