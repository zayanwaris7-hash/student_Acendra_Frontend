
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Users,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import RequestsClient from "@/app/(components)/requestclient";
import { api } from "@/utils/axios";
import { ChatRequestsResponse } from "@/types/chatrequest.type";
import { toast } from "sonner";

export default function RequestsContent() {
  const [data, setData] = useState<ChatRequestsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ChatRequestsResponse>("/chats/requests/incoming", {
      params: { limit: 20 },
    })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Failed to load requests"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <div className="h-8 w-56 animate-pulse rounded-md bg-gray-200" />

        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-gray-100 bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            Unable to load incoming requests.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm font-semibold text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data.data || data.data.length === 0) {
    return (
      <div className="mx-auto flex min-h-[65vh] w-full max-w-5xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">

          {/* Empty State Illustration */}
          <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-50" />
            <div className="absolute inset-3 rounded-full bg-blue-100/70" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-100/50">
              <Inbox
                size={38}
                strokeWidth={1.5}
                className="text-blue-600"
              />
            </div>

            <div className="absolute right-1 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md">
              <MessageCircle
                size={19}
                className="text-blue-500"
              />
            </div>

            <div className="absolute bottom-3 left-1 flex h-9 w-9 items-center justify-center rounded-full border border-gray-100 bg-white shadow-md">
              <Users
                size={17}
                className="text-indigo-500"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              All caught up!
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              No incoming requests
            </h2>

            <p className="mx-auto max-w-sm text-sm leading-6 text-gray-500">
              You don't have any chat requests yet. When another student
              wants to connect with you, their request will appear here.
            </p>
          </div>

          {/* Action */}
          {/* <Link
            href="/student/other-profiles"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg"
          >
            Explore Students
            <ArrowRight size={17} />
          </Link> */}

          <p className="mt-5 text-xs text-gray-400">
            Build connections. Share ideas. Grow together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <RequestsClient
      initialRequests={data.data}
      initialPagination={data.pagination}
    />
  );
}
