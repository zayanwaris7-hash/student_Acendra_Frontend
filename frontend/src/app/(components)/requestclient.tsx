"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  UserRound,
  Users,
  ArrowDown,
  Loader2,
  Inbox,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

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
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Users size={14} />
                Student Community
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Connection Requests
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                See who wants to connect with you and grow your
                professional network.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-border bg-background/80 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Inbox size={21} />
              </div>

              <div>
                <p className="text-2xl font-bold tabular-nums">
                  {requests.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Requests loaded
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Requests section */}
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                People who want to connect
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Review incoming connection requests from students.
              </p>
            </div>

            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              {requests.length} loaded
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Inbox size={30} />
              </div>

              <h3 className="text-lg font-semibold">
                No connection requests yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                When someone sends you a connection request, it will
                appear here. Keep building your profile and connecting
                with the community.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {requests.map((request) => {
                const senderName =
                  request.sender.fullName ||
                  request.sender.name ||
                  "Unknown student";

                return (
                  <article
                    key={request.id}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5"
                  >
                    {/* Avatar */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                      {request.sender.profileImage ? (
                        <img
                          src={request.sender.profileImage}
                          alt={senderName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={25} />
                      )}
                    </div>

                    {/* Sender details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">
                        {senderName}
                      </h3>

                      {request.sender.fullName && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          @{request.sender.fullName}
                        </p>
                      )}

                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Wants to connect
                      </div>
                    </div>

                    {/* Request indicator */}
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <ArrowDown size={17} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Load more error */}
        {loadMoreError && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle size={18} />
              {loadMoreError}
            </div>

            <button
              type="button"
              onClick={loadMoreRequests}
              disabled={loadingMore}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.hasMore && (
          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              type="button"
              onClick={loadMoreRequests}
              disabled={loadingMore}
              className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Loading requests...
                </>
              ) : (
                <>
                  Load more requests
                  <ArrowDown size={17} />
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground">
              Showing {requests.length} requests
            </p>
          </div>
        )}

        {!pagination.hasMore && requests.length > 0 && (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            You&apos;re all caught up!
          </div>
        )}
      </div>
    </main>
  );
}