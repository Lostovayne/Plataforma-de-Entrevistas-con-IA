"use server";
import { auth, db } from "@/firebase/admin";
import { FirebaseError } from "firebase/app";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams): Promise<{ success: boolean; message: string } | undefined> {
  const { uid, name, email } = params;

  try {
    //* Busca si el usuario ya existe en la base de datos
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "El usuario ya existe. Por favor inicie sesión para continuar",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Cuenta creada exitosamente. Por favor inicie sesión para continuar",
    };

  } catch (error) {
    console.log("Error creating a user", error);
    if (error instanceof FirebaseError) {
      if (error.code === "auth/email-already-exists" || error.code === "auth/email-already-in-use") {
        return {
          success: false,
          message: "This email is already in use. Please use another email.",
        };
      }
    }

    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}


export async function signIn(params: SignInParams): Promise<{ success: boolean; message: string } | undefined> {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return {
        success: false,
        message: "User not found. Please sign up instead.",
      };
    }
    // Create a session cookie
    await setSessionCookie(idToken);
  } catch (error) {
    console.log("Error signing in", error);
    return {
      success: false,
      message: "Failed to log into an account",
    };
  }
}

export async function setSessionCookie(idToken: string): Promise<void> {
  //* Set the session cookie
  const cookieStore = await cookies();

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });

  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}
