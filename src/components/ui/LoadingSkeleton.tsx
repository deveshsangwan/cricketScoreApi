import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'md'
}) => {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }[rounded];

  return (
    <div
      className={`bg-muted/40 backdrop-blur-lg animate-pulse ${height} ${width} ${roundedClass} ${className}`}
    />
  );
};

export const MatchCardSkeleton: React.FC = () => (
  <div className="p-6 border-2 border-border/60 rounded-xl shadow-2xl bg-card/50 backdrop-blur-lg relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-xl before:-z-10">
    <div className="space-y-4 relative">
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-1/2" />
      <Skeleton height="h-10" width="w-full" rounded="lg" />
    </div>
  </div>
);

export const MatchStatsHeaderSkeleton: React.FC = () => (
  <div className="mb-8 text-center space-y-4">
    {/* Tournament name badge */}
    <Skeleton height="h-6" width="w-32" className="mx-auto" rounded="full" />

    {/* Match title */}
    <div className="space-y-2">
      <Skeleton height="h-10" width="w-80" className="mx-auto" />
      <Skeleton height="h-8" width="w-64" className="mx-auto" />
    </div>

    {/* Live/Finished status badge */}
    <Skeleton height="h-8" width="w-20" className="mx-auto" rounded="full" />
  </div>
);

export const TeamScoreSkeleton: React.FC<{ withBattingIndicator?: boolean }> = ({ withBattingIndicator = false }) => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card/50 backdrop-blur-lg border-2 border-border/60 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-card/40 before:to-card/20 before:rounded-lg before:-z-10">
    <div className="flex items-center gap-4 relative">
      <div className="relative">
        <Skeleton height="h-12" width="w-12" rounded="full" />
        {withBattingIndicator && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-muted/50 rounded-full border-2 border-background animate-pulse"></div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton height="h-6" width="w-24" />
          {withBattingIndicator && (
            <Skeleton height="h-4" width="w-16" rounded="full" />
          )}
        </div>
        <Skeleton height="h-4" width="w-20" />
      </div>
    </div>
    <div className="text-right relative">
      <Skeleton height="h-8" width="w-20" />
    </div>
  </div>
);

export const CommentarySkeleton: React.FC = () => (
  <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
    <div className="p-6 border-b border-border/60 relative">
      <div className="flex items-center gap-2">
        <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
        <h2 className="text-xl font-bold text-foreground drop-shadow-md">Live Commentary</h2>
        <div className="ml-auto">
          <Skeleton height="h-5" width="w-16" rounded="full" />
        </div>
      </div>
    </div>

    <div className="p-6 h-auto max-h-[300px] space-y-4 relative">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="p-3 rounded-lg border-l-4 border-l-muted bg-card/30 backdrop-blur-sm border-2 border-border/60">
          {index % 3 === 0 && (
            <div className="mb-2">
              <Skeleton height="h-5" width="w-16" rounded="full" />
            </div>
          )}
          <div className="space-y-2">
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-3/4" />
            {index % 2 === 0 && <Skeleton height="h-4" width="w-1/2" />}
          </div>
        </div>
      ))}
    </div>

    {/* Expand button skeleton */}
    <div className="border-t border-border/60">
      <div className="w-full p-4 flex items-center justify-center gap-2">
        <Skeleton height="h-4" width="w-24" />
        <Skeleton height="h-4" width="w-4" rounded="sm" />
      </div>
    </div>
  </div>
);

export const CurrentBattingSkeleton: React.FC = () => (
  <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
    <div className="flex items-center gap-2 mb-4 relative">
      <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
      <h2 className="text-xl font-bold text-foreground drop-shadow-md">Current Batting</h2>
    </div>
    <div className="space-y-2 relative">
      {/* Striker */}
      <div className="flex justify-between items-center p-3 rounded-lg bg-sky-100/80 dark:bg-sky-950/50 backdrop-blur-sm border-2 border-sky-400/60 dark:border-sky-500/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-400"></div>
          <Skeleton height="h-5" width="w-24" />
        </div>
        <div className="flex items-baseline gap-1">
          <Skeleton height="h-6" width="w-8" />
          <Skeleton height="h-4" width="w-6" />
        </div>
      </div>

      {/* Non-striker */}
      <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 backdrop-blur-sm border-2 border-muted/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <Skeleton height="h-5" width="w-28" />
        </div>
        <div className="flex items-baseline gap-1">
          <Skeleton height="h-6" width="w-8" />
          <Skeleton height="h-4" width="w-6" />
        </div>
      </div>
    </div>
  </div>
);

export const RunRatesSkeleton: React.FC = () => (
  <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
    <div className="flex items-center gap-2 mb-4 relative">
      <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
      <h2 className="text-xl font-bold text-foreground drop-shadow-md">Run Rates</h2>
    </div>
    <div className="space-y-4 relative">
      <div className="flex justify-between items-center">
        <Skeleton height="h-4" width="w-32" />
        <Skeleton height="h-6" width="w-12" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton height="h-4" width="w-36" />
        <Skeleton height="h-6" width="w-12" />
      </div>
    </div>
  </div>
);

export const KeyStatsSkeleton: React.FC = () => (
  <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
    <div className="flex items-center gap-2 mb-4 relative">
      <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
      <h2 className="text-xl font-bold text-foreground drop-shadow-md">Key Stats</h2>
    </div>
    <div className="space-y-4 relative">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-muted/40 backdrop-blur-sm flex items-center justify-center mt-0.5 flex-shrink-0 border-2 border-muted/60">
            <div className="w-3 h-3 bg-muted-foreground/50 rounded animate-pulse"></div>
          </div>
          <div className="flex-1 space-y-2">
            <Skeleton height="h-3" width="w-24" />
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const MatchInfoSkeleton: React.FC = () => (
  <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
    <div className="flex items-center gap-2 mb-4 relative">
      <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
      <h2 className="text-xl font-bold text-foreground drop-shadow-md">Match Info</h2>
    </div>
    <div className="space-y-4 text-sm divide-y divide-border/60 relative">
      {/* Status */}
      <div className="flex items-center gap-3 pb-3">
        <div className="w-8 h-8 rounded-full bg-muted/40 backdrop-blur-sm flex items-center justify-center border-2 border-muted/60">
          <div className="w-4 h-4 bg-muted-foreground/50 rounded animate-pulse"></div>
        </div>
        <div className="space-y-1">
          <Skeleton height="h-3" width="w-12" />
          <Skeleton height="h-4" width="w-16" />
        </div>
      </div>

      {/* Tournament */}
      <div className="flex items-center gap-3 py-3">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <div className="w-4 h-4 bg-muted-foreground/50 rounded animate-pulse"></div>
        </div>
        <div className="space-y-1">
          <Skeleton height="h-3" width="w-20" />
          <Skeleton height="h-4" width="w-32" />
        </div>
      </div>
    </div>
  </div>
);

export const InfoCardSkeleton: React.FC<{ title: string; children?: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
    <div className="flex items-center gap-2 mb-4 relative">
      <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
      <h2 className="text-xl font-bold text-foreground drop-shadow-md">{title}</h2>
    </div>
    {children || (
      <div className="space-y-4 relative">
        <Skeleton height="h-4" />
        <Skeleton height="h-4" width="w-3/4" />
        <Skeleton height="h-4" width="w-1/2" />
      </div>
    )}
  </div>
);

export const BattingPlayerSkeleton: React.FC = () => (
  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 backdrop-blur-sm border-2 border-muted/50">
    <div className="flex items-center gap-2">
      <Skeleton height="h-2" width="w-2" rounded="full" />
      <Skeleton height="h-5" width="w-32" />
    </div>
    <div className="flex items-baseline gap-1">
      <Skeleton height="h-6" width="w-8" />
      <Skeleton height="h-4" width="w-6" />
    </div>
  </div>
);

export const FullPageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen text-foreground antialiased bg-gradient-theme">
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <MatchStatsHeaderSkeleton />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Main Scorecard and Commentary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scorecard */}
          <div className="bg-card/50 backdrop-blur-lg border-2 border-border/60 rounded-2xl p-6 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-card/40 before:to-card/20 before:rounded-2xl before:-z-10">
            <div className="flex items-center gap-2 mb-4 relative">
              <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
              <h2 className="text-xl font-bold text-foreground drop-shadow-md">Scorecard</h2>
            </div>
            <div className="space-y-5 relative">
              {/* Team 1 */}
              <TeamScoreSkeleton withBattingIndicator={true} />

              {/* VS Divider */}
              <div className="my-4 text-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-card/30 backdrop-blur-sm text-muted-foreground font-medium uppercase text-xs tracking-wider rounded-full border border-border/40">vs</span>
                </div>
              </div>

              {/* Team 2 */}
              <TeamScoreSkeleton />

              {/* Match Summary */}
              <div className="mt-6 pt-6 border-t border-border/40 text-center">
                <Skeleton height="h-12" width="w-80" className="mx-auto" rounded="lg" />
              </div>
            </div>
          </div>

          {/* Commentary */}
          <CommentarySkeleton />
        </div>

        {/* Right Column: Additional Info */}
        <div className="space-y-6">
          {/* Current Batting */}
          <CurrentBattingSkeleton />

          {/* Run Rates */}
          <RunRatesSkeleton />

          {/* Key Stats */}
          <KeyStatsSkeleton />

          {/* Match Info */}
          <MatchInfoSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export const MatchesListSkeleton: React.FC = () => (
  <section className="container mx-auto px-6 py-12">
    <div className="space-y-8">
      <Skeleton height="h-10" width="w-48" />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <MatchCardSkeleton key={index} />
        ))}
      </div>
    </div>
  </section>
); 