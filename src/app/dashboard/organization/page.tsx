"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/layouts/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "@/lib/toast";
import { setLastActiveOrganizationIdClient } from "@/lib/organization/last-active-organization";

type Team = {
  id: string;
  name: string;
};

type TeamMember = {
  id: string;
  userId: string;
  role: string;
};

type OrganizationMember = {
  id: string;
  userId: string;
  role: string;
  user?: {
    name?: string | null;
    email?: string | null;
  };
};

type OrgInvitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  organizationId: string;
};

export default function OrganizationPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [memberToAddUserId, setMemberToAddUserId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [pendingInvitations, setPendingInvitations] = useState<OrgInvitation[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const authFetch = authClient.$fetch as <T>(
    path: string,
    options: {
      method: "GET" | "POST";
      body?: Record<string, unknown>;
      query?: Record<string, unknown>;
    },
  ) => Promise<{ data: T; error: unknown }>;

  const { data: organizations, refetch: refetchOrganizations } =
    authClient.useListOrganizations();
  const { data: activeOrganization, refetch: refetchActiveOrganization } =
    authClient.useActiveOrganization();
  const { data: activeMemberRole } = authClient.useActiveMemberRole();
  const { data: session } = authClient.useSession();

  const activeOrganizationId = activeOrganization?.id;
  const canManageTeams =
    activeMemberRole?.role === "owner" || activeMemberRole?.role === "admin";
  const canInviteMembers =
    activeMemberRole?.role === "owner" || activeMemberRole?.role === "admin";
  const teams = useMemo<Team[]>(
    () => ((activeOrganization as { teams?: Team[] } | null)?.teams ?? []).map((team) => ({
      id: team.id,
      name: team.name,
    })),
    [activeOrganization],
  );
  const organizationMembers = useMemo<OrganizationMember[]>(
    () => (activeOrganization?.members ?? []) as OrganizationMember[],
    [activeOrganization?.members],
  );
  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );
  const currentUserId = session?.user?.id ?? "";
  const isCurrentUserInSelectedTeam = useMemo(
    () =>
      Boolean(
        selectedTeamId &&
          currentUserId &&
          teamMembers.some((m) => m.userId === currentUserId),
      ),
    [selectedTeamId, currentUserId, teamMembers],
  );
  const showCompactTeamMembersPanel = Boolean(
    currentUserId &&
      selectedTeamId &&
      selectedTeam &&
      !canManageTeams &&
      !isCurrentUserInSelectedTeam,
  );
  const teamMemberUserIds = useMemo(
    () => new Set(teamMembers.map((member) => member.userId)),
    [teamMembers],
  );
  const availableMembersToAdd = useMemo(
    () => organizationMembers.filter((member) => !teamMemberUserIds.has(member.userId)),
    [organizationMembers, teamMemberUserIds],
  );
  const membersByUserId = useMemo(
    () =>
      new Map(
        organizationMembers.map((member) => [
          member.userId,
          {
            name: member.user?.name || "Unnamed user",
            email: member.user?.email || member.userId,
            orgRole: member.role,
          },
        ]),
      ),
    [organizationMembers],
  );
  const generatedOrganizationSlug = useMemo(
    () =>
      organizationName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    [organizationName],
  );

  const refreshOrganizationData = async () => {
    await Promise.all([refetchOrganizations(), refetchActiveOrganization()]);
  };

  const loadInvitations = useCallback(async () => {
    if (!activeOrganizationId || !canInviteMembers) {
      setPendingInvitations([]);
      return;
    }
    setInvitationsLoading(true);
    try {
      const result = await authFetch<OrgInvitation[]>("/organization/list-invitations", {
        method: "GET",
        query: { organizationId: activeOrganizationId },
      });
      if (!result.error && Array.isArray(result.data)) {
        setPendingInvitations(result.data.filter((inv) => inv.status === "pending"));
      } else {
        setPendingInvitations([]);
      }
    } catch {
      setPendingInvitations([]);
    } finally {
      setInvitationsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- authFetch from auth client
  }, [activeOrganizationId, canInviteMembers]);

  useEffect(() => {
    void loadInvitations();
  }, [loadInvitations]);

  const loadTeamMembers = useCallback(async (teamId: string) => {
    if (!teamId) {
      setTeamMembers([]);
      return;
    }
    const result = await authFetch<TeamMember[]>(
      "/organization/list-team-members",
      {
        method: "GET",
        query: { teamId },
      },
    );
    if (!result.error && Array.isArray(result.data)) {
      setTeamMembers(
        result.data.map((member) => ({
          id: member.id,
          userId: member.userId,
          role: member.role,
        })),
      );
    }
  }, [authFetch]);

  useEffect(() => {
    void loadTeamMembers(selectedTeamId);
  }, [loadTeamMembers, selectedTeamId]);

  const handleCreateOrganization = async () => {
    if (!organizationName.trim() || !generatedOrganizationSlug) {
      toast.error("Enter a valid organization name");
      return;
    }

    setIsSubmitting(true);
    try {
      const loadingToast = toast.loading("Creating organization...");
      const result = await authFetch<{ id: string }>("/organization/create", {
        method: "POST",
        body: {
        name: organizationName.trim(),
        slug: generatedOrganizationSlug,
        },
      });

      if (result.error) {
        toast.error("Could not create organization", { id: loadingToast });
        return;
      }

      toast.success("Organization created", { id: loadingToast });
      setOrganizationName("");
      await refreshOrganizationData();
    } catch (error) {
      console.error("Failed to create organization", error);
      toast.error("Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchOrganization = async (organizationId: string) => {
    try {
      const loadingToast = toast.loading("Switching organization...");
      const result = await authFetch<{ success: boolean }>("/organization/set-active", {
        method: "POST",
        body: { organizationId },
      });
      if (result.error) {
        toast.error("Could not switch organization", { id: loadingToast });
        return;
      }

      setLastActiveOrganizationIdClient(organizationId);
      toast.success("Organization switched", { id: loadingToast });
      setSelectedTeamId("");
      setMemberToAddUserId("");
      await refreshOrganizationData();
    } catch (error) {
      console.error("Failed to switch organization", error);
      toast.error("Failed to switch organization");
    }
  };

  const handleCreateTeam = async () => {
    if (!canManageTeams) {
      toast.error("Only organization owner/admin can manage teams");
      return;
    }
    if (!activeOrganizationId) {
      toast.error("Select an active organization first");
      return;
    }
    if (!teamName.trim()) {
      toast.error("Enter a team name");
      return;
    }

    setIsSubmitting(true);
    try {
      const loadingToast = toast.loading("Creating team...");
      const result = await authFetch<{ id: string }>("/organization/create-team", {
        method: "POST",
        body: {
          name: teamName.trim(),
          organizationId: activeOrganizationId,
        },
      });

      if (result.error) {
        toast.error("Could not create team", { id: loadingToast });
        return;
      }

      toast.success("Team created", { id: loadingToast });
      setTeamName("");
      await refetchActiveOrganization();
      if (result.data?.id) {
        setSelectedTeamId(result.data.id);
      }
    } catch (error) {
      console.error("Failed to create team", error);
      toast.error("Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!canManageTeams) {
      toast.error("Only organization owner/admin can manage teams");
      return;
    }
    try {
      const loadingToast = toast.loading("Removing team...");
      const result = await authFetch<{ message: string }>("/organization/remove-team", {
        method: "POST",
        body: { teamId },
      });

      if (result.error) {
        toast.error("Could not remove team", { id: loadingToast });
        return;
      }

      toast.success("Team removed", { id: loadingToast });
      if (selectedTeamId === teamId) {
        setSelectedTeamId("");
        setMemberToAddUserId("");
      }
      await refetchActiveOrganization();
    } catch (error) {
      console.error("Failed to remove team", error);
      toast.error("Failed to remove team");
    }
  };

  const handleAddTeamMember = async () => {
    if (!canManageTeams) {
      toast.error("Only organization owner/admin can manage teams");
      return;
    }
    if (!selectedTeamId || !memberToAddUserId.trim()) {
      toast.error("Select a team member to add");
      return;
    }

    try {
      const loadingToast = toast.loading("Adding member to team...");
      const result = await authFetch<{ id: string }>("/organization/add-team-member", {
        method: "POST",
        body: {
          teamId: selectedTeamId,
          userId: memberToAddUserId.trim(),
        },
      });

      if (result.error) {
        toast.error("Could not add member to team", { id: loadingToast });
        return;
      }

      toast.success("Member added to team", { id: loadingToast });
      setMemberToAddUserId("");
      await loadTeamMembers(selectedTeamId);
    } catch (error) {
      console.error("Failed to add team member", error);
      toast.error("Failed to add team member");
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!canManageTeams) {
      toast.error("Only organization owner/admin can manage teams");
      return;
    }
    if (!selectedTeamId) return;
    try {
      const loadingToast = toast.loading("Removing member...");
      const result = await authFetch<{ id: string }>("/organization/remove-team-member", {
        method: "POST",
        body: {
          teamId: selectedTeamId,
          userId,
        },
      });

      if (result.error) {
        toast.error("Could not remove member", { id: loadingToast });
        return;
      }

      toast.success("Member removed from team", { id: loadingToast });
      await loadTeamMembers(selectedTeamId);
    } catch (error) {
      console.error("Failed to remove team member", error);
      toast.error("Failed to remove team member");
    }
  };

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId((currentTeamId) => (currentTeamId === teamId ? "" : teamId));
    setMemberToAddUserId("");
  };

  const handleSendInvitation = async () => {
    if (!canInviteMembers) {
      toast.error("Only organization owner or admin can invite members");
      return;
    }
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !activeOrganizationId) {
      toast.error("Enter an email address");
      return;
    }
    setIsInviting(true);
    try {
      const loadingToast = toast.loading("Sending invitation...");
      const result = await authFetch<{ id: string }>("/organization/invite-member", {
        method: "POST",
        body: {
          email,
          role: inviteRole,
          organizationId: activeOrganizationId,
        },
      });
      if (result.error) {
        toast.error("Could not send invitation", { id: loadingToast });
        return;
      }
      toast.success("Invitation sent", { id: loadingToast });
      setInviteEmail("");
      await loadInvitations();
    } catch (error) {
      console.error("Failed to send invitation", error);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!canInviteMembers) return;
    try {
      const loadingToast = toast.loading("Canceling invitation...");
      const result = await authFetch("/organization/cancel-invitation", {
        method: "POST",
        body: { invitationId },
      });
      if (result.error) {
        toast.error("Could not cancel invitation", { id: loadingToast });
        return;
      }
      toast.success("Invitation canceled", { id: loadingToast });
      await loadInvitations();
    } catch (error) {
      console.error("Failed to cancel invitation", error);
      toast.error("Failed to cancel invitation");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
          <p className="text-muted-foreground mt-2">
            Manage organizations, invite members, switch workspace, and manage teams.
          </p>
        </div>

        {organizations && organizations.length === 1 && activeOrganization && (
          <p className="text-muted-foreground text-sm">
            Active workspace: <span className="text-foreground font-medium">{activeOrganization.name}</span>
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Create organization</CardTitle>
            <CardDescription>Set up a new organization workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization name</Label>
              <Input
                id="org-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Inc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Organization slug</Label>
              <Input
                id="org-slug"
                value={generatedOrganizationSlug}
                placeholder="acme-inc"
                readOnly
                disabled
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleCreateOrganization} disabled={isSubmitting} className="w-full">
                Create organization
              </Button>
            </div>
          </CardContent>
        </Card>

        {organizations && organizations.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Switch organization</CardTitle>
              <CardDescription>Choose the active organization for this session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {organizations.map((organization) => (
                <div
                  key={organization.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-muted-foreground text-xs">{organization.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {organization.id === activeOrganizationId && <Badge>Active</Badge>}
                    <Button
                      variant="outline"
                      onClick={() => handleSwitchOrganization(organization.id)}
                      disabled={organization.id === activeOrganizationId}
                    >
                      Set active
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeOrganizationId && canInviteMembers && (
          <Card>
            <CardHeader>
              <CardTitle>Invite members</CardTitle>
              <CardDescription>
                Invite people to this organization by email. They join the org first; you can add
                them to teams afterward.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    autoComplete="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                  />
                </div>
                <div className="grid flex-1 gap-2 md:max-w-[200px]">
                  <Label htmlFor="invite-role">Organization role</Label>
                  <select
                    id="invite-role"
                    className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "member" | "admin")}
                    disabled={isInviting}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button
                  type="button"
                  className="md:mb-0.5"
                  disabled={isInviting || !inviteEmail.trim()}
                  onClick={() => void handleSendInvitation()}
                >
                  Send invite
                </Button>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Pending invitations</h4>
                {invitationsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading…</p>
                ) : pendingInvitations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No pending invitations.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingInvitations.map((inv) => (
                      <div
                        key={inv.id}
                        className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium">{inv.email}</p>
                          <p className="text-muted-foreground text-xs">
                            Role: {inv.role} · Expires{" "}
                            {new Date(inv.expiresAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleCancelInvitation(inv.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Team management</CardTitle>
            <CardDescription>
              Create teams, view members in a team, and assign/remove organization members.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="New team name"
                disabled={!canManageTeams}
              />
              <Button
                onClick={handleCreateTeam}
                disabled={!activeOrganizationId || isSubmitting || !canManageTeams}
              >
                Create team
              </Button>
            </div>
            {!canManageTeams && (
              <p className="text-muted-foreground text-sm">
                You can view teams, but only organization owner/admin can manage teams and members.
              </p>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Teams</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Select a team to view and manage its members.
                </p>
                <div className="mt-4 space-y-2">
                  {teams.length ? (
                    teams.map((team) => (
                      <div
                        key={team.id}
                        className="hover:bg-muted/40 flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors"
                        onClick={() => handleSelectTeam(team.id)}
                      >
                        <div className="text-left">
                          <p className="font-medium">{team.name}</p>
                          <p className="text-muted-foreground text-xs">{team.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant={selectedTeamId === team.id ? "secondary" : "outline"}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleSelectTeam(team.id);
                            }}
                          >
                            {selectedTeamId === team.id ? "Unselect" : "Select"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handleRemoveTeam(team.id);
                            }}
                            disabled={!canManageTeams}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No teams in this organization.
                    </p>
                  )}
                </div>
              </div>

              <div
                className={
                  showCompactTeamMembersPanel
                    ? "rounded-lg border p-3"
                    : "rounded-lg border p-4"
                }
              >
                {showCompactTeamMembersPanel && selectedTeam ? (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium leading-tight">
                          {selectedTeam.name}
                        </h3>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          You&apos;re not on this team
                        </p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {teamMembers.length}{" "}
                        {teamMembers.length === 1 ? "member" : "members"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                      Member list and changes are hidden. Ask an organization owner or admin to
                      add you to this team if you need access.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-medium">
                      {selectedTeam ? `${selectedTeam.name} members` : "Team members"}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Add organization members to this team or remove existing members.
                    </p>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row">
                      <select
                        className="border-input bg-background h-10 w-full rounded-md border px-3 py-2 text-sm"
                        value={memberToAddUserId}
                        onChange={(e) => setMemberToAddUserId(e.target.value)}
                        disabled={!selectedTeamId || !canManageTeams}
                      >
                        <option value="">Select organization member</option>
                        {availableMembersToAdd.map((member) => {
                          const user = membersByUserId.get(member.userId);
                          return (
                            <option key={member.userId} value={member.userId}>
                              {user?.name || member.userId} ({user?.email || member.userId})
                            </option>
                          );
                        })}
                      </select>
                      <Button
                        onClick={handleAddTeamMember}
                        disabled={!selectedTeamId || !memberToAddUserId || !canManageTeams}
                      >
                        Add member
                      </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                      {selectedTeamId ? (
                        teamMembers.length ? (
                          teamMembers.map((member) => {
                            const user = membersByUserId.get(member.userId);
                            return (
                              <div
                                key={member.id}
                                className="flex items-center justify-between rounded-md border p-3"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    {user?.name || member.userId}
                                  </p>
                                  <p className="text-muted-foreground text-xs">
                                    {user?.email || member.userId}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <Badge variant="secondary">Team role: {member.role}</Badge>
                                    {user?.orgRole && (
                                      <Badge variant="outline">Org role: {user.orgRole}</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => handleRemoveTeamMember(member.userId)}
                                  disabled={!canManageTeams}
                                >
                                  Remove
                                </Button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            No members in the selected team.
                          </p>
                        )
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Select a team to view members.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
