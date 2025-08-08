import React from 'react';
import { DetailedPlayer } from '@cricket-score/shared-types';

interface BattingPlayerProps {
  player: DetailedPlayer;
  isStriker?: boolean;
}

export const BattingPlayer = React.memo<BattingPlayerProps>(
  ({ player, isStriker }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg backdrop-blur-lg ${
      isStriker 
        ? 'bg-sky-500/10 border border-sky-400/40' 
        : 'bg-muted/30 border border-muted/50'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isStriker ? 'bg-sky-400' : 'bg-muted'}`}></div>
        <p className={`font-semibold ${isStriker ? 'text-sky-300' : 'text-foreground'}`}>
          {player.name} {isStriker && <span className="text-sky-400">*</span>}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="font-bold text-lg text-foreground">{player.runs}</p>
        <span className="text-xs font-normal text-muted-foreground">({player.balls})</span>
      </div>
    </div>
  )
);

BattingPlayer.displayName = 'BattingPlayer'; 