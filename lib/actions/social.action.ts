"use server";

import { db } from "@/firebase/admin";
import { updateOnboardingStep } from "@/lib/actions/auth.action";
import { v4 as uuidv4 } from "uuid";

export async function sendFriendRequest(fromUserId: string, toUserId: string) {
  try {
    const id = uuidv4();
    const request: FriendRequest = {
      id,
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    await db.collection("friendRequests").doc(id).set(request);
    // Trigger notification
    try {
      await createNotification(toUserId, "friend_request", { fromUserId });
    } catch {
      /* ignore notification errors */
    }
    // Mark onboarding step complete
    try {
      await updateOnboardingStep(fromUserId, "addFriend", true);
    } catch {}
    return { success: true, request };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const doc = await db.collection("friendRequests").doc(requestId).get();
    if (!doc.exists) return { success: false, error: "Request not found" };
    const request = doc.data() as FriendRequest;
    if (request.status !== "pending")
      return { success: false, error: "Request already handled" };
    // Update request status
    await db
      .collection("friendRequests")
      .doc(requestId)
      .update({ status: "accepted" });
    // Add to friends (bidirectional)
    const createdAt = new Date().toISOString();
    await db.collection("friends").add({
      userId: request.fromUserId,
      friendId: request.toUserId,
      createdAt,
    });
    await db.collection("friends").add({
      userId: request.toUserId,
      friendId: request.fromUserId,
      createdAt,
    });
    // Trigger notification
    try {
      await createNotification(request.fromUserId, "friend_accept", {
        toUserId: request.toUserId,
      });
    } catch {
      /* ignore notification errors */
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function declineFriendRequest(requestId: string) {
  try {
    const doc = await db.collection("friendRequests").doc(requestId).get();
    if (!doc.exists) return { success: false, error: "Request not found" };
    const request = doc.data() as FriendRequest;
    if (request.status !== "pending")
      return { success: false, error: "Request already handled" };
    await db
      .collection("friendRequests")
      .doc(requestId)
      .update({ status: "declined" });
    // Trigger notification
    try {
      await createNotification(request.fromUserId, "friend_decline", {
        toUserId: request.toUserId,
      });
    } catch {
      /* ignore notification errors */
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getFriendRequests(userId: string) {
  try {
    const incomingSnap = await db
      .collection("friendRequests")
      .where("toUserId", "==", userId)
      .get();
    const outgoingSnap = await db
      .collection("friendRequests")
      .where("fromUserId", "==", userId)
      .get();
    const incoming = incomingSnap.docs.map(
      (doc) => doc.data() as FriendRequest
    );
    const outgoing = outgoingSnap.docs.map(
      (doc) => doc.data() as FriendRequest
    );
    return { success: true, incoming, outgoing };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getFriends(userId: string) {
  try {
    const snap = await db
      .collection("friends")
      .where("userId", "==", userId)
      .get();
    const friends = snap.docs.map((doc) => doc.data() as Friend);
    return { success: true, friends };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getUsersByIds(
  userIds: string[]
): Promise<{ success: boolean; users?: User[]; error?: string }> {
  try {
    if (!userIds.length) return { success: true, users: [] };
    const usersSnap = await db
      .collection("users")
      .where("__name__", "in", userIds)
      .get();
    const users: User[] = usersSnap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      avatar: doc.data().avatar || "",
      profileURL: doc.data().profileURL || "",
    }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function removeFriend(userId: string, friendId: string) {
  try {
    // Remove both directions
    const snap = await db
      .collection("friends")
      .where("userId", "in", [userId, friendId])
      .where("friendId", "in", [userId, friendId])
      .get();
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function cancelFriendRequest(requestId: string) {
  try {
    await db.collection("friendRequests").doc(requestId).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function createNotification(
  userId: string,
  type: string,
  data: object
) {
  try {
    const id = uuidv4();
    const notification = {
      id,
      userId,
      type,
      data,
      createdAt: new Date().toISOString(),
      read: false,
    };
    await db.collection("notifications").doc(id).set(notification);
    return { success: true, notification };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getNotifications(userId: string) {
  try {
    const snap = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();
    const notifications = snap.docs.map((doc) => doc.data());
    return { success: true, notifications };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await db
      .collection("notifications")
      .doc(notificationId)
      .update({ read: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
