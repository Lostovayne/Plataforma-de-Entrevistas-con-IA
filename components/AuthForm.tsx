'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form } from '@/components/ui/form';
import Image from 'next/image';
import Link from 'next/link';

import useAuth from '@/hooks/useAuth';
import { FC } from 'react';
import FormField from './FormField';
import { Button } from './ui/button';

//** Schema para el login y registro de usuarios */
const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === 'sign-up' ? z.string().min(3, 'El nombre es obligatorio') : z.string().optional(),
    email: z.string().email('Correo inválido'),
    password: z.string().min(3, 'La contraseña debe tener al menos 3 caracteres'),
  });
};

export type FormType = 'sign-in' | 'sign-up';

interface AuthFormProps {
  type: FormType;
}

const AuthForm: FC<AuthFormProps> = ({ type }) => {
  const isSignIn = type === 'sign-in';
  const formSchema = authFormSchema(type);
  const { handleSignUp, handleSignIn } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (type === 'sign-up') {
      const { name, email, password } = values;
      await handleSignUp(name!, email, password);
    } else {
      const { email, password } = values;
      await handleSignIn(email, password);
    }
  }

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
                name={'name'}
                label="Nombre"
                placeholder="Ingresa tu nombre"
                type="text"
              />
            )}
            <FormField
              control={form.control}
              name={'email'}
              label="Correo electrónico"
              placeholder="Tu correo electrónico"
              type="email"
            />
            <FormField
              control={form.control}
              name={'password'}
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              type="password"
            />
            <Button type="submit" className="btn">
              {isSignIn ? 'Iniciar sesión' : 'Crear una cuenta'}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
          <Link
            prefetch
            href={isSignIn ? '/sign-up' : '/sign-in'}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? 'Iniciar sesión' : 'Regístrate'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
