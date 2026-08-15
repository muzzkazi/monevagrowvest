import { Link } from "react-router-dom";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";

/**
 * Wraps admin-only routes. The real protection is the RLS policies on the
 * client tables — this only controls what the UI renders.
 *
 * allowAdvisor: also let read-only advisor accounts through.
 */
const AdminGuard = ({
  children,
  allowAdvisor = false,
}: {
  children: React.ReactNode;
  allowAdvisor?: boolean;
}) => {
  const { isAdmin, isTeam, loading, user } = useIsAdmin();
  const allowed = allowAdvisor ? isTeam : isAdmin;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-financial-accent" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Restricted area</h1>
          <p className="text-sm text-muted-foreground">
            {user
              ? "This account does not have advisor access."
              : "Sign in with your advisor account to continue."}
          </p>
          {!user && (
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
