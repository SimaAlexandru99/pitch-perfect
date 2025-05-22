import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getScripts } from "@/lib/actions/scripts.action";
import Link from "next/link";
import AddScriptDialog from "./add-script-dialog";

export default async function ScriptsPage() {
  const { success, scripts } = await getScripts({ sort: "top", limit: 20 });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Community Scripts & Resources</h1>
        <AddScriptDialog />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {success && scripts && scripts.length > 0 ? (
          scripts.map((script) => (
            <Card
              key={script.id}
              className="p-4 flex flex-col gap-2 hover:shadow-lg transition-all"
            >
              <Link
                href={`/dashboard/scripts/${script.id}`}
                className="font-semibold text-lg hover:underline"
              >
                {script.title}
              </Link>
              <div className="flex flex-wrap gap-2 mt-1">
                {script.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <span>By {script.authorName}</span>
                <span>•</span>
                <span>{new Date(script.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>👍 {script.upvotes.length}</span>
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {script.content.slice(0, 120)}
                {script.content.length > 120 ? "..." : ""}
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center text-muted-foreground">
            No scripts/resources found.
          </div>
        )}
      </div>
    </div>
  );
}
