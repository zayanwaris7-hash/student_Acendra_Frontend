
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";

import { api } from "@/utils/axios";

import type {
  ChatRequest,
  ChatRequestsPagination,
  ChatRequestsResponse,
} from "@/types/chatrequest.type";

interface RequestsClientProps {
  initialRequests: ChatRequest[];
  initialPagination: ChatRequestsPagination;
}

export default function RequestsClient({
  initialRequests,
  initialPagination,
}: RequestsClientProps) {
  const router = useRouter();

  const [requests, setRequests] = useState(initialRequests);
  const [pagination, setPagination] = useState(initialPagination);

  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const loadMoreRequests = useCallback(async () => {
    if (
      loadingMore ||
      !pagination.hasMore ||
      !pagination.nextCursor
    ) {
      return;
    }

    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await api.get<ChatRequestsResponse>(
        "/chats/requests/incoming",
        {
          params: {
            limit: pagination.limit,
            cursor: pagination.nextCursor,
          },
        },
      );

      const result = response.data;

      // Prevent duplicate requests when appending pages.
      setRequests((previous) => {
        const existingIds = new Set(
          previous.map((request) => request.id),
        );

        const newRequests = result.data.filter(
          (request) => !existingIds.has(request.id),
        );

        return [...previous, ...newRequests];
      });

      setPagination(result.pagination);
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 401) {
        router.replace("/login");
        return;
      }

      console.error("Failed to load more requests:", error);

      setLoadMoreError(
        "Unable to load more requests. Please try again.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, pagination, router]);

  return (
    <div>
      {/* Keep your existing requests UI here. */}

      {/* Example: render your existing requests */}
      {requests.map((request) => (
        <div key={request.id}>
          {request.sender.fullName ||
            request.sender.name ||
            "Unknown student"}
        </div>
      ))}

      {loadMoreError && (
        <div role="alert" className="text-sm text-red-500">
          {loadMoreError}
        </div>
      )}

      {pagination.hasMore && (
        <button
          type="button"
          onClick={loadMoreRequests}
          disabled={loadingMore}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
