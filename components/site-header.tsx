"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { navigationData } from "@/constants";
import {
  getNotifications,
  getUsersByIds,
  markNotificationRead,
} from "@/lib/actions/social.action";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { IconNotification } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Notification type for this component
interface Notification {
  id: string;
  userId: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

function findPageTitle(pathname: string): string {
  // Helper to search in a list of items
  const search = (
    items: Array<{ [key: string]: unknown }>,
    key = "url",
    label = "title",
  ) =>
    items.find((item) => item[key] === pathname)?.[label] as string | undefined;

  // Search main nav
  let title = search(navigationData.navMain);
  if (title) return title;

  // Search navClouds and sub-items
  for (const cloud of navigationData.navClouds) {
    if (cloud.url === pathname) return cloud.title;
    if (cloud.items) {
      const sub = search(cloud.items);
      if (sub) return sub;
    }
  }

  // Search navSecondary
  title = search(navigationData.navSecondary);
  if (title) return title;

  // Search documents (label is 'name')
  title = search(navigationData.documents, "url", "name");
  if (title) return title;

  // Fallback
  return "Dashboard";
}

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = findPageTitle(pathname);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<
    Record<string, { name: string; email: string; avatar: string }>
  >({});

  useEffect(() => {
    if (!showNotifications || !user?.id) return;
    setLoading(true);
    setError(null);
    getNotifications(user.id)
      .then(async (res) => {
        if (res.success) {
          const notifs = (res.notifications ?? []) as Notification[];
          setNotifications(notifs);
          // Collect all user IDs from notification data
          const ids = Array.from(
            new Set(
              notifs
                .map((n) =>
                  n.type === "friend_request"
                    ? n.data?.fromUserId
                    : n.type === "friend_accept" || n.type === "friend_decline"
                      ? n.data?.toUserId
                      : null,
                )
                .filter(Boolean),
            ),
          ) as string[];
          if (ids.length) {
            const usersRes = await getUsersByIds(ids);
            if (usersRes.success && usersRes.users) {
              const map: Record<
                string,
                { name: string; email: string; avatar: string }
              > = {};
              usersRes.users.forEach((u) => {
                map[u.id] = { name: u.name, email: u.email, avatar: u.avatar };
              });
              setUserMap(map);
            }
          } else {
            setUserMap({});
          }
        } else setError(res.error || "Failed to load notifications.");
      })
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false));
  }, [showNotifications, user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  function UserMini({ id }: { id: string }) {
    const u = userMap[id];
    if (!u) return null;
    return (
      <div className="flex items-center gap-2">
        {u.avatar ? (
          <Image
            src={u.avatar}
            alt={u.name}
            width={28}
            height={28}
            className="rounded-full object-cover border border-primary/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-base font-bold text-primary/80 border border-primary/10">
            {u.name?.[0] || u.email[0]}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium text-xs leading-tight">{u.name}</span>
          <span className="text-xs text-muted-foreground">{u.email}</span>
        </div>
      </div>
    );
  }

  return (
    <header
      className={cn(
        "flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
      )}
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className={cn("-ml-1")} />
        <Separator
          orientation="vertical"
          className={cn("mx-2 data-[orientation=vertical]:h-4")}
        />
        <h1 className={cn("text-base font-medium")}>{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            asChild
            size="sm"
            className={cn("hidden sm:flex")}
          >
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Show notifications"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative"
          >
            <IconNotification className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center border-2 border-background">
                {unreadCount}
              </span>
            )}
          </Button>
          {/* Notification dropdown/modal */}
          {showNotifications && (
            <div className="absolute right-4 top-14 z-50 w-80 rounded-lg bg-background shadow-lg border p-4">
              <div className="font-semibold mb-2">Notifications</div>
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <Loader2 className="animate-spin size-6 text-primary" />
                </div>
              ) : error ? (
                <div className="text-rose-400 text-sm">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No notifications yet.
                </div>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        "rounded px-2 py-2 flex items-start gap-2 cursor-pointer transition hover:bg-accent",
                        !n.read && "bg-rose-50/60 border-l-4 border-rose-400",
                      )}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {n.type === "friend_request" && "New friend request"}
                          {n.type === "friend_accept" &&
                            "Friend request accepted"}
                          {n.type === "friend_decline" &&
                            "Friend request declined"}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {n.type === "friend_request" &&
                            typeof n.data?.fromUserId === "string" && (
                              <UserMini id={n.data.fromUserId} />
                            )}
                          {(n.type === "friend_accept" ||
                            n.type === "friend_decline") &&
                            typeof n.data?.toUserId === "string" && (
                              <UserMini id={n.data.toUserId} />
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <span className="ml-2 mt-1 w-2 h-2 rounded-full bg-rose-500" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
