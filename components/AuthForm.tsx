"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { FirebaseError } from "firebase/app";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import FormField from "./FormField";
import { Button } from "./ui/button";

const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().min(3, "El nombre es obligatorio") : z.string().optional(),
    email: z.string().email("Correo inválido"),
    password: z.string().min(3, "La contraseña debe tener al menos 3 caracteres"),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const formSchema = authFormSchema(type);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        //* Envia los valores al server action para registrar al usuario *//
        const { name, email, password } = values;
        const userCretentials = await createUserWithEmailAndPassword(auth, email, password);
        const result = await signUp({
          uid: userCretentials.user.uid,
          name: name!,
          email,
          password,
        });
        if (!result?.success) {
          toast.error(result?.message);
          return;
        }

        toast.success("Registro exitoso. Por favor inicie sesión para continuar");
        router.push("/sign-in");
      } else {
        //* Envia los valores al server action para iniciar sesión *//
        const { email, password } = values;
        const userCredentials = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          toast.error("Error al iniciar sesión");
          return;
        }
        const result = signIn({ email, idToken });
        // toast.success("Inicio de sesión exitoso");
        toast.promise(result, {
          loading: "Iniciando sesión...",
          success: "Inicio de sesión exitoso",
          error: "Error al iniciar sesión",
        });
        router.push("/");
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/invalid-credential") {
          toast.error("Correo o contraseña incorrectos");
          return;
        }
      }
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" width={38} height={32} />
          <h2 className="text-primary-100">PrepWise</h2>
        </div>

        <h3>Practica entrevistas con IA</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField
                control={form.control}
                name={"name"}
                label="Nombre"
                placeholder="Ingresa tu nombre"
                type="text"
              />
            )}
            <FormField
              control={form.control}
              name={"email"}
              label="Correo electrónico"
              placeholder="Tu correo electrónico"
              type="email"
            />
            <FormField
              control={form.control}
              name={"password"}
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
            />
            <Button type="submit" className="btn">
              {isSignIn ? "Iniciar sesión" : "Crear una cuenta"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "¿No tienes una cuenta?" : "¿Ya tienes una cuenta?"}
          <Link
            prefetch
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Iniciar sesión" : "Regístrate"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
