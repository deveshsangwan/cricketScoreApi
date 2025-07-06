import React from 'react';
import { getTeamFlag } from '@/utils/teamFlags';
import { Team } from '@/types/api';

interface TeamScoreProps {
  team: Team;
  isBatting?: boolean;
}

export const TeamScore = React.memo<TeamScoreProps>(
  ({ team, isBatting }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card/50 backdrop-blur-lg border-2 border-border/60 transition-all hover:bg-card/60 shadow-2xl hover:shadow-3xl relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-card/40 before:to-card/20 before:rounded-lg before:-z-10">
      <div className="flex items-center gap-4 relative">
        <div className="relative">
          <img
            src={getTeamFlag(team.name)}
            alt={`${team.name} Flag`}
            className="w-12 h-12 object-cover rounded-full border-2 border-border shadow-xl"
          />
          {isBatting && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse shadow-xl"></div>
          )}
        </div>
        <div>
          <p className="text-xl font-bold text-foreground drop-shadow-md">
            {team.name}
            {team.isBatting && (
              <span className="ml-2 text-xs font-medium text-red-400 border-2 border-red-500/30 uppercase tracking-wider bg-red-100/80 dark:bg-red-500/30 backdrop-blur-sm py-1 px-2 rounded-full dark:border-red-500/50">
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
        <p className="text-3xl font-extrabold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent drop-shadow-md">
          {team.score !== undefined ? team.score : '0'}
          {team.wickets !== undefined && `/${team.wickets}`}
        </p>
      </div>
    </div>
  )
);

TeamScore.displayName = 'TeamScore'; 