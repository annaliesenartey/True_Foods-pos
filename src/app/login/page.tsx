import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">🥛</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">True Foods</h1>
          <p className="text-muted-foreground text-sm">Staff Point of Sale</p>
        </div>

        {/* Login card */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Sign in to your account</h2>
          <LoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          True Foods POS v1.0 · Staff access only
        </p>
      </div>
    </div>
  );
}
