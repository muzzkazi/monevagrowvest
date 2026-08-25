import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type TeamRole = "admin" | "advisor" | "user";

/**
 * Server-validated role check. Reads the user_roles table (protected by RLS),
 * never local storage.
 * - admin  : full read/write on the client book + role management
 * - advisor: read-only access to the client book
 */
export const useIsAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<TeamRole[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedUserId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    if (authLoading) return;
    if (!user) {
      setRoles([]);
      loadedUserId.current = null;
      setLoading(false);
      return;
    }
    const sameUserAlreadyLoaded = loadedUserId.current === user.id;
    if (!sameUserAlreadyLoaded) setLoading(true);
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setRoles(((data ?? []).map((r) => r.role) as TeamRole[]) ?? []);
        loadedUserId.current = user.id;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const isAdmin = roles.includes("admin");
  const isAdvisor = roles.includes("advisor");

  return {
    isAdmin,
    isAdvisor,
    // anyone who may view the client book
    isTeam: isAdmin || isAdvisor,
    // only admins may write
    canEdit: isAdmin,
    roles,
    loading: loading || authLoading,
    user,
  };
};
