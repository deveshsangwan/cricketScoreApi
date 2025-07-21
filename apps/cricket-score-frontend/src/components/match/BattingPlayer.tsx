import React from 'react';
import { DetailedPlayer } from '@/types/api';

interface BattingPlayerProps {
  player: DetailedPlayer;
  isStriker?: boolean;
}

export const BattingPlayer = React.memo<BattingPlayerProps>(
  ({ player, isStriker }) => (
    <div className={`flex justify-between items-center p-3 rounded-lg backdrop-blur-lg ${
      isStriker 
        ? 'bg-sky-100/80 dark:bg-sky-950/50 border-2 border-sky-400/60 dark:border-sky-500/50' 
        : 'bg-muted/30 border-2 border-muted/50'
    }`}>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isStriker ? 'bg-sky-500 dark:bg-sky-400' : 'bg-muted'}`}></div>
        <p className={`font-semibold drop-shadow-md ${isStriker ? 'text-sky-700 dark:text-sky-300' : 'text-foreground'}`}>
          {player.name} {isStriker && <span className="text-sky-600 dark:text-sky-500">*</span>}
        </p>
      </div>
      <div className="flex items-baseline gap-1">
        <p className="font-bold text-lg text-foreground drop-shadow-md">{player.runs}</p>
        <span className="text-xs font-normal text-muted-foreground">({player.balls})</span>
      </div>
    </div>
  )
);

BattingPlayer.displayName = 'BattingPlayer'; 