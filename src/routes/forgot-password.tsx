import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#2B7FFF] via-[#1A5FCC] to-[#0D1B2A]">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <div className="rounded-2xl bg-card border border-border shadow-card-lg p-7">
          {!sent ? (
            <>
              <h2 className="font-display text-xl font-bold">Forgot your password?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We'll email you a secure reset link.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 h-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <button className="w-full h-10 rounded-lg bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-sm">
                  Send reset link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-lg font-bold">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We've sent a reset link to{" "}
                <span className="font-semibold text-foreground">{email}</span>.
              </p>
              <Link
                to="/login"
                className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Return to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
