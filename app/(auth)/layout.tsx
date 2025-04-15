
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import { JSX } from 'react';

const AuthLayout = async ({ children }: { children: JSX.Element }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect('/');
  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
