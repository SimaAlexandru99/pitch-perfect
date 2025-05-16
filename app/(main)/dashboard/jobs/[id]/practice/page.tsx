import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface PracticePageProps {
  params: { id: string };
}

export default function PracticePage({ params }: PracticePageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-xl p-8 flex flex-col items-center gap-6 shadow-lg border border-border rounded-2xl bg-card">
        <h1 className="text-2xl font-bold text-center text-primary">
          Practice for this Job
        </h1>
        <p className="text-base text-muted-foreground text-center">
          This is a placeholder for the practice experience for this job (ID:{" "}
          <span className="font-mono text-primary-foreground bg-primary/10 px-2 py-1 rounded">
            {params.id}
          </span>
          ).
        </p>
        <Button asChild className="mt-4">
          <Link href={`/dashboard/jobs/${params.id}`}>Back to Job Details</Link>
        </Button>
      </Card>
    </div>
  );
}
