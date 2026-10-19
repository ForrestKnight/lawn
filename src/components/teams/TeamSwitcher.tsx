import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Plus, Settings, Users } from "lucide-react";
import { api } from "@convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTeamDialog } from "@/components/teams/CreateTeamDialog";
import { teamHomePath, teamSettingsPath } from "@/lib/routes";
import { pickCurrentTeam, readLastTeamSlug, writeLastTeamSlug } from "@/lib/currentTeam";

/** Chevron next to the team crumb: switch teams, open team settings/members, or
 * create a team. Hidden off team routes, where there is no team crumb. */
export function TeamSwitcher() {
  const teams = useQuery(api.teams.list);
  const params = useParams({ strict: false });
  const routeSlug = typeof params.teamSlug === "string" ? params.teamSlug : undefined;
  const navigate = useNavigate({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [lastSlug] = useState(readLastTeamSlug);

  const currentTeam = teams ? pickCurrentTeam(teams, routeSlug, lastSlug) : undefined;
  const routeTeamSlug = currentTeam?.slug === routeSlug ? routeSlug : undefined;

  useEffect(() => {
    if (routeTeamSlug) writeLastTeamSlug(routeTeamSlug);
  }, [routeTeamSlug]);

  if (!routeSlug) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="mr-1 -ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center text-[#888] transition-colors outline-none hover:bg-(--surface-alt) hover:text-(--foreground) focus-visible:bg-(--surface-alt) data-[state=open]:bg-(--surface-alt) data-[state=open]:text-(--foreground)"
          aria-label={currentTeam ? `Switch team (current: ${currentTeam.name})` : "Switch team"}
          title="Switch team"
        >
          <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {teams?.map((team) => (
            <DropdownMenuItem
              key={team._id}
              className="gap-2"
              onSelect={() => {
                writeLastTeamSlug(team.slug);
                navigate({ to: teamHomePath(team.slug) });
              }}
            >
              <span className="min-w-0 flex-1 truncate">{team.name}</span>
              {team._id === currentTeam?._id && (
                <Check className="h-4 w-4 shrink-0 text-[#2d5a2d]" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          ))}
          {teams && teams.length > 0 && <DropdownMenuSeparator />}
          {currentTeam && (
            <>
              <DropdownMenuItem
                className="gap-2"
                onSelect={() => navigate({ to: teamSettingsPath(currentTeam.slug) })}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2"
                onSelect={() =>
                  navigate({ to: teamSettingsPath(currentTeam.slug), hash: "members" })
                }
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                Members
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem className="gap-2" onSelect={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create team
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTeamDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </>
  );
}
