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
    nonce?: string;
}

// Props for TourSetup
interface TourSetupProps extends Omit< ProviderProps, 'steps' > {
    appLocalizer: AppLocalizer;
    steps: StepType[];
}

/**
 * Wraps the Tour component with context
 */
const TourSetup: FC< TourSetupProps > = ( {
    appLocalizer,
    steps,
    ...rest
} ) => {
    return (
        <TourProvider steps={ [] } { ...rest }>
            <Tour appLocalizer={ appLocalizer } steps={ steps } />
        </TourProvider>
    );
};

export default TourSetup;
