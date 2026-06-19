"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const onLogout = async () => {
    if (!hasSupabaseEnv()) return;

    setIsSigningOut(true);
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.replace("/login");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isSigningOut}
      onClick={() => void onLogout()}
      className="shrink-0"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isSigningOut ? "Signing out..." : "Log out"}
    </Button>
  );
}
