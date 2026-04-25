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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar } from "./UserSwitcher";
import { getUserById } from "@/lib/docs/mockData";
import type { DocumentItem, SharePermission, User } from "@/types/docs";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentItem | null;
  isOwner: boolean;
  users: User[];
  currentUserId: string;
  onAddUser: (userId: string, perm: SharePermission) => void;
  onChangeUserPermission: (userId: string, perm: SharePermission) => void;
  onRemoveUser: (userId: string) => void;
}

export function ShareModal({
  open,
  onOpenChange,
  document,
  isOwner,
  users,
  currentUserId,
  onAddUser,
  onChangeUserPermission,
  onRemoveUser,
}: ShareModalProps) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedPerm, setSelectedPerm] = useState<SharePermission>("edit");
  const [error, setError] = useState<string | null>(null);

  if (!document) return null;

  const owner = getUserById(document.ownerId);
  const ownerAvatar = owner ?? { initials: "?", color: "bg-muted" };

  const inviteCandidates = users.filter(
    (u) => u.id !== document.ownerId && !document.sharedWith.includes(u.id),
  );

  const handleAdd = () => {
    if (!selectedId) {
      setError("Pick a user to share with.");
      return;
    }
    if (document.sharedWith.includes(selectedId)) {
      setError("That user already has access.");
      return;
    }
    setError(null);
    onAddUser(selectedId, selectedPerm);
    setSelectedId("");
    setSelectedPerm("edit");
  };

  const labelForPerm = (p: SharePermission) => (p === "view" ? "View only" : "Can edit");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            Share “{document.title || "Untitled"}”
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {inviteCandidates.length > 0 && isOwner ? (
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedId || undefined}
                onValueChange={(v) => {
                  setSelectedId(v);
                  if (error) setError(null);
                }}
              >
                <SelectTrigger className="min-w-0 flex-1">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {inviteCandidates.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedPerm}
                onValueChange={(v) => setSelectedPerm(v as SharePermission)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edit">Can edit</SelectItem>
                  <SelectItem value="view">View only</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAdd} className="gap-1" type="button">
                <UserPlus className="h-4 w-4" />
                Add
              </Button>
            </div>
          ) : isOwner && inviteCandidates.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              All available demo users already have access.
            </p>
          ) : null}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {!isOwner && (
            <p className="text-xs text-muted-foreground">
              Only the document owner can change sharing.
            </p>
          )}
        </div>

        <div className="mt-2 rounded-lg border border-border">
          <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            People
          </div>
          <ul className="divide-y divide-border">
            <li className="flex items-center gap-3 px-3 py-2.5">
              <Avatar user={ownerAvatar} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate text-sm font-medium">
                  {owner?.name ?? document.ownerId}
                  {document.ownerId === currentUserId && (
                    <span className="text-xs font-normal text-muted-foreground">(you)</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {owner?.email} · Owner
                </div>
              </div>
              <Crown className="h-4 w-4 text-amber-500" />
            </li>
            {document.sharedWith.map((userId) => {
              const u = getUserById(userId);
              const av = u ?? { initials: "?", color: "bg-muted" };
              const perm: SharePermission = document.sharedAccess?.[userId] ?? "edit";
              return (
                <li
                  key={userId}
                  className="flex items-center gap-3 px-3 py-2.5"
                >
                  <Avatar user={av} />
                  <div className="min-w-0 flex-1 truncate text-sm">
                    {u?.name ?? userId}
                    {userId === currentUserId && (
                      <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                    )}
                  </div>
                  {isOwner ? (
                    <Select
                      value={perm}
                      onValueChange={(v) =>
                        onChangeUserPermission(userId, v as SharePermission)
                      }
                    >
                      <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="edit">Can edit</SelectItem>
                        <SelectItem value="view">View only</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-muted-foreground">{labelForPerm(perm)}</div>
                  )}
                  {isOwner && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onRemoveUser(userId)}
                      aria-label={`Remove ${u?.name ?? userId}`}
                      className="h-8 w-8 text-muted-foreground"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              );
            })}
            {document.sharedWith.length === 0 && (
              <li className="px-3 py-4 text-center text-xs text-muted-foreground">
                No collaborators yet. Add the other demo user from the list above.
              </li>
            )}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} type="button">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
