import { redirect } from "next/navigation";
import VerifyOtpForm from "../(components)/otp";


interface VerifyOtpPageProps {
  searchParams: Promise<{
    email?: string;
  }>;
}

export default async function VerifyOtpPage({
  searchParams,
}: VerifyOtpPageProps) {
  const { email } = await searchParams;

  if (!email) {
    redirect("/register");
  }

  return <VerifyOtpForm email={email} />;
}