// Check in catalogx

/**
 * External dependencies
 */
import React, { useState, useEffect, JSX } from 'react';
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
    site_url?:any;
}

interface TourStep {
    selector: any;
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
    content: () => JSX.Element;
}

interface TourProps {
    appLocalizer: AppLocalizer;
}

const Tour: React.FC<TourProps> = ({ appLocalizer }) => {

    const { setIsOpen, setSteps, setCurrentStep } = useTour();
    const [isNavigating, setIsNavigating] = useState<boolean>(false);

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

            // Ensure the page is fully loaded before checking for the element
            if (document.readyState === 'complete') {
                checkElement();
            } else {
                window.addEventListener('load', checkElement, { once: true });
            }
        });

        const navigateTo = async (
            url: string,
            step: number,
            selector?: string // optional
        ): Promise<void> => {
            setIsNavigating(true);
            setIsOpen(false); // Close the tour
            window.location.href = url; // Navigate to the new page
        
            // Wait for the element only if selector is provided
            if (selector) {
                await waitForElement(selector);
            }
        
            // Short delay to handle page rendering
            setTimeout(() => {
                setCurrentStep(step); // Move to the next step
                setIsOpen(true); // Reopen the tour
                setIsNavigating(false);
            }, 500);
        };

    const finishTour = async (): Promise<void> => {
        setIsOpen(false); // Close the tour

        try {
            await axios.post(
                getApiLink(appLocalizer, 'tour'),
                {
                    active: false,           
                },
                {
                    headers: {
                        'X-WP-Nonce': appLocalizer.nonce,
                    },
                }
            );
            // console.log("Tour marked as complete.");
        } catch (error) {
            console.error('Error updating tour flag:', error);
        }
        
    };

    const settingsTourSteps: TourStep[] = [
        {
            selector: undefined,
            placement: 'right',
            content: () => (
                <div className="tour-box">
                    <h3>Store Commissionstest from zyra</h3>
                    <h4>Manage your store commission settings here.</h4>
                    <div className="tour-footer">
                        <button
                            className="admin-btn btn-purple"
                            onClick={() =>
                                navigateTo(
                                    `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=disbursement`,
                                    1
                                )
                            }
                        >
                            Next
                        </button>
                        <button className="admin-btn btn-purple" onClick={() => finishTour()}>
                            End Tour
                        </button>
                    </div>
                </div>
            ),
        },
        {
            selector: undefined,
            placement: 'auto',
            content: () => (
                <div className="tour-box">
                    <h3>Disbursement</h3>
                    <h4>View and configure your disbursement settings here.</h4>
                    <div className="tour-footer">
                        <button
                            className="admin-btn btn-purple"
                            onClick={() =>
                                navigateTo(
                                    `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=payment-integration`,
                                    2
                                )
                            }
                        >
                            Next
                        </button>
                        <button className="admin-btn btn-purple" onClick={() => finishTour()}>
                            End Tour
                        </button>
                    </div>
                </div>
            ),
        },
        {
            selector: undefined,
            placement: 'auto',
            content: () => (
                <div className="tour-box">
                    <h3>Payment Integration</h3>
                    <h4>Set up your payment integration settings here.</h4>
                    <div className="tour-footer">
                        <button
                            className="admin-btn btn-purple"
                            onClick={() =>
                                navigateTo(
                                    `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-registration-form`,
                                    3
                                )
                            }
                        >
                            Next
                        </button>
                        <button className="admin-btn btn-purple" onClick={() => finishTour()}>
                            End Tour
                        </button>
                    </div>
                </div>
            ),
        },
        {
            selector: undefined,
            placement: 'auto',
            content: () => (
                <div className="tour-box">
                    <h3>Store Registration Form</h3>
                    <h4>Manage the registration form for new stores.</h4>
                    <div className="tour-footer">
                        <button
                            className="admin-btn btn-purple"
                            onClick={() =>
                                navigateTo(
                                    `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
                                    4
                                )
                            }
                        >
                            Next
                        </button>
                        <button className="admin-btn btn-purple" onClick={() => finishTour()}>
                            End Tour
                        </button>
                    </div>
                </div>
            ),
        },
        {
            selector: undefined,
            placement: 'auto',
            content: () => (
                <div className="tour-box">
                    <h3>Modules</h3>
                    <h4>Here you can enable or disable marketplace modules.</h4>
                    <div className="tour-footer">
                        <button className="admin-btn btn-purple" onClick={() => finishTour()}>
                            Finish Tour
                        </button>
                    </div>
                </div>
            ),
        },
    ];

    useEffect(() => {
        // Fetch tour status API call
        const fetchTourState = async (): Promise<void> => {
            if (window.location.href === appLocalizer.module_page_url) {
                try {
                    const response = await axios.get<{ active: string }>(
                        getApiLink(appLocalizer, 'tour'),
                        {
                            headers: { 'X-WP-Nonce': appLocalizer.nonce },
                        }
                    );

                    if (response.data.active !== '') {
                        if (setSteps) {
                            setSteps(settingsTourSteps);
                        }
                        setIsOpen(true); // Start the tour
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Error fetching tour flag:', error);
                }
            }
        };

        if (!isNavigating) {
            fetchTourState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNavigating, setSteps]);

    return null;
};

export default Tour;
