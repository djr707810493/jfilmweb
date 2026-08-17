export function formatAuthError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";

  const message =
    error instanceof Error ? error.message : "Authentication failed.";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled. Check Firebase Console → Authentication.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled. Please try again.";
    case "auth/popup-blocked":
      return "Pop-up was blocked. Allow pop-ups for this site and try again.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/cancelled-popup-request":
      return "Sign-in was interrupted. Please try again.";
    case "permission-denied":
      return "Could not save your profile. Deploy Firestore rules: npm run firebase:deploy:rules";
    default:
      if (message.includes("Missing or insufficient permissions")) {
        return "Could not save your profile. Deploy Firestore rules: npm run firebase:deploy:rules";
      }
      if (message.includes("Account email must match")) {
        return message;
      }
      return message || "Authentication failed. Please try again.";
  }
}
