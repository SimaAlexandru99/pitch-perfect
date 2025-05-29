"use client";

import { AddFriendDialog } from "@/app/(main)/dashboard/profile/add-friend-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  getFriends,
  getUsersByIds,
  removeFriend,
} from "@/lib/actions/social.action";
import { useAuth } from "@/lib/hooks/use-auth";
import { Loader2, UserCheck2, Users, UserX2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function getUserMap(users: User[]): Record<string, User> {
  return users.reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, User>,
  );
}

export function FriendsList() {
  const { user, loading: authLoading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // requestId for accept/decline
  const [removeDialog, setRemoveDialog] = useState<null | {
    friendId: string;
    user: User;
  }>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    Promise.all([getFriends(user.id), getFriendRequests(user.id)])
      .then(async ([friendsRes, requestsRes]) => {
        if (friendsRes.success) setFriends(friendsRes.friends ?? []);
        else setError(friendsRes.error || "Failed to load friends.");
        if (requestsRes.success) {
          setRequests(requestsRes.incoming ?? []);
          setOutgoingRequests(requestsRes.outgoing ?? []);
        } else setError(requestsRes.error || "Failed to load requests.");

        // Collect all unique user IDs (friends + request senders + outgoing recipients)
        const friendIds = (friendsRes.friends ?? []).map((f) => f.friendId);
        const requestFromIds = (requestsRes.incoming ?? []).map(
          (r) => r.fromUserId,
        );
        const requestToIds = (requestsRes.outgoing ?? []).map(
          (r) => r.toUserId,
        );
        const allIds = Array.from(
          new Set([...friendIds, ...requestFromIds, ...requestToIds]),
        );
        if (allIds.length) {
          const usersRes = await getUsersByIds(allIds);
          if (usersRes.success && usersRes.users) {
            setUserMap(getUserMap(usersRes.users));
          }
        } else {
          setUserMap({});
        }
      })
      .catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, [user?.id]);

  async function handleAccept(requestId: string) {
    setActionLoading(requestId);
    const res = await acceptFriendRequest(requestId);
    setActionLoading(null);
    if (res.success) {
      toast.success("Friend request accepted!");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      // Refetch friends
      if (user?.id) {
        const friendsRes = await getFriends(user.id);
        if (friendsRes.success) setFriends(friendsRes.friends ?? []);
      }
    } else {
      toast.error(res.error || "Failed to accept request.");
    }
  }

  async function handleDecline(requestId: string) {
    setActionLoading(requestId);
    const res = await declineFriendRequest(requestId);
    setActionLoading(null);
    if (res.success) {
      toast.success("Friend request declined.");
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      toast.error(res.error || "Failed to decline request.");
    }
  }

  async function handleRemove(friendId: string) {
    if (!user?.id) return;
    setRemovingId(friendId);
    const res = await removeFriend(user.id, friendId);
    setRemovingId(null);
    setRemoveDialog(null);
    if (res.success) {
      toast.success("Friend removed.");
      setFriends((prev) => prev.filter((f) => f.friendId !== friendId));
    } else {
      toast.error(res.error || "Failed to remove friend.");
    }
  }

  async function handleCancel(requestId: string) {
    setCancelingId(requestId);
    const res = await cancelFriendRequest(requestId);
    setCancelingId(null);
    if (res.success) {
      toast.success("Friend request canceled.");
      setOutgoingRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      toast.error(res.error || "Failed to cancel request.");
    }
  }

  function UserAvatar({ user }: { user: User }) {
    return (
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name || user.email}
            width={36}
            height={36}
            className="rounded-full object-cover border border-primary/30"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-primary/80 border border-primary/20">
            {user.name?.[0] || user.email[0]}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium text-base leading-tight">
            {user.name || user.email}
          </span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin size-8 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-rose-400">
        <UserX2 className="size-10 mb-2" />
        <div className="font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="size-6 text-primary" /> Friends
        </h1>
        {user?.id && <AddFriendDialog currentUserId={user.id} />}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Pending Requests</h2>
          {requests.length === 0 ? (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <UserCheck2 className="size-4" /> No pending requests.
            </div>
          ) : (
            <ul className="space-y-2">
              {requests.map((req) => {
                const fromUser = userMap[req.fromUserId];
                return (
                  <li
                    key={req.id}
                    className="flex items-center justify-between"
                  >
                    {fromUser ? (
                      <UserAvatar user={fromUser} />
                    ) : (
                      <span>{req.fromUserId}</span>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={actionLoading === req.id}
                        onClick={() => handleAccept(req.id)}
                      >
                        {actionLoading === req.id ? (
                          <Loader2 className="animate-spin size-4 mr-1" />
                        ) : null}
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === req.id}
                        onClick={() => handleDecline(req.id)}
                      >
                        {actionLoading === req.id ? (
                          <Loader2 className="animate-spin size-4 mr-1" />
                        ) : null}
                        Decline
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Requests You Sent</h2>
          {outgoingRequests.length === 0 ? (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <UserCheck2 className="size-4" /> No outgoing requests.
            </div>
          ) : (
            <ul className="space-y-2">
              {outgoingRequests.map((req) => {
                const toUser = userMap[req.toUserId];
                return (
                  <li
                    key={req.id}
                    className="flex items-center justify-between"
                  >
                    {toUser ? (
                      <UserAvatar user={toUser} />
                    ) : (
                      <span>{req.toUserId}</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={cancelingId === req.id}
                      onClick={() => handleCancel(req.id)}
                    >
                      {cancelingId === req.id ? (
                        <Loader2 className="animate-spin size-4 mr-1" />
                      ) : null}
                      Cancel
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-2">Your Friends</h2>
          {friends.length === 0 ? (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <UserX2 className="size-4" /> You have no friends yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {friends.map((friend) => {
                const friendUser = userMap[friend.friendId];
                return (
                  <li
                    key={friend.friendId}
                    className="flex items-center justify-between"
                  >
                    {friendUser ? (
                      <UserAvatar user={friendUser} />
                    ) : (
                      <span>{friend.friendId}</span>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={removingId === friend.friendId}
                      onClick={() =>
                        friendUser &&
                        setRemoveDialog({
                          friendId: friend.friendId,
                          user: friendUser,
                        })
                      }
                    >
                      {removingId === friend.friendId ? (
                        <Loader2 className="animate-spin size-4 mr-1" />
                      ) : null}
                      Remove
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
      {/* Remove Friend Confirmation Dialog */}
      <Dialog open={!!removeDialog} onOpenChange={() => setRemoveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Friend</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {removeDialog?.user && (
              <div className="flex items-center gap-3 mb-2">
                <UserAvatar user={removeDialog.user} />
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove this friend? This action cannot be
              undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                removeDialog && handleRemove(removeDialog.friendId)
              }
              disabled={!!removingId}
            >
              {removingId ? (
                <Loader2 className="animate-spin size-4 mr-1" />
              ) : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
