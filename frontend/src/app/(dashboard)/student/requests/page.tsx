
import { Suspense } from "react";

import RequestsClient from "@/app/(components)/requestclient";
import { getIncomingRequests } from "@/services/chat-request-service";

function RequestsLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <div className="h-8 w-56 animate-pulse rounded-md bg-gray-200" />

      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-xl border bg-gray-100"
        />
      ))}
    </div>
  );
}

async function IncomingRequestsContent() {
  const response = await getIncomingRequests(undefined, 20);

  return (
    <RequestsClient
      initialRequests={response.data}
      initialPagination={response.pagination}
    />
  );
}

export default function StudentRequestsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          Incoming Requests
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage collaboration requests from other students.
        </p>
      </div>

      <Suspense fallback={<RequestsLoading />}>
        <IncomingRequestsContent />
      </Suspense>
    </main>
  );
}
