"use server";

import { db } from "@/firebase/admin";
import { v4 as uuidv4 } from "uuid";

export interface Script {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string;
  upvotes: string[];
  comments: ScriptComment[];
}

export interface ScriptComment {
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export async function createScript({
  title,
  content,
  tags,
  authorId,
  authorName,
}: {
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
}) {
  try {
    const id = uuidv4();
    const script: Script = {
      id,
      title,
      content,
      tags,
      authorId,
      authorName,
      createdAt: new Date().toISOString(),
      upvotes: [],
      comments: [],
    };
    await db.collection("scripts").doc(id).set(script);
    return { success: true, script };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getScripts({
  tag,
  sort = "recent",
  limit = 20,
}: {
  tag?: string;
  sort?: "recent" | "top";
  limit?: number;
}) {
  try {
    let query = db.collection("scripts") as FirebaseFirestore.Query;
    if (tag) query = query.where("tags", "array-contains", tag);
    if (sort === "top") query = query.orderBy("upvotes", "desc");
    else query = query.orderBy("createdAt", "desc");
    if (limit) query = query.limit(limit);
    const snap = await query.get();
    const scripts = snap.docs.map((doc) => doc.data() as Script);
    return { success: true, scripts };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function upvoteScript(scriptId: string, userId: string) {
  try {
    const ref = db.collection("scripts").doc(scriptId);
    const doc = await ref.get();
    if (!doc.exists) return { success: false, error: "Script not found" };
    const data = doc.data() as Script;
    const upvotes = new Set(data.upvotes || []);
    if (upvotes.has(userId)) upvotes.delete(userId);
    else upvotes.add(userId);
    await ref.update({ upvotes: Array.from(upvotes) });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function commentOnScript(
  scriptId: string,
  {
    userId,
    userName,
    content,
  }: { userId: string; userName: string; content: string }
) {
  try {
    const ref = db.collection("scripts").doc(scriptId);
    const doc = await ref.get();
    if (!doc.exists) return { success: false, error: "Script not found" };
    const data = doc.data() as Script;
    const comments = Array.isArray(data.comments) ? data.comments : [];
    const newComment: ScriptComment = {
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    };
    await ref.update({ comments: [...comments, newComment] });
    return { success: true, comment: newComment };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getScriptById(scriptId: string) {
  try {
    const doc = await db.collection("scripts").doc(scriptId).get();
    if (!doc.exists) return { success: false, error: "Script not found" };
    return { success: true, script: doc.data() as Script };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Fetch all unique tags from the scripts collection.
 */
export async function getAllScriptTags() {
  try {
    const snap = await db.collection("scripts").get();
    const tagSet = new Set<string>();
    snap.docs.forEach((doc) => {
      const data = doc.data() as Script;
      if (Array.isArray(data.tags)) {
        data.tags.forEach((tag) => {
          if (typeof tag === "string" && tag.trim()) {
            tagSet.add(tag.trim());
          }
        });
      }
    });
    return { success: true, tags: Array.from(tagSet).sort() };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
