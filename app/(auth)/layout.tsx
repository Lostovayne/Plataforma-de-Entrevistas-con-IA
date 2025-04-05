import { JSX } from "react";

const AuthLayout = ({ children }: { children: JSX.Element }) => {
  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;
