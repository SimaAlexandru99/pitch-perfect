import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getDailyPitchStatus } from "@/lib/actions/general.action";
import PitchOfTheDayClient from "./PitchOfTheDayClient";

export default async function PitchOfTheDayPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Check if user has already completed today's challenge
  const isCompleted = await getDailyPitchStatus(user.id);

  if (isCompleted) {
    redirect("/dashboard"); // Redirect to dashboard if already completed
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Daily Pitch Challenge</h1>
        <PitchOfTheDayClient
          userId={user.id}
          userName={user.name || user.email || "User"}
        />
      </div>
    </div>
  );
}
