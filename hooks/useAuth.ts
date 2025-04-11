import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AuthResult = { success: boolean; message?: string };

const useAuth = () => {
  //* Hooks para manejar el estado de autenticación *//
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignUp = async (name: string, email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredentials.user.uid;
      const result = await signUp({ uid, name, email });

      if (!result?.success) {
        toast.error(result?.message);
        return { success: false, message: result?.message };
      }

      toast.success("Registro exitoso. Por favor inicie sesión para continuar");
      router.push("/sign-in");
      return { success: true };
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/email-already-in-use") {
          toast.error("El correo electrónico ya está en uso. Por favor usa otro correo electrónico");
          return { success: false, message: "El correo electrónico ya está en uso" };
        }
        if (error.code === "auth/weak-password") {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          return { success: false, message: "La contraseña debe tener al menos 6 caracteres" };
        }
        return { success: false, message: error.message };
      }
      return { success: false, message: "Error al registrarse" };
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      const userCredentials = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredentials.user.getIdToken();

      if (!idToken) {
        return { success: false, message: "Error al iniciar sesión" };
      }
      const result = signIn({ email, idToken });

      toast.promise(result, {
        loading: "Iniciando sesión...",
        success: "Inicio de sesión exitoso",
        error: "Error al iniciar sesión",
      });

      router.push("/");
      return { success: true };
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credential") {
          toast.error("Las credenciales son incorrectas. Por favor verifica tus datos de acceso");
          return { success: false, message: "Correo o contraseña incorrectos" };
        }
        return { success: false, message: error.message };
      }
      return { success: false, message: "Error al iniciar sesión" };
    } finally {
      setLoading(false);
    }
  };

  return { handleSignUp, handleSignIn, loading };
};

export default useAuth;
