
"use client";

import type {
  SafeUser,
  UsersResponse,
  OutgoingRequestsResponse,
  OutgoingRequest,
} from "@/types/getaalluser";

import { api } from "@/utils/axios";
import { useAuthStore } from "@/store/useAuthStore";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { toast } from "sonner";

import {
  Search,
  Users,
  UserPlus,
  Check,
  Loader2,
  GraduationCap,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  UserRound,
  Compass,
  Inbox,
  X,
  Clock,
  CheckCircle2,
  Handshake,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface IncomingRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  sender: {
    id: string;
    name?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
}

interface IncomingRequestsResponse {
  data: IncomingRequest[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

type RequestStatus = "ACCEPTED" | "REJECTED";

export default function OtherProfilesClient() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const accessToken = useAuthStore((state) => state.accessToken);

  // ==========================================
  // USERS
  // ==========================================

  const [users, setUsers] = useState<SafeUser[]>([]);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());
  const [sendingIds, setSendingIds] = useState<Set<string>>(new Set());

  // ==========================================
  // INCOMING REQUESTS
  // ==========================================

  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [incomingCursor, setIncomingCursor] = useState<string | null>(null);
  const [hasMoreIncoming, setHasMoreIncoming] = useState(false);
  const [loadingIncomingMore, setLoadingIncomingMore] = useState(false);

  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());

  // ==========================================
  // ACCEPTED OUTGOING REQUESTS
  // ==========================================

  const [acceptedOutgoingRequests, setAcceptedOutgoingRequests] =
    useState<OutgoingRequest[]>([]);

  // ==========================================
  // GENERAL STATE
  // ==========================================

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const observer = useRef<IntersectionObserver | null>(null);
  const loadingMoreRef = useRef(false);

  // ==========================================
  // INITIAL DATA
  // ==========================================

  const loadInitialData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setError("Please log in to discover other profiles.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [
        usersResponse,
        outgoingResponse,
        incomingResponse,
      ] = await Promise.all([
        api.get<UsersResponse>("/users", {
          params: { page: 1, limit: 10 },
        }),

        api.get<OutgoingRequestsResponse>(
          "/chats/requests/outgoing",
          {
            params: { limit: 50 },
          }
        ),

        api.get<IncomingRequestsResponse>(
          "/chats/requests/incoming",
          {
            params: { limit: 10 },
          }
        ),
      ]);

      // USERS
      const usersData = usersResponse.data;

      setUsers(usersData.data ?? []);
      setPage(usersData.pagination.page);
      setLimit(usersData.pagination.limit);
      setHasNextPage(usersData.pagination.hasNextPage);

      // OUTGOING REQUESTS
      const outgoingRequests = outgoingResponse.data.data ?? [];

      const pendingOutgoing = outgoingRequests.filter(
        (request) => request.status === "PENDING"
      );

      const acceptedOutgoing = outgoingRequests.filter(
        (request) => request.status === "ACCEPTED"
      );

      setRequestedIds(
        new Set(
          pendingOutgoing.map((request) => request.receiverId)
        )
      );

      setAcceptedOutgoingRequests(acceptedOutgoing);

      // All accepted outgoing connections
      setConnectedIds(
        new Set(
          acceptedOutgoing.map((request) => request.receiverId)
        )
      );

      // INCOMING REQUESTS
      const incomingData = incomingResponse.data;

      setIncomingRequests(incomingData.data ?? []);
      setIncomingCursor(incomingData.pagination.nextCursor);
      setHasMoreIncoming(incomingData.pagination.hasMore);

    } catch (error) {
      console.error("Failed to load profiles:", error);

      setError(
        "We couldn't load profiles right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!hydrated) return;

    loadInitialData();
  }, [hydrated, loadInitialData]);

  // ==========================================
  // LOAD MORE USERS
  // ==========================================

  const loadMore = useCallback(async () => {
    if (
      !hasNextPage ||
      loadingMoreRef.current ||
      loading
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;

      const { data } = await api.get<UsersResponse>("/users", {
        params: {
          page: nextPage,
          limit,
        },
      });

      setUsers((previous) => {
        const existingIds = new Set(
          previous.map((user) => user.id)
        );

        const newUsers = (data.data ?? []).filter(
          (user) => !existingIds.has(user.id)
        );

        return [...previous, ...newUsers];
      });

      setPage(data.pagination.page);
      setLimit(data.pagination.limit);
      setHasNextPage(data.pagination.hasNextPage);

    } catch (error) {
      console.error("Failed to load more profiles:", error);
      toast.error("Couldn't load more profiles.");
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [page, limit, hasNextPage, loading]);

  // ==========================================
  // LOAD MORE INCOMING REQUESTS
  // ==========================================

  const loadMoreIncoming = async () => {
    if (
      loadingIncomingMore ||
      !hasMoreIncoming ||
      !incomingCursor
    ) {
      return;
    }

    try {
      setLoadingIncomingMore(true);

      const { data } = await api.get<IncomingRequestsResponse>(
        "/chats/requests/incoming",
        {
          params: {
            limit: 10,
            cursor: incomingCursor,
          },
        }
      );

      setIncomingRequests((previous) => {
        const existingIds = new Set(
          previous.map((request) => request.id)
        );

        const newRequests = (data.data ?? []).filter(
          (request) => !existingIds.has(request.id)
        );

        return [...previous, ...newRequests];
      });

      setIncomingCursor(data.pagination.nextCursor);
      setHasMoreIncoming(data.pagination.hasMore);

    } catch (error) {
      console.error("Failed to load incoming requests:", error);
      toast.error("Couldn't load more incoming requests.");
    } finally {
      setLoadingIncomingMore(false);
    }
  };

  // ==========================================
  // ACCEPT / REJECT INCOMING REQUEST
  // ==========================================

  const handleRespondToRequest = async (
    request: IncomingRequest,
    status: RequestStatus
  ) => {
    if (respondingIds.has(request.id)) return;

    setRespondingIds((previous) => {
      const next = new Set(previous);
      next.add(request.id);
      return next;
    });

    try {
      await api.patch(
        `/chats/requests/${request.id}/respond`,
        { status }
      );

      setIncomingRequests((previous) =>
        previous.filter((item) => item.id !== request.id)
      );

      if (status === "ACCEPTED") {
        setConnectedIds((previous) => {
          const next = new Set(previous);
          next.add(request.senderId);
          return next;
        });

        toast.success(
          `You are now connected with ${
            request.sender.name || "this student"
          }!`
        );
      } else {
        toast.success("Connection request declined.");
      }

    } catch (error: unknown) {
      console.error("Failed to respond to request:", error);

      const axiosError = error as {
        response?: {
          data?: {
            message?: string | string[];
          };
        };
      };

      const message = axiosError.response?.data?.message;

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message || "Failed to process request."
      );
    } finally {
      setRespondingIds((previous) => {
        const next = new Set(previous);
        next.delete(request.id);
        return next;
      });
    }
  };

  // ==========================================
  // INFINITE SCROLL
  // ==========================================

  const lastUserRef = useCallback(
    (node: HTMLDivElement | null) => {
      observer.current?.disconnect();

      if (!node || !hasNextPage || loadingMore) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "200px" }
      );

      observer.current.observe(node);
    },
    [loadMore, hasNextPage, loadingMore]
  );

  useEffect(() => {
    return () => observer.current?.disconnect();
  }, []);

  // ==========================================
  // SEND CONNECTION REQUEST
  // ==========================================

  const handleConnect = async (receiverId: string) => {
    if (
      requestedIds.has(receiverId) ||
      connectedIds.has(receiverId) ||
      sendingIds.has(receiverId)
    ) {
      return;
    }

    setSendingIds((previous) => {
      const next = new Set(previous);
      next.add(receiverId);
      return next;
    });

    try {
      await api.post("/chats/requests", {
        receiverId,
      });

      setRequestedIds((previous) => {
        const next = new Set(previous);
        next.add(receiverId);
        return next;
      });

      toast.success("Connection request sent!");

    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: {
            message?: string | string[];
          };
        };
      };

      if (axiosError.response?.status === 409) {
        setRequestedIds((previous) => {
          const next = new Set(previous);
          next.add(receiverId);
          return next;
        });

        toast.info("You've already sent a request.");
      } else {
        const message = axiosError.response?.data?.message;

        toast.error(
          Array.isArray(message)
            ? message[0]
            : message || "Failed to send request."
        );
      }
    } finally {
      setSendingIds((previous) => {
        const next = new Set(previous);
        next.delete(receiverId);
        return next;
      });
    }
  };

  // ==========================================
  // FILTER USERS
  // ==========================================

  const filteredUsers = users.filter((user) => {
    const hasIncomingRequest = incomingRequests.some(
      (request) =>
        request.status === "PENDING" &&
        request.sender.id === user.id
    );

    if (
      hasIncomingRequest ||
      connectedIds.has(user.id)
    ) {
      return false;
    }

    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      user.name?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  // ==========================================
  // SKELETON
  // ==========================================

  if (!hydrated || loading) {
    return (
      <div className="space-y-7">
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
              </div>

              <div className="mt-6 h-10 rounded-xl bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Users size={30} />
        </div>

        <h2 className="text-xl font-semibold text-foreground">
          Unable to discover people
        </h2>

        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {error}
        </p>

        <button
          onClick={loadInitialData}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="space-y-10 pb-10">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} />
              Student community
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Discover your next{" "}
              <span className="text-primary">
                collaboration.
              </span>
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Meet talented students, expand your network, and find
              people to build something meaningful together.
            </p>
          </div>

          <div className="relative flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-background/80 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users size={23} />
            </div>

            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {users.length}
                {hasNextPage ? "+" : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Profiles discovered
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INCOMING REQUESTS */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Inbox size={17} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Your network
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-foreground">
              Incoming requests
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Students who want to connect with you.
            </p>
          </div>

          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {incomingRequests.filter((r) => r.status === "PENDING").length} pending
          </span>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Inbox size={23} />
            </div>

            <h3 className="font-semibold text-foreground">
              No incoming requests
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              When students request to connect, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {incomingRequests
              .filter((request) => request.status === "PENDING")
              .map((request) => {
                const senderName = request.sender.name || "Student";
                const isResponding = respondingIds.has(request.id);

                return (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                        {request.sender.avatarUrl ? (
                          <img
                            src={request.sender.avatarUrl}
                            alt={senderName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound size={25} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-foreground">
                          {senderName}
                        </h3>

                        {request.sender.username && (
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            @{request.sender.username}
                          </p>
                        )}

                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-primary">
                          <Clock size={12} />
                          Wants to connect
                        </div>
                      </div>
                    </div>

                    {request.message && (
                      <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                        {request.message}
                      </p>
                    )}

                    <div className="my-4 h-px bg-border" />

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleRespondToRequest(request, "REJECTED")
                        }
                        disabled={isResponding}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50"
                      >
                        <X size={16} />
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRespondToRequest(request, "ACCEPTED")
                        }
                        disabled={isResponding}
                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                      >
                        {isResponding ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Accept
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        )}

        {hasMoreIncoming && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={loadMoreIncoming}
              disabled={loadingIncomingMore}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
            >
              {loadingIncomingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load more requests
                  <ArrowUpRight size={15} />
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* ACCEPTED OUTGOING REQUESTS */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Handshake size={17} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Your network
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-foreground">
              Accepted connections
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Students who accepted your connection requests.
            </p>
          </div>

          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {acceptedOutgoingRequests.length} connected
          </span>
        </div>

        {acceptedOutgoingRequests.length === 0 ? (
          <div className="flex min-h-[170px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Handshake size={23} />
            </div>

            <h3 className="font-semibold text-foreground">
              No accepted connections yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              When someone accepts a request you sent, they will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {acceptedOutgoingRequests.map((request) => {
              const receiver = request.receiver;

              const receiverName =
                receiver?.name || "Student";

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
                      {receiver?.avatarUrl ? (
                        <img
                          src={receiver.avatarUrl}
                          alt={receiverName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <UserRound size={25} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-foreground">
                        {receiverName}
                      </h3>

                      {receiver?.username && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          @{receiver.username}
                        </p>
                      )}

                      <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CheckCircle2 size={13} />
                        Connected
                      </div>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-border" />
{/* 
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Receiver ID
                      </span>
                      <span className="max-w-[65%] truncate font-medium text-foreground">
                        {request.receiverId}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Request ID
                      </span>
                      <span className="max-w-[65%] truncate font-medium text-foreground">
                        {request.id}
                      </span>
                    </div>
                  </div> */}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Request accepted
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                      <Check size={13} />
                      Accepted
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* DISCOVER STUDENTS */}
      <section className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Compass size={17} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Explore community
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-bold text-foreground">
              Discover students
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Find students and send a connection request.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or username..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              {search ? (
                <Search size={27} />
              ) : (
                <GraduationCap size={30} />
              )}
            </div>

            <h3 className="text-lg font-semibold text-foreground">
              {search
                ? "No matching students"
                : "No profiles available"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {search
                ? "Try searching with another name or username."
                : "There are no other student profiles to discover right now."}
            </p>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-sm font-semibold text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredUsers.map((user, index) => {
              const isRequested = requestedIds.has(user.id);
              const isConnected = connectedIds.has(user.id);
              const isSending = sendingIds.has(user.id);

              return (
                <article
                  key={user.id}
                  ref={
                    !search && index === filteredUsers.length - 1
                      ? lastUserRef
                      : null
                  }
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-6"
                >
                  <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-primary/[0.035] transition-colors group-hover:bg-primary/[0.08]" />

                  <div className="relative flex items-center gap-4">
                    <div className="relative shrink-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          loading="lazy"
                          className="h-16 w-16 rounded-2xl border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}

                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                        <GraduationCap size={11} />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-foreground">
                        {user.name || "Student"}
                      </h3>

                      {user.username ? (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Acendra student
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="my-5 h-px bg-border" />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserRound size={15} />
                      <span>Student profile</span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Community
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConnect(user.id)}
                    disabled={isRequested || isSending || isConnected}
                    className={`mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
                      isRequested || isConnected
                        ? "border border-border bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground shadow-sm shadow-primary/10 hover:opacity-90 active:scale-[0.98]"
                    } disabled:cursor-not-allowed`}
                  >
                    {isSending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending request...
                      </>
                    ) : isConnected ? (
                      <>
                        <CheckCircle2 size={17} />
                        Connected
                      </>
                    ) : isRequested ? (
                      <>
                        <Clock size={16} />
                        Request sent
                      </>
                    ) : (
                      <>
                        <UserPlus size={17} />
                        Connect with student
                        <ArrowUpRight size={15} className="ml-auto" />
                      </>
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {/* INFINITE SCROLL TARGET */}
        {!search && hasNextPage && (
          <div
            ref={lastUserRef}
            className="flex items-center justify-center py-5"
          >
            {loadingMore && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={17} className="animate-spin" />
                Discovering more students...
              </div>
            )}
          </div>
        )}

        {!hasNextPage && users.length > 0 && (
          <div className="flex items-center justify-center gap-2 border-t border-border py-6 text-sm text-muted-foreground">
            <CheckCircle2 size={16} className="text-primary" />
            You've caught up with all available profiles.
          </div>
        )}
      </section>
    </div>
  );
}
