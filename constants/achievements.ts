export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  hint: string;
}

export const ALL_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "perfect_pitch",
    name: "Perfect Pitch",
    description: "Give a perfect response in a game.",
    icon: "Award",
    hint: "Give a perfect response to unlock.",
  },
  {
    id: "streak_5",
    name: "Streak Master",
    description: "Achieve a 5-response streak.",
    icon: "Flame",
    hint: "Get 5 correct answers in a row.",
  },
  {
    id: "level_5",
    name: "Level 5 Reached",
    description: "Reach level 5 in any game mode.",
    icon: "Star",
    hint: "Level up to 5 in any mode.",
  },
  {
    id: "first_win",
    name: "First Victory",
    description: "Win your first game.",
    icon: "Trophy",
    hint: "Win a game to unlock.",
  },
  {
    id: "feedback_10",
    name: "Feedback Fanatic",
    description: "Complete 10 interview practices.",
    icon: "MessageSquare",
    hint: "Finish 10 interview practices.",
  },
  // Add more as needed
];
