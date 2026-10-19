import React from 'react';
import { OneShotLogo } from './OneShotLogo';

interface RobinhoodFeatherLogoProps {
  className?: string;
}

export const RobinhoodFeatherLogo: React.FC<RobinhoodFeatherLogoProps> = ({
  className = 'w-5 h-5',
}) => {
  return <OneShotLogo className={className} />;
};
