import React from 'react';
import { DetailedPlayer } from '@/types/api';

interface BattingPlayerProps {
  player: DetailedPlayer;
  isStriker?: boolean;
}

export const BattingPlayer = React.memo<BattingPlayerProps>(
  ({ player, isStriker }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg ${isStriker ? 'bg-sky-950/40' : 'bg-slate-800/20'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isStriker ? 'bg-sky-400' : 'bg-slate-600'}`}></div>
        <p className={`font-semibold ${isStriker ? 'text-sky-300' : 'text-slate-300'}`}>
          {player.name} {isStriker && <span className="text-sky-500">*</span>}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="font-bold text-lg text-white">{player.runs}</p>
        <span className="text-xs font-normal text-slate-400">({player.balls})</span>
      </div>
    </div>
  )
);

BattingPlayer.displayName = 'BattingPlayer'; 