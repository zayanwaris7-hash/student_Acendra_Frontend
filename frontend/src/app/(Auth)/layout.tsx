import type { ReactNode } from "react";
import AuthLayoutClient from "@/app/(Auth)/(components)/authlayout";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}