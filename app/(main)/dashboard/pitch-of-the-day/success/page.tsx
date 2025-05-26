import { Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PitchOfTheDaySuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="relative flex flex-col items-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-white rounded-2xl shadow-xl px-8 py-12 border border-yellow-200">
        <span className="absolute -top-8 text-5xl select-none">🎉</span>
        <Trophy className="h-16 w-16 text-yellow-500 mb-4 drop-shadow-lg" />
        <h1 className="text-3xl font-bold text-yellow-900 mb-2 text-center">
          Congratulations!
        </h1>
        <p className="text-lg text-yellow-800 mb-4 text-center max-w-md">
          You&apos;ve completed today&apos;s{" "}
          <span className="font-semibold">Daily Pitch Challenge</span>.<br />
          Come back tomorrow for a new challenge and keep your streak alive!
        </p>
        <Link href="/dashboard">
          <Button
            size="lg"
            className="mt-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-300 font-semibold shadow"
          >
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
