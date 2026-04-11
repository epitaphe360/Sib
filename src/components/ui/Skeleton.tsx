import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = animation === 'pulse' ? 'animate-pulse' : 'animate-wave';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? undefined : '100%')
  };

  return (
    <div
      className={`bg-gray-200 ${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Skeleton pour les cartes de stats
export const StatCardSkeleton: React.FC = () => (
  <div className="p-6 bg-white rounded-xl shadow-lg">
    <div className="flex items-center">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="ml-4 flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={24} />
      </div>
    </div>
  </div>
);

// Skeleton pour les graphiques
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <Skeleton width="40%" height={24} className="mb-4" />
    <div className="space-y-2" style={{ height }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-end gap-2" style={{ height: '20%' }}>
          <Skeleton height={`${(i + 1) * 20}%`} className="flex-1" />
          <Skeleton height={`${(i + 2) * 15}%`} className="flex-1" />
        </div>
      ))}
    </div>
  </div>
);

// Skeleton pour les rendez-vous
export const AppointmentCardSkeleton: React.FC = () => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
    <div className="flex items-center gap-3 mb-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <Skeleton width="100%" height={12} />
  </div>
);

// Skeleton pour le dashboard complet
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="space-y-2 flex-1">
          <Skeleton width="40%" height={32} />
          <Skeleton width="60%" height={16} />
        </div>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>

    {/* Appointments */}
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <AppointmentCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
