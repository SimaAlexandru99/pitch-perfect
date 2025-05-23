export const dynamic = "force-dynamic";
import { getScriptById } from "@/lib/actions/scripts.action";
import { Metadata } from "next";
import Link from "next/link";
import ScriptDetailCard from "./script-detail-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { success, script } = await getScriptById(id);
  if (!success || !script) return {};
  return {
    title: script.title,
    description: script.content.slice(0, 120),
  };
}

export default async function ScriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { success, script, error } = await getScriptById(id);

  if (!success || !script) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Script Not Found</h2>
        <p className="text-muted-foreground mb-6">
          {error || "The script you are looking for does not exist."}
        </p>
        <Link href="/dashboard/scripts" className="text-primary underline">
          Back to Scripts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 sm:px-4 space-y-6 w-full">
      <div className="sticky top-2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-md py-2 px-2 rounded-md shadow-sm w-fit sm:w-auto">
        <Link
          href="/dashboard/scripts"
          className="text-muted-foreground text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded transition-all"
        >
          ← Back to Scripts
        </Link>
      </div>
      <ScriptDetailCard script={script} />
    </div>
  );
}
