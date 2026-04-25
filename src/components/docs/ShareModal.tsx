import { useState } from "react";
import { Crown, Trash2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "./UserSwitcher";
import { avatarFromEmail } from "@/lib/docs/utils";
import type { DocumentItem, Permission } from "@/types/docs";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentItem | null;
  isOwner: boolean;
  onAddAccess: (email: string, permission: Permission) => void;
  onUpdateAccess: (email: string, permission: Permission) => void;
  onRemoveAccess: (email: string) => void;
}

export function ShareModal({
  open,
  onOpenChange,
  document,
  isOwner,
  onAddAccess,
  onUpdateAccess,
  onRemoveAccess,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<Permission>("edit");
  const [error, setError] = useState<string | null>(null);

  if (!document) return null;

  const handleAdd = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (trimmed === document.ownerEmail) {
      setError("This person is already the owner.");
      return;
    }
    if (document.access.some((a) => a.email === trimmed)) {
      setError("This person already has access.");
      return;
    }
    setError(null);
    onAddAccess(trimmed, permission);
    setEmail("");
  };

  const ownerAvatar = avatarFromEmail(document.ownerEmail);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Share “{document.title || "Untitled"}”
          </DialogTitle>
          <DialogDescription>
            Invite teammates by email. Choose what they can do.
          </DialogDescription>
        </DialogHeader>

        {/* Add row */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="name@ajaia.demo"
              disabled={!isOwner}
              className="flex-1"
            />
            <Select
              value={permission}
              onValueChange={(v) => setPermission(v as Permission)}
              disabled={!isOwner}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edit">Can edit</SelectItem>
                <SelectItem value="view">Can view</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAdd} disabled={!isOwner} className="gap-1">
              <UserPlus className="h-4 w-4" />
              Invite
            </Button>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {!isOwner && (
            <p className="text-xs text-muted-foreground">
              Only the document owner can change sharing settings.
            </p>
          )}
        </div>

        {/* Access list */}
        <div className="mt-2 rounded-lg border border-border">
          <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            People with access
          </div>
          <ul className="divide-y divide-border">
            <li className="flex items-center gap-3 px-3 py-2.5">
              <Avatar user={ownerAvatar} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                  {document.ownerEmail}
                  <span className="text-xs text-muted-foreground">(you?)</span>
                </div>
                <div className="text-xs text-muted-foreground">Owner</div>
              </div>
              <Crown className="h-4 w-4 text-amber-500" />
            </li>
            {document.access.map((a) => {
              const av = avatarFromEmail(a.email);
              return (
                <li key={a.email} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar user={av} />
                  <div className="min-w-0 flex-1 truncate text-sm">
                    {a.email}
                  </div>
                  <Select
                    value={a.permission}
                    onValueChange={(v) =>
                      onUpdateAccess(a.email, v as Permission)
                    }
                    disabled={!isOwner}
                  >
                    <SelectTrigger className="h-8 w-[110px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="view">Can view</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemoveAccess(a.email)}
                    disabled={!isOwner}
                    aria-label={`Remove ${a.email}`}
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
            {document.access.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No one else has access yet.
              </li>
            )}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}