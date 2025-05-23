import { getScripts } from "@/lib/actions/scripts.action";
import AddScriptDialog from "./add-script-dialog";
import ScriptsList from "./scripts-list";

export default async function ScriptsPage() {
  const { success, scripts } = await getScripts({ sort: "top", limit: 20 });

  return (
    <div className="max-w-5xl mx-auto py-8 px-2 sm:px-4 space-y-8 w-full">
      <div className="flex items-center justify-between mb-6 w-full">
        <h1 className="text-2xl font-bold">Community Scripts & Resources</h1>
        <div className="hidden sm:block">
          <AddScriptDialog />
        </div>
      </div>
      <div className="sm:hidden fixed bottom-6 right-6 z-20">
        <AddScriptDialog />
      </div>
      {success && scripts && scripts.length > 0 ? (
        <ScriptsList scripts={scripts} />
      ) : (
        <div className="col-span-2 text-center text-muted-foreground">
          No scripts/resources found.
        </div>
      )}
    </div>
  );
}
