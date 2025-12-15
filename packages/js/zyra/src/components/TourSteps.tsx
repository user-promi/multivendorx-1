/**
 * External dependencies
 */
import React, { useState, useEffect, JSX, useMemo } from 'react';
import axios from 'axios';
import { useTour } from '@reactour/tour';
import { getApiLink } from '../utils/apiService';

// Types
interface AppLocalizer {
    enquiry_form_settings_url?: string;
    module_page_url?: string;
    settings_page_url?: string;
    customization_settings_url?: string;
    apiUrl?: string;
    nonce?: any;
    site_url?: any;
}

interface TourStep {
    selector: any;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    content: ( utils: any ) => JSX.Element;
}

interface TourProps {
    appLocalizer: AppLocalizer;
    steps: any[];
}

const Tour: React.FC< TourProps > = ( { appLocalizer, steps } ) => {
    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [ isNavigating, setIsNavigating ] = useState( false );

    const waitForElement = ( selector: string ): Promise< Element > =>
        new Promise( ( resolve ) => {
            const checkElement = () => {
                const element = document.querySelector( selector );
                if ( element ) {
                    resolve( element );
                } else {
                    setTimeout( checkElement, 100 );
                }
            };
            if ( document.readyState === 'complete' ) {
                checkElement();
            } else {
                window.addEventListener( 'load', checkElement, { once: true } );
            }
        } );

    const navigateTo = async (
        url: string,
        step: number,
        selector?: string
    ) => {
        setIsNavigating( true );
        setIsOpen( false );
        window.location.href = url;
        if ( selector ) {
            await waitForElement( selector );
        }

        setTimeout( () => {
            setCurrentStep( step );
            setIsOpen( true );
            setIsNavigating( false );
        }, 500 );
    };

    const finishTour = async () => {
        setIsOpen( false );
        try {
            await axios.post(
                getApiLink( appLocalizer, 'tour' ),
                { active: true },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            );
        } catch ( e ) {
            console.error( 'Error updating tour flag:', e );
        }
    };

    const processedSteps = useMemo( () => {
        return steps.map( ( step: any ) => ( {
            ...step,
            content: () =>
                step.content( {
                    navigateTo,
                    finishTour,
                    appLocalizer,
                } ),
        } ) );
    }, [ steps ] );

    useEffect( () => {
        const fetchTourState = async () => {
            if ( window.location.href === appLocalizer.module_page_url ) {
                try {
                    const response = await axios.get(
                        getApiLink( appLocalizer, 'tour' ),
                        { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                    );

                    if ( response.data.active === false ) {
                        if ( setSteps && setIsOpen ) {
                            setSteps( processedSteps );
                            setIsOpen( true );
                        }
                    }
                } catch ( error ) {
                    console.error( 'Error fetching tour flag:', error );
                }
            }
        };

        if ( ! isNavigating ) {
            fetchTourState();
        }
    }, [ isNavigating ] );

    return null;
};

export default Tour;
