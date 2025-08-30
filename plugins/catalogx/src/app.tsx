import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import QuoteRequests from './components/QuoteRequests/quoteRequests';
import EnquiryMessages from './components/EnquiryMessages/enquiryMessages';
import WholesaleUser from './components/WholesaleUser/wholesaleUser';
import Rules from './components/Rules/Rules';
import gif from './assets/images/product-page-builder.gif';
import { TourProvider } from '@reactour/tour';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import { AdminHeader, Banner, Tour, initializeModules } from 'zyra';
import { __ } from '@wordpress/i18n';
import Brand from './assets/images/Brand.png';

const disableBody = ( target: any ) => disableBodyScroll( target );
const enableBody = ( target: any ) => enableBodyScroll( target );
localStorage.setItem( 'force_catalogx_context_reload', 'true' );
interface Products {
    title: string;
    description: string;
}

const Route = () => {
    const currentTab = new URLSearchParams( useLocation().hash );
    return (
        <>
            { currentTab.get( 'tab' ) === 'settings' && (
                <Settings id={ 'settings' } />
            ) }
            { currentTab.get( 'tab' ) === 'modules' && <Modules /> }
            { currentTab.get( 'tab' ) === 'quote-requests' && (
                <QuoteRequests />
            ) }
            { currentTab.get( 'tab' ) === 'wholesale-users' && (
                <WholesaleUser />
            ) }
            { currentTab.get( 'tab' ) === 'enquiry-messages' && (
                <EnquiryMessages />
            ) }
            { currentTab.get( 'tab' ) === 'rules' && <Rules /> }
        </>
    );
};
const products: Products[] = [
    {
        title: __( 'Double Opt-In', 'notifima' ),
        description: __(
            'Experience the power of Double Opt-In for our Stock Alert Form - Guaranteed precision in every notification!',
            'notifima'
        ),
    },
    {
        title: __( 'Your Subscription Hub', 'notifima' ),
        description: __(
            'Subscription Dashboard - Easily monitor and download lists of out-of-stock subscribers for seamless management.',
            'notifima'
        ),
    },
    {
        title: __( 'Mailchimp Bridge', 'notifima' ),
        description: __(
            'Seamlessly link WooCommerce out-of-stock subscriptions with Mailchimp for effective marketing.',
            'notifima'
        ),
    },
    {
        title: __( 'Unsubscribe Notifications', 'notifima' ),
        description: __(
            'User-Initiated Unsubscribe from In-Stock Notifications.',
            'notifima'
        ),
    },
    {
        title: __( 'Ban Spam Emails', 'notifima' ),
        description: __(
            'Email and Domain Blacklist for Spam Prevention.',
            'notifima'
        ),
    },
];
const App = () => {
    const currentTabParams = new URLSearchParams( useLocation().hash );
    document
        .querySelectorAll( '#toplevel_page_catalogx>ul>li>a' )
        .forEach( ( menuItem ) => {
            const menuItemUrl = new URL(
                ( menuItem as HTMLAnchorElement ).href
            );
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring( 1 )
            );

            if ( menuItem.parentNode ) {
                ( menuItem.parentNode as HTMLElement ).classList.remove(
                    'current'
                );
            }
            if (
                menuItemHashParams.get( 'tab' ) ===
                currentTabParams.get( 'tab' )
            ) {
                ( menuItem.parentNode as HTMLElement ).classList.add(
                    'current'
                );
            }
        } );

    const handleResultClick = ( res: { element: Element; tab: string } ) => {
        // switch tab by updating URL hash
        window.location.hash = `&tab=${ res.tab }`;

        // wait for new tab to mount
        setTimeout( () => {
            res.element.scrollIntoView( {
                behavior: 'smooth',
                block: 'center',
            } );
            res.element.classList.add( 'highlight-search' );
            setTimeout(
                () => res.element.classList.remove( 'highlight-search' ),
                2000
            );
        }, 400 ); // slight delay so DOM is ready

        setResults( [] );
        setQuery( '' );
    };

    const handleSelectChange = ( val: string ) => {
        setSelectValue( val );
    };

    // --- INIT MODULES ---
    useEffect( () => {
        initializeModules( appLocalizer, 'multivendorx', 'free', 'modules' );
    }, [] );

    // --- TAB HIGHLIGHT LOGIC ---
    document
        .querySelectorAll( '#toplevel_page_multivendorx>ul>li>a' )
        .forEach( ( menuItem ) => {
            const menuItemUrl = new URL(
                ( menuItem as HTMLAnchorElement ).href
            );
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring( 1 )
            );

            if ( menuItem.parentNode ) {
                ( menuItem.parentNode as HTMLElement ).classList.remove(
                    'current'
                );
            }
            if (
                menuItemHashParams.get( 'tab' ) ===
                currentTabParams.get( 'tab' )
            ) {
                ( menuItem.parentNode as HTMLElement ).classList.add(
                    'current'
                );
            }
        } );

    return (
        <>
            <Banner
                products={ products }
                isPro={ appLocalizer.khali_dabba }
                proUrl={ appLocalizer.pro_url }
                tag="Why Premium"
                buttonText="View Pricing"
                bgCode="#852aff" // backgroud color
                textCode="#fff" // text code
                btnCode="#fff" // button color
                btnBgCode="#e35047" // button backgroud color
            />
            <AdminHeader
                brandImg={ Brand }
                query={ query }
                results={ results }
                onResultClick={ handleResultClick }
                onSelectChange={ handleSelectChange }
                selectValue={ selectValue }
                // free={appLocalizer.freeVersion}
            />
            <TourProvider
                steps={ [] }
                afterOpen={ disableBody }
                beforeClose={ enableBody }
                disableDotsNavigation={ true }
                showNavigation={ false }
                showCloseButton={ false }
            >
                <Tour
                    appLocalizer={ ( window as any ).appLocalizer }
                    gif={ gif }
                />
            </TourProvider>
            <Route />
        </>
    );
};

export default App;
