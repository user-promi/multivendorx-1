// External dependencies
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { TourProvider, ProviderProps, StepType, useTour } from '@reactour/tour';

// Internal dependencies
import { getApiLink } from '../utils/apiService';
import { ButtonInputUI } from './ButtonInput';

interface AppLocalizer {
    enquiry_form_settings_url?: string;
    page_url?: string;
    settings_page_url?: string;
    site_url?: string;
    module_page_url?: string;
    customization_settings_url?: string;
    apiUrl: string;
    nonce: string;
    restUrl: string;
    admin_dashboard_url?: string;
}

interface TourContent {
    title: string;
    description: string;
    nextBtn?: {
        link: string;
        step: number;
    };
    finishBtn?: boolean;
}

interface TourProps {
    appLocalizer: AppLocalizer;
    steps: StepType[];
    forceOpen: boolean | number;
}

interface TourSetupProps extends Omit<ProviderProps, 'steps'> {
    appLocalizer: AppLocalizer;
    steps: StepType[];
    forceOpen: boolean | number;
}

/**
 * Main Tour component that handles the guided tour functionality
 */
const Tour: React.FC<TourProps> = ({ appLocalizer, steps, forceOpen }) => {
    const { setIsOpen, setSteps, setCurrentStep } = useTour();

    const waitForElement = (selector: string): Promise<Element> =>
        new Promise((resolve) => {
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else {
                    setTimeout(checkElement, 100);
                }
            };
            document.readyState === 'complete'
                ? checkElement()
                : window.addEventListener('load', checkElement, { once: true });
        });

    const finishTour = async () => {
        setIsOpen(false);
        try {
            await axios.post(
                getApiLink(appLocalizer, 'tour'),
                { active: true },
                { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
            );
        } catch (e) {
            console.error('Error updating tour flag:', e);
        }
    };

    const navigateTo = async (url: string, step: number, selector?: string) => {
        setIsOpen(false);
        window.open(url, '_self');
        if (selector) {
            await waitForElement(selector);
        }
        setTimeout(() => {
            setCurrentStep(step);
            setIsOpen(true);
        }, 500);
    };

    const processedSteps = useMemo(() => {
        return steps.map((step, index) => {
            const isLastStep = index === steps.length - 1;

            return {
                ...step,
                content: () => {
                    const content = step.content({
                        navigateTo,
                        finishTour,
                        appLocalizer,
                    }) as TourContent;

                    const buttons = [];

                    if (!isLastStep) {
                        buttons.push({ text: 'End Tour', color: 'red', onClick: finishTour });
                    }

                    if (!isLastStep && content.nextBtn) {
                        buttons.push({
                            text: 'Next',
                            color: 'purple',
                            onClick: () => navigateTo(content.nextBtn!.link, content.nextBtn!.step),
                        });
                    }

                    if (isLastStep && content.finishBtn) {
                        buttons.push({ text: 'Finish Tour', color: 'purple', onClick: finishTour });
                    }

                    return (
                        <div className="tour-box">
                            <div className="title">{content.title}</div>
                            <div className="desc">{content.description}</div>
                            <ButtonInputUI buttons={buttons} />
                        </div>
                    );
                },
            };
        });
    }, [steps]);

    useEffect(() => {
        if (forceOpen) {
            setSteps(processedSteps);
            setIsOpen(true);
            return;
        }

        const fetchTourState = async () => {
            try {
                const response = await axios.get(getApiLink(appLocalizer, 'tour'), {
                    headers: { 'X-WP-Nonce': appLocalizer.nonce },
                });
                if (response.data.active === false) {
                    setSteps?.(processedSteps);
                    setIsOpen?.(true);
                }
            } catch (error) {
                console.error('Error fetching tour flag:', error);
            }
        };

        fetchTourState();
    }, [forceOpen, appLocalizer]);

    return null;
};

/**
 * Wraps the Tour component with TourProvider context
 */
const TourSetup: React.FC<TourSetupProps> = ({
    appLocalizer,
    steps,
    forceOpen = false,
    ...rest
}) => {
    return (
        <TourProvider
            steps={[]}
            showNavigation={false}
            className="tour-content"
            styles={{
                popover: (base) => ({
                    ...base,
                    padding: '1.125rem',
                    borderRadius: '0.313rem',
                }),
            }}
            showPrevNextButtons={false}
            showDots={false}
            showBadge={false}
            onClickClose={({ setIsOpen }) => {
                setIsOpen(false);
                // Trigger finishTour via the close button — handled externally via axios
                axios
                    .post(
                        getApiLink(appLocalizer, 'tour'),
                        { active: true },
                        { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
                    )
                    .catch((e) => console.error('Error updating tour flag on close:', e));
            }}
            {...rest}
        >
            <Tour appLocalizer={appLocalizer} steps={steps} forceOpen={forceOpen} />
        </TourProvider>
    );
};

export default TourSetup;