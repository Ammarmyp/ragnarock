"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";
import { clearBearerToken } from "@/lib/auth/bearer-token";
import { clearLastActiveOrganizationIdClient } from "@/lib/organization/last-active-organization";
import { toast } from "@/lib/toast";
import { getInitials } from "@/utils/helpers";
import { cn } from "@/lib/utils";

export type DashboardUserMenuFallback = {
  name: string;
  email: string;
  avatar?: string;
};

type DashboardUserMenuProps = {
  user?: DashboardUserMenuFallback;
};

export function DashboardUserMenu({
  user = {
    name: "Demo User",
    email: "demo@example.com",
  },
}: DashboardUserMenuProps) {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const resolved = {
    name: session?.user?.name || user.name,
    email: session?.user?.email || user.email,
    avatar: session?.user?.image || user.avatar,
  };

  const handleSignOut = async () => {
    try {
      const loadingToast = toast.loading("Logging out...");
      const result = await authClient.signOut();
      if (result.error) {
        toast.error("Could not log out", { id: loadingToast });
        return;
      }
      clearBearerToken();
      clearLastActiveOrganizationIdClient();
      queryClient.clear();
      toast.success("Logged out", { id: loadingToast });
      window.location.assign("/sign-in");
    } catch (error) {
      console.error("Sign out failed", error);
      toast.error("Failed to log out");
    }
  };

  const themeValue = !mounted ? "system" : (theme ?? "system");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative size-9 shrink-0 overflow-hidden rounded-lg p-0",
            "border border-border/70 bg-card shadow-sm",
            "ring-offset-background transition-[box-shadow,transform,background-color,border-color] duration-150",
            "hover:border-border hover:bg-accent/50 hover:shadow-md",
            "active:scale-[0.98]",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
          aria-label="Open account menu"
        >
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={resolved.avatar} alt={resolved.name} className="object-cover" />
            <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              {getInitials(resolved.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex flex-col gap-0.5 px-2 py-2">
            <span className="truncate text-sm font-semibold leading-none">{resolved.name}</span>
            <span className="truncate text-xs leading-snug text-muted-foreground">{resolved.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer p-0">
          <Link href="/account/preferences" className="flex items-center gap-2 px-1.5 py-1">
            <Settings className="size-4 shrink-0 opacity-70" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={themeValue} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light" className="gap-2">
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark" className="gap-2">
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system" className="gap-2">
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2" onClick={() => void handleSignOut()}>
          <LogOut className="size-4 shrink-0" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
