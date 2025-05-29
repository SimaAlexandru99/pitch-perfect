import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2),
  domain: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  description: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.format() },
        { status: 400 },
      );
    }
    const docRef = await db.collection("sales_jobs").add({
      ...parsed.data,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: (error as Error).message },
      { status: 500 },
    );
  }
}
