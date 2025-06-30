import React from 'react';
import { getTeamFlag } from '@/utils/teamFlags';
import { Team } from '@/types/api';

interface TeamScoreProps {
  team: Team;
  isBatting?: boolean;
}

export const TeamScore = React.memo<TeamScoreProps>(
  ({ team, isBatting }) => (
    <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60 backdrop-blur-sm transition-all hover:bg-slate-800/70">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={getTeamFlag(team.name)}
            alt={`${team.name} Flag`}
            className="w-12 h-12 object-cover rounded-full border-2 border-slate-600 shadow-lg"
          />
          {isBatting && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-800 animate-pulse"></div>
          )}
        </div>
        <div>
          <p className="text-xl font-bold text-white">
            {team.name}
            {team.isBatting && (
              <span className="ml-2 text-xs font-medium text-red-400 uppercase tracking-wider bg-red-500/10 py-1 px-2 rounded-full">
                Batting
              </span>
            )}
          </p>
          {team.overs !== undefined && (
            <p className="text-sm font-medium text-slate-400">
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
      <div className="text-right">
        <p className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          {team.score !== undefined ? team.score : '0'}
          {team.wickets !== undefined && `/${team.wickets}`}
        </p>
      </div>
    </div>
  )
);

TeamScore.displayName = 'TeamScore'; 