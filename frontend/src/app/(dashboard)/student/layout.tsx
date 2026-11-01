import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import StudentSidebar from "@/components/student/student-sidebar";

async function ProtectedStudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("auth-token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <StudentSidebar />

      <main className="min-w-0 flex-1 bg-background p-6">
        {children}
      </main>
    </div>
  );
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-background" />
      }
    >
      <ProtectedStudentLayout>
        {children}
      </ProtectedStudentLayout>
    </Suspense>
  );
}