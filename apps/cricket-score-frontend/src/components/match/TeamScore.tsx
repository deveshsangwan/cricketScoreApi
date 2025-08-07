import React from 'react';
import { getTeamFlag } from '@/utils/teamFlags';
import { Team } from '@cricket-score/shared-types';
import Image from 'next/image';

interface TeamScoreProps {
  team: Team;
  isBatting?: boolean;
}

export const TeamScore = React.memo<TeamScoreProps>(
  ({ team, isBatting }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-card transition-all hover:bg-card/40">
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <Image
            src={getTeamFlag(team.name)}
            alt={`${team.name} Flag`}
            className="w-12 h-12 object-cover rounded-full border border-border shadow-md"
            width={48}
            height={48}
          />
          {isBatting && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse shadow-md"></div>
          )}
        </div>
        <div>
          <p className="text-xl font-bold text-foreground">
            {team.name}
            {team.isBatting && (
              <span className="ml-2 text-xs font-medium text-red-400 border border-red-500/30 uppercase tracking-wider bg-red-500/10 backdrop-blur-sm py-1 px-2 rounded-full">
                Batting
              </span>
            )}
          </p>
          {team.overs !== undefined && (
            <p className="text-sm font-medium text-muted-foreground">
              <span className="inline-block mr-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              {team.overs} Overs
            </p>
          )}
        </div>
      </div>
      <div className="text-right relative">
        <p className="text-3xl font-extrabold heading-gradient">
          {team.score !== undefined ? team.score : '0'}
          {team.wickets !== undefined && `/${team.wickets}`}
        </p>
        {team.previousInnings && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="font-medium">
              1st Innings: {team.previousInnings.score}
              {team.previousInnings.wickets !== undefined && `/${team.previousInnings.wickets}`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
);

TeamScore.displayName = 'TeamScore'; 