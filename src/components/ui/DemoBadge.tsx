import React from 'react';

/** Visible marker for sections rendering simulated / mock data. */
export const DemoBadge: React.FC<{ label?: string; className?: string }> = ({
  label = 'Demo data',
  className = '',
}) => (
  <span
    title="This section shows simulated data, not live market data."
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-400/40 bg-amber-400/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${className}`}
  >
    <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
    {label}
  </span>
);
