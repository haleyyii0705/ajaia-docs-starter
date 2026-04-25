import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/types/docs";

interface UserSwitcherProps {
  users: User[];
  currentUserId: string;
  onUserChange: (userId: string) => void;
}

export function UserSwitcher({
  users,
  currentUserId,
  onUserChange,
}: UserSwitcherProps) {
  const current = users.find((u) => u.id === currentUserId) ?? users[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 pl-1.5 pr-2">
          <Avatar user={current} />
          <span className="hidden text-xs font-medium md:inline">
            {current.email}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
          Switch user (demo)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((u) => (
          <DropdownMenuItem
            key={u.id}
            onSelect={() => onUserChange(u.id)}
            className="gap-2"
          >
            <Avatar user={u} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{u.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {u.email}
              </span>
            </div>
            {u.id === currentUserId && (
              <span className="ml-auto text-[10px] font-semibold uppercase text-primary">
                Active
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Avatar({
  user,
  size = "sm",
}: {
  user: { initials: string; color: string };
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-[10px] font-semibold text-white",
        size === "sm" ? "h-6 w-6" : "h-8 w-8 text-xs",
        user.color,
      )}
      aria-hidden
    >
      {user.initials}
    </span>
  );
}