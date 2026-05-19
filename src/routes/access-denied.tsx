import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth, ROLE_META } from "@/lib/auth";

export const Route = createFileRoute("/access-denied")({
  component: AccessDeniedPage,
});

function AccessDeniedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const meta = user ? ROLE_META[user.role] : null;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Access denied</h1>
        <p className="text-sm text-muted-foreground mt-2">
          You don't have permission to view this page.
          {user && meta && (
            <>
              {" "}
              Your role is{" "}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.color}`}
              >
                {meta.label}
              </span>
              .
            </>
          )}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-dark"
          >
            Go to your dashboard
          </button>
          <Link
            to="/login"
            className="h-10 px-4 rounded-lg border border-border bg-background font-semibold text-sm inline-flex items-center"
          >
            Sign in as someone else
          </Link>
        </div>
      </div>
    </div>
  );
}
