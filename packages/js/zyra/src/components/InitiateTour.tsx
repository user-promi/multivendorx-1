// External dependencies
import React, { useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { TourProvider, ProviderProps, StepType, useTour } from '@reactour/tour';

// Internal dependencies
import { getApiLink } from '../utils/apiService';
import { ButtonInputUI } from './ButtonInput';

interface TourContent {
    title: string;
    description: string;
    nextBtn?: {
        link: string;
        step: number;
    };
    finishBtn?: boolean;
}

interface GuidedTourProviderProps extends Omit<ProviderProps, 'steps'> {
    steps: StepType[];
}

const TourApi = {
    fetchTourStatus: async () => {
        const res = await axios.get(
            getApiLink(appLocalizer, 'tour'),
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        );
        return res.data;
    },

    updateTourStatus: async (isTourCompleted: boolean) => {
        await axios.post(
            getApiLink(appLocalizer, 'tour'),
            { isTourCompleted },
            { headers: { 'X-WP-Nonce': appLocalizer.nonce } }
        );
    }
};

/**
 * Main Tour component that handles the guided tour functionality
 */
const GuidedTourController = ({ steps }: { steps: StepType[] }) => {
    const { setIsOpen, setSteps, setCurrentStep } = useTour();

    const handleFinishTour = useCallback(async () => {
        setIsOpen(false);
        await TourApi.updateTourStatus(true);
    }, [setIsOpen]);

    const handleTourNavigation = useCallback(
        (url: string, step: number) => {
            setIsOpen(false);
            window.open(url, '_self');

            setTimeout(() => {
                setCurrentStep(step);
                setIsOpen(true);
            }, 500);
        },
        [setIsOpen, setCurrentStep]
    );

    useEffect(() => {
            const initializeTour = async () => {
                try {
                    const data = await TourApi.fetchTourStatus();
    
                    if (!data.isTourCompleted) {
                        const processedSteps = steps.map((step, index) => ({
                            ...step,
                            content: () => {
                                const content = step.content({
                                    handleTourNavigation,
                                    handleFinishTour
                                }) as TourContent;
    
                                const isLast = index === steps.length - 1;
    
                                const tourActionButtons = [];
    
                                if (!isLast) {
                                    tourActionButtons.push({
                                        text: 'End Tour',
                                        color: 'red',
                                        onClick: handleFinishTour
                                    });
                                }
    
                                if (!isLast && content.nextBtn) {
                                    tourActionButtons.push({
                                        text: 'Next',
                                        color: 'purple',
                                        onClick: () =>
                                            handleTourNavigation(
                                                content.nextBtn!.link,
                                                content.nextBtn!.step
                                            )
                                    });
                                }
    
                                if (isLast && content.finishBtn) {
                                    tourActionButtons.push({
                                        text: 'Finish Tour',
                                        color: 'purple',
                                        onClick: handleFinishTour
                                    });
                                }
    
                                return (
                                    <div className="tour-box">
                                        <div className="title">{content.title}</div>
                                        <div className="desc">{content.description}</div>
                                        <ButtonInputUI buttons={tourActionButtons} />
                                    </div>
                                );
                            }
                        }));
    
                        setSteps(processedSteps);
                        setIsOpen(true);
                    }
                } catch (e) {
                    console.error('Error loading tour:', e);
                }
            };
    
            initializeTour();
        }, [steps, setSteps, setIsOpen, handleTourNavigation, handleFinishTour]);

    return null;
};

/**
 * Wraps the Tour component with TourProvider context
 */
const GuidedTourProvider: React.FC<GuidedTourProviderProps> = ({
    steps,
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
                // Trigger handleFinishTour via the close button — handled externally via axios
                TourApi.updateTourStatus(true);
            }}
            {...rest}
        >
            <GuidedTourController steps={steps} />
        </TourProvider>
    );
};

export default GuidedTourProvider;