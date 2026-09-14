"use server";

import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  try {
    await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirectTo: "/admin",
    });

    return { error: null, success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            error: "Email ou mot de passe incorrect.",
            success: false,
          };
        default:
          return {
            error: "Une erreur est survenue lors de la connexion.",
            success: false,
          };
      }
    }
    // NEXT_REDIRECT throws an error that we need to re-throw
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
