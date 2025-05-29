"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Onboarding steps type
export type OnboardingSteps = {
  profile: boolean;
  firstGame: boolean;
  addFriend: boolean;
  firstAchievement: boolean;
};

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
      // profileURL,
      // resumeURL,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: unknown) {
    console.error("Error creating user:", error);

    // Type guard to check if error is FirebaseError
    if (error && typeof error === "object" && "code" in error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === "auth/email-already-exists") {
        return {
          success: false,
          message: "This email is already in use",
        };
      }
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);

    return { success: true, message: "Signed in successfully" };
  } catch (error: unknown) {
    console.log("Sign in error:", error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();

  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    // Invalid or expired session
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// Get onboarding steps for a user
export async function getOnboardingSteps(
  userId: string,
): Promise<{ success: boolean; steps?: OnboardingSteps; error?: string }> {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return { success: false, error: "User not found" };
    const data = userDoc.data();
    const steps: OnboardingSteps = data?.onboardingSteps || {
      profile: false,
      firstGame: false,
      addFriend: false,
      firstAchievement: false,
    };
    return { success: true, steps };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Update a single onboarding step
export async function updateOnboardingStep(
  userId: string,
  step: keyof OnboardingSteps,
  value: boolean,
) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          onboardingSteps: { [step]: value },
        },
        { merge: true },
      );
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Update user profile (name, avatar)
export async function updateUserProfile(
  userId: string,
  name: string,
  avatar: string,
) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .set({ name, avatar }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// Get onboarding dismissed flag
export async function getOnboardingDismissed(userId: string): Promise<boolean> {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return false;
    const data = userDoc.data();
    return !!data?.onboardingDismissed;
  } catch {
    return false;
  }
}

// Set onboarding dismissed flag
export async function setOnboardingDismissed(userId: string, value: boolean) {
  try {
    await db
      .collection("users")
      .doc(userId)
      .set({ onboardingDismissed: value }, { merge: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
