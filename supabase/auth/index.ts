// Export all auth functions and types from a single entry point
export * from "./types";
export * from "./utils";
export * from "./email-signup";
export * from "./signin";
export * from "./discord-signup";
export * from "./session";

// Re-export specific functions to ensure they're available
// These explicit re-exports are necessary because the main auth.tsx file imports them directly
export { signUp } from "./email-signup";
export { signIn, signInWithDiscord } from "./signin";
export { signOut } from "./signin";
export { handleDiscordSignup, processOAuthCallback } from "./discord-signup";
export { verifyEmailToken, refreshSession } from "./session";
