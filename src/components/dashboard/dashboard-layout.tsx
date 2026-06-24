import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { TopHeader } from "@/components/dashboard/top-header";
import { supabase } from "@/integrations/supabase/client";

interface DashboardLayoutProps {
  children: React.ReactNode;
  name?: string;
  avatarUrl?: string | null;
}

export function DashboardLayout({ children, name = "You", avatarUrl }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopHeader name={name} avatarUrl={avatarUrl} onSignOut={signOut} />
        <MobileSidebar />
        {children}
      </div>
    </div>
  );
}
