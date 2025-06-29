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
      className={`bg-slate-700/50 animate-pulse ${height} ${width} ${roundedClass} ${className}`}
    />
  );
};

export const MatchCardSkeleton: React.FC = () => (
  <div className="p-6 border border-border rounded-xl shadow-lg bg-card">
    <div className="space-y-4">
      <Skeleton height="h-6" width="w-3/4" />
      <Skeleton height="h-4" width="w-1/2" />
      <Skeleton height="h-10" width="w-full" rounded="lg" />
    </div>
  </div>
);

export const MatchStatsHeaderSkeleton: React.FC = () => (
  <div className="mb-8 text-center space-y-4">
    <Skeleton height="h-6" width="w-32" className="mx-auto" rounded="full" />
    <Skeleton height="h-12" width="w-96" className="mx-auto" />
    <Skeleton height="h-8" width="w-24" className="mx-auto" rounded="full" />
  </div>
);

export const TeamScoreSkeleton: React.FC = () => (
  <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-900/60">
    <div className="flex items-center gap-4">
      <Skeleton height="h-12" width="w-12" rounded="full" />
      <div className="space-y-2">
        <Skeleton height="h-6" width="w-24" />
        <Skeleton height="h-4" width="w-16" />
      </div>
    </div>
    <div className="text-right space-y-2">
      <Skeleton height="h-8" width="w-20" />
    </div>
  </div>
);

export const InfoCardSkeleton: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-gradient-to-br from-[#142D3B] to-[#0f2230] border border-[#234354] rounded-2xl p-6 shadow-xl">
    <div className="flex items-center gap-2 mb-4">
      <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-4">
      <Skeleton height="h-4" />
      <Skeleton height="h-4" width="w-3/4" />
      <Skeleton height="h-4" width="w-1/2" />
    </div>
  </div>
);

export const BattingPlayerSkeleton: React.FC = () => (
  <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/20">
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
  <div className="min-h-screen text-slate-200 antialiased bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl">
      <MatchStatsHeaderSkeleton />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Main Scorecard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-[#142D3B] to-[#0f2230] border border-[#234354] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-1 w-5 bg-sky-400 rounded-full"></div>
              <h2 className="text-xl font-bold text-white">Scorecard</h2>
            </div>
            <div className="space-y-6">
              <TeamScoreSkeleton />
              <div className="my-4 text-center relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#142D3B] text-slate-500 font-medium uppercase text-xs tracking-wider">vs</span>
                </div>
              </div>
              <TeamScoreSkeleton />
            </div>
          </div>
        </div>

        {/* Right Column: Additional Info */}
        <div className="space-y-6">
          <InfoCardSkeleton title="Current Batting" />
          <InfoCardSkeleton title="Run Rates" />
          <InfoCardSkeleton title="Match Info" />
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