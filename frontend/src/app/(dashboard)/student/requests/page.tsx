import RequestsContent from "@/app/(components)/client-request";
export default function StudentRequestsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Incoming Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage collaboration requests from other students.
        </p>
      </div>

      <RequestsContent />
    </main>
  );
}