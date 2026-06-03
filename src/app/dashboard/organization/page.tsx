"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Crown,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plug,
  Plus,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/lib/toast";
import { setLastActiveOrganizationIdClient } from "@/lib/organization/last-active-organization";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgRole = "owner" | "admin" | "member";

type OrgMember = {
  id: string;
  userId: string;
  role: OrgRole;
  user?: { name?: string | null; email?: string | null };
};

type OrgTeam = { id: string; name: string };

type TeamMember = { id: string; userId: string; role: string };

type OrgInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name?: string | null, email?: string | null) {
  const src = name?.trim() || email?.trim() || "?";
  return src
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function roleBadgeVariant(role: string) {
  if (role === "owner") return "default" as const;
  if (role === "admin") return "secondary" as const;
  return "outline" as const;
}

function roleIcon(role: string) {
  if (role === "owner") return <Crown className="size-3" />;
  if (role === "admin") return <Shield className="size-3" />;
  return null;
}

function expiresLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MemberRow({
  member,
  isCurrentUser,
  canManage,
  isOwner,
  onChangeRole,
  onRemove,
  onLeave,
}: {
  member: OrgMember;
  isCurrentUser: boolean;
  canManage: boolean;
  isOwner: boolean;
  onChangeRole: (userId: string, role: OrgRole) => void;
  onRemove: (member: OrgMember) => void;
  onLeave: () => void;
}) {
  const name = member.user?.name?.trim() || member.user?.email?.trim() || "Unknown";
  const email = member.user?.email?.trim() || "";
  const ini = initials(member.user?.name, member.user?.email);
  const isLastOwner = member.role === "owner" && isOwner;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs">{ini}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">{name}</span>
            {isCurrentUser && (
              <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                you
              </Badge>
            )}
          </div>
          {email && (
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {canManage && !isCurrentUser && !isLastOwner ? (
          <Select
            value={member.role}
            onValueChange={(v) => onChangeRole(member.userId, v as OrgRole)}
          >
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge variant={roleBadgeVariant(member.role)} className="gap-1 text-xs">
            {roleIcon(member.role)}
            {member.role}
          </Badge>
        )}

        {(canManage || isCurrentUser) && !isLastOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isCurrentUser ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onLeave}
                >
                  <LogOut className="mr-2 size-4" />
                  Leave organization
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onRemove(member)}
                >
                  <UserMinus className="mr-2 size-4" />
                  Remove from organization
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

function InvitationRow({
  inv,
  canManage,
  onCancel,
}: {
  inv: OrgInvitation;
  canManage: boolean;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm">{inv.email}</p>
        <p className="text-xs text-muted-foreground">
          <span className="capitalize">{inv.role}</span>
          {" · expires "}
          {expiresLabel(inv.expiresAt)}
        </p>
      </div>
      {canManage && (
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onCancel(inv.id)}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrganizationPage() {
  const { data: activeOrganization, refetch: refetchActiveOrg } =
    authClient.useActiveOrganization();
  const { data: activeMemberRole } = authClient.useActiveMemberRole();
  const { data: session } = authClient.useSession();

  const sessionUserId = session?.user?.id ?? "";
  const canManage =
    activeMemberRole?.role === "owner" || activeMemberRole?.role === "admin";
  const isOwner = activeMemberRole?.role === "owner";
  const activeOrgId = activeOrganization?.id ?? "";

  const authFetch = authClient.$fetch as <T>(
    path: string,
    opts: { method: "GET" | "POST"; body?: Record<string, unknown>; query?: Record<string, unknown> },
  ) => Promise<{ data: T; error: unknown }>;

  // ── Org members & teams from activeOrganization ────────────────────────────
  const members = useMemo<OrgMember[]>(
    () => (activeOrganization?.members ?? []) as OrgMember[],
    [activeOrganization?.members],
  );
  const teams = useMemo<OrgTeam[]>(
    () => ((activeOrganization as { teams?: OrgTeam[] } | null)?.teams ?? []),
    [activeOrganization],
  );

  // ── Invitations ────────────────────────────────────────────────────────────
  const [invitations, setInvitations] = useState<OrgInvitation[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  const loadInvitations = useCallback(async () => {
    if (!activeOrgId || !canManage) { setInvitations([]); return; }
    setInvLoading(true);
    try {
      const res = await authFetch<OrgInvitation[]>("/organization/list-invitations", {
        method: "GET",
        query: { organizationId: activeOrgId },
      });
      if (!res.error && Array.isArray(res.data)) {
        setInvitations(res.data.filter((i) => i.status === "pending"));
      }
    } catch { setInvitations([]); }
    finally { setInvLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrgId, canManage]);

  useEffect(() => { void loadInvitations(); }, [loadInvitations]);

  // ── Team members ───────────────────────────────────────────────────────────
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const loadTeamMembers = useCallback(async (teamId: string) => {
    if (!teamId) { setTeamMembers([]); return; }
    const res = await authFetch<TeamMember[]>("/organization/list-team-members", {
      method: "GET",
      query: { teamId },
    });
    if (!res.error && Array.isArray(res.data)) setTeamMembers(res.data);
    else setTeamMembers([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { void loadTeamMembers(selectedTeamId); }, [loadTeamMembers, selectedTeamId]);

  // ── Rename org dialog ──────────────────────────────────────────────────────
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameName, setRenameName] = useState("");
  const [renaming, setRenaming] = useState(false);

  const openRename = () => {
    setRenameName(activeOrganization?.name ?? "");
    setRenameOpen(true);
  };

  const handleRename = async () => {
    const name = renameName.trim();
    if (!name || !activeOrgId) return;
    setRenaming(true);
    try {
      const res = await authFetch("/organization/update", {
        method: "POST",
        body: { organizationId: activeOrgId, data: { name } },
      });
      if (res.error) { toast.error("Could not rename organization"); return; }
      toast.success("Organization renamed");
      setRenameOpen(false);
      await refetchActiveOrg();
    } catch { toast.error("Failed to rename organization"); }
    finally { setRenaming(false); }
  };

  // ── Invite dialog ──────────────────────────────────────────────────────────
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !activeOrgId) return;
    setInviting(true);
    try {
      const res = await authFetch<{ id: string }>("/organization/invite-member", {
        method: "POST",
        body: { email, role: inviteRole, organizationId: activeOrgId },
      });
      if (res.error) { toast.error("Could not send invitation"); return; }
      toast.success("Invitation sent");
      setInviteEmail("");
      setInviteRole("member");
      setInviteOpen(false);
      await loadInvitations();
    } catch { toast.error("Failed to send invitation"); }
    finally { setInviting(false); }
  };

  // ── Change member role ─────────────────────────────────────────────────────
  const handleChangeRole = async (userId: string, role: OrgRole) => {
    try {
      const res = await authFetch("/organization/update-member-role", {
        method: "POST",
        body: { organizationId: activeOrgId, userId, role },
      });
      if (res.error) { toast.error("Could not update role"); return; }
      toast.success("Role updated");
      await refetchActiveOrg();
    } catch { toast.error("Failed to update role"); }
  };

  // ── Remove member ──────────────────────────────────────────────────────────
  const [removeTarget, setRemoveTarget] = useState<OrgMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleRemoveMember = async () => {
    if (!removeTarget || !activeOrgId) return;
    setRemoving(true);
    try {
      const res = await authFetch("/organization/remove-member", {
        method: "POST",
        body: { organizationId: activeOrgId, memberIdOrEmail: removeTarget.userId },
      });
      if (res.error) { toast.error("Could not remove member"); return; }
      toast.success("Member removed");
      setRemoveTarget(null);
      await refetchActiveOrg();
    } catch { toast.error("Failed to remove member"); }
    finally { setRemoving(false); }
  };

  // ── Leave organization ─────────────────────────────────────────────────────
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleLeave = async () => {
    if (!activeOrgId) return;
    setLeaving(true);
    try {
      const res = await authFetch("/organization/leave", {
        method: "POST",
        body: { organizationId: activeOrgId },
      });
      if (res.error) { toast.error("Could not leave organization"); return; }
      toast.success("You left the organization");
      setLastActiveOrganizationIdClient("");
      window.location.assign("/dashboard/organization/select");
    } catch { toast.error("Failed to leave organization"); }
    finally { setLeaving(false); }
  };

  // ── Create team dialog ─────────────────────────────────────────────────────
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim() || !activeOrgId) return;
    setCreatingTeam(true);
    try {
      const res = await authFetch<{ id: string }>("/organization/create-team", {
        method: "POST",
        body: { name: teamName.trim(), organizationId: activeOrgId },
      });
      if (res.error) { toast.error("Could not create team"); return; }
      toast.success("Team created");
      setTeamName("");
      setTeamDialogOpen(false);
      if (res.data?.id) setSelectedTeamId(res.data.id);
      await refetchActiveOrg();
    } catch { toast.error("Failed to create team"); }
    finally { setCreatingTeam(false); }
  };

  // ── Delete team ────────────────────────────────────────────────────────────
  const [deleteTeamTarget, setDeleteTeamTarget] = useState<OrgTeam | null>(null);
  const [deletingTeam, setDeletingTeam] = useState(false);

  const handleDeleteTeam = async () => {
    if (!deleteTeamTarget) return;
    setDeletingTeam(true);
    try {
      const res = await authFetch("/organization/remove-team", {
        method: "POST",
        body: { teamId: deleteTeamTarget.id },
      });
      if (res.error) { toast.error("Could not delete team"); return; }
      toast.success("Team deleted");
      if (selectedTeamId === deleteTeamTarget.id) setSelectedTeamId("");
      setDeleteTeamTarget(null);
      await refetchActiveOrg();
    } catch { toast.error("Failed to delete team"); }
    finally { setDeletingTeam(false); }
  };

  // ── Add/remove team member ─────────────────────────────────────────────────
  const [addTeamMemberUserId, setAddTeamMemberUserId] = useState("");
  const [addingTeamMember, setAddingTeamMember] = useState(false);

  const teamMemberUserIds = useMemo(
    () => new Set(teamMembers.map((m) => m.userId)),
    [teamMembers],
  );
  const membersNotInTeam = useMemo(
    () => members.filter((m) => !teamMemberUserIds.has(m.userId)),
    [members, teamMemberUserIds],
  );
  const membersByUserId = useMemo(
    () => new Map(members.map((m) => [m.userId, m])),
    [members],
  );

  const handleAddTeamMember = async () => {
    if (!selectedTeamId || !addTeamMemberUserId) return;
    setAddingTeamMember(true);
    try {
      const res = await authFetch<{ id: string }>("/organization/add-team-member", {
        method: "POST",
        body: { teamId: selectedTeamId, userId: addTeamMemberUserId },
      });
      if (res.error) { toast.error("Could not add member to team"); return; }
      toast.success("Member added to team");
      setAddTeamMemberUserId("");
      await loadTeamMembers(selectedTeamId);
    } catch { toast.error("Failed to add member"); }
    finally { setAddingTeamMember(false); }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!selectedTeamId) return;
    try {
      const res = await authFetch("/organization/remove-team-member", {
        method: "POST",
        body: { teamId: selectedTeamId, userId },
      });
      if (res.error) { toast.error("Could not remove member from team"); return; }
      toast.success("Member removed from team");
      await loadTeamMembers(selectedTeamId);
    } catch { toast.error("Failed to remove member"); }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (!activeOrganization) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;
  const memberCount = members.length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-5 sm:p-6">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
              <Building2 className="size-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                {activeOrganization.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {activeOrganization.slug} · {memberCount}{" "}
                {memberCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={openRename}>
                <Pencil className="size-3.5" />
                Rename
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href="/dashboard/organization/integrations">
                <Plug className="size-3.5" />
                Integrations
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Members ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4" />
                Members
              </CardTitle>
              <CardDescription className="mt-0.5">
                {memberCount} {memberCount === 1 ? "person" : "people"} in this organization
              </CardDescription>
            </div>
            {canManage && (
              <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-3.5" />
                Invite
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y">
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  isCurrentUser={member.userId === sessionUserId}
                  canManage={canManage}
                  isOwner={isOwner}
                  onChangeRole={(userId, role) => void handleChangeRole(userId, role)}
                  onRemove={setRemoveTarget}
                  onLeave={() => setLeaveOpen(true)}
                />
              ))}
            </div>

            {/* Pending invitations */}
            {canManage && (invLoading || invitations.length > 0) && (
              <>
                <Separator className="my-4" />
                <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Pending invitations
                </p>
                {invLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invitations.map((inv) => (
                      <InvitationRow
                        key={inv.id}
                        inv={inv}
                        canManage={canManage}
                        onCancel={async (id) => {
                          try {
                            const res = await authFetch("/organization/cancel-invitation", {
                              method: "POST",
                              body: { invitationId: id },
                            });
                            if (res.error) { toast.error("Could not cancel invitation"); return; }
                            toast.success("Invitation cancelled");
                            await loadInvitations();
                          } catch { toast.error("Failed to cancel invitation"); }
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Teams ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Teams</CardTitle>
              <CardDescription className="mt-0.5">
                {teams.length === 0
                  ? "No teams yet"
                  : `${teams.length} ${teams.length === 1 ? "team" : "teams"}`}
              </CardDescription>
            </div>
            {canManage && (
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setTeamDialogOpen(true)}>
                <Plus className="size-3.5" />
                New team
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-0">
            {teams.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {canManage
                  ? "Create a team to group members for project collaboration."
                  : "No teams have been created in this organization."}
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setSelectedTeamId(isSelected ? "" : team.id)}
                      className={`group rounded-lg border p-3 text-left transition-colors hover:bg-muted/40 ${
                        isSelected ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">{team.name}</p>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTeamTarget(team);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {isSelected ? "Click to collapse" : "Click to view members"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Team member panel */}
            {selectedTeam && (
              <div className="mt-4 rounded-lg border bg-muted/20 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{selectedTeam.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
                  </Badge>
                </div>

                {canManage && membersNotInTeam.length > 0 && (
                  <div className="mb-3 flex gap-2">
                    <Select
                      value={addTeamMemberUserId}
                      onValueChange={setAddTeamMemberUserId}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Add a member…" />
                      </SelectTrigger>
                      <SelectContent>
                        {membersNotInTeam.map((m) => {
                          const label = m.user?.name?.trim() || m.user?.email?.trim() || m.userId;
                          return (
                            <SelectItem key={m.userId} value={m.userId} className="text-xs">
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      disabled={!addTeamMemberUserId || addingTeamMember}
                      onClick={() => void handleAddTeamMember()}
                    >
                      <Plus className="size-3.5" />
                      Add
                    </Button>
                  </div>
                )}

                {teamMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No members in this team yet.</p>
                ) : (
                  <div className="space-y-1">
                    {teamMembers.map((tm) => {
                      const orgMember = membersByUserId.get(tm.userId);
                      const name =
                        orgMember?.user?.name?.trim() ||
                        orgMember?.user?.email?.trim() ||
                        tm.userId;
                      const email = orgMember?.user?.email?.trim() || "";
                      const ini = initials(orgMember?.user?.name, orgMember?.user?.email);
                      return (
                        <div key={tm.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted/40">
                          <div className="flex items-center gap-2 min-w-0">
                            <Avatar className="size-6 shrink-0">
                              <AvatarFallback className="text-[10px]">{ini}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">{name}</p>
                              {email && <p className="truncate text-[10px] text-muted-foreground">{email}</p>}
                            </div>
                          </div>
                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0 text-muted-foreground hover:text-destructive"
                              onClick={() => void handleRemoveTeamMember(tm.userId)}
                            >
                              <X className="size-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Dialogs & Alerts ──────────────────────────────────────────────── */}

      {/* Rename org */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename organization</DialogTitle>
            <DialogDescription>Update the display name for this workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-org-name">Organization name</Label>
            <Input
              id="rename-org-name"
              value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleRename()}
              disabled={renaming}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={renaming}>
              Cancel
            </Button>
            <Button onClick={() => void handleRename()} disabled={renaming || !renameName.trim()}>
              {renaming ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite member */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Send an email invitation to join this organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="off"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as "member" | "admin")}
              >
                <SelectTrigger id="invite-role" disabled={inviting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={inviting}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleInvite()}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove org member confirm */}
      <AlertDialog open={removeTarget !== null} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `${removeTarget.user?.name?.trim() || removeTarget.user?.email?.trim() || "This member"} will be removed from the organization and lose access to all projects.`
                : "This member will be removed from the organization."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removing}
              onClick={(e) => { e.preventDefault(); void handleRemoveMember(); }}
            >
              {removing ? "Removing…" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave org confirm */}
      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave organization?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose access to all projects in this organization. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={leaving}
              onClick={(e) => { e.preventDefault(); void handleLeave(); }}
            >
              {leaving ? "Leaving…" : "Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create team */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
            <DialogDescription>
              Teams let you group members for easier project collaboration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleCreateTeam()}
              placeholder="e.g. Engineering, Design"
              disabled={creatingTeam}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamDialogOpen(false)} disabled={creatingTeam}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleCreateTeam()}
              disabled={creatingTeam || !teamName.trim()}
            >
              {creatingTeam ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete team confirm */}
      <AlertDialog open={deleteTeamTarget !== null} onOpenChange={(o) => !o && setDeleteTeamTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete team?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTeamTarget
                ? `"${deleteTeamTarget.name}" will be permanently deleted. Members will not be removed from the organization.`
                : "This team will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingTeam}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingTeam}
              onClick={(e) => { e.preventDefault(); void handleDeleteTeam(); }}
            >
              {deletingTeam ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
