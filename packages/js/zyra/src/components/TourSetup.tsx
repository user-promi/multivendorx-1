/**
 * External dependencies
 */
import React, { FC } from 'react';
import { TourProvider, ProviderProps, StepType } from '@reactour/tour';
import Tour from './TourSteps';

// AppLocalizer interface
export interface AppLocalizer {
  enquiry_form_settings_url?: string;
  module_page_url?: string;
  settings_page_url?: string;
  customization_settings_url?: string;
  apiUrl?: string;
  nonce?: any;
}

// Props for TourSetup
interface TourSetupProps extends Omit<ProviderProps, 'steps'> {
  appLocalizer: AppLocalizer;
  steps: StepType[];
}

/**
 * TourSetup component wraps the Tour component with TourProvider.
 * This ensures that the useTour() hook inside the Tour component
 * finds its context provider within the same rendering environment.
 */
const TourSetup: FC<TourSetupProps> = ({ appLocalizer, steps, ...rest }) => {
  return (
    <TourProvider steps={steps} {...rest}>
      <Tour appLocalizer={appLocalizer} />
    </TourProvider>
  );
};

export default TourSetup;
