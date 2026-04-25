import { Check, Loader2, Share2, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserSwitcher } from "./UserSwitcher";
import type { User } from "@/types/docs";

export type SaveStatus = "saved" | "saving" | "idle";

interface TopBarProps {
  title: string;
  onTitleChange: (t: string) => void;
  saveStatus: SaveStatus;
  onShareClick: () => void;
  onImportClick: () => void;
  users: User[];
  currentUserEmail: string;
  onUserChange: (email: string) => void;
  isReadOnly: boolean;
  ownerLabel: string | null;
  disabled?: boolean;
}

export function TopBar({
  title,
  onTitleChange,
  saveStatus,
  onShareClick,
  onImportClick,
  users,
  currentUserEmail,
  onUserChange,
  isReadOnly,
  ownerLabel,
  disabled,
}: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Input
          value={title}
          disabled={disabled}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled document"
          aria-label="Document title"
          className="h-9 max-w-md border-transparent bg-transparent px-2 text-base font-semibold shadow-none focus-visible:border-input focus-visible:bg-background"
        />
        <SaveIndicator status={saveStatus} disabled={disabled} />
        {isReadOnly && (
          <Badge variant="secondary" className="ml-1 gap-1">
            <Eye className="h-3 w-3" />
            View only
          </Badge>
        )}
        {ownerLabel && (
          <span className="ml-1 hidden text-xs text-muted-foreground md:inline">
            · Owned by {ownerLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onImportClick}
          disabled={disabled}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onShareClick}
          disabled={disabled}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <UserSwitcher
          users={users}
          currentUserEmail={currentUserEmail}
          onUserChange={onUserChange}
        />
      </div>
    </header>
  );
}

function SaveIndicator({
  status,
  disabled,
}: {
  status: SaveStatus;
  disabled?: boolean;
}) {
  if (disabled) return null;
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Check className="h-3 w-3 text-success" />
      Saved
    </span>
  );
}