"use server";
import { db } from "@/firebase/admin";
import { FirebaseError } from "firebase/app";

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    //* Busca si el usuario ya existe en la base de datos
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });
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

export async function setSessionCookie(idToken: string) {
  console.log("idToken", idToken);
  //* Set the session cookie
}
