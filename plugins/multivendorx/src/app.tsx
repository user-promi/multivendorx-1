import { useLocation } from 'react-router-dom';

import Settings from './components/Settings/Settings';
import Payments from './components/Payments/Payments';
import Store from './components/Store/Store';
import { ModuleProvider } from './contexts/ModuleContext';

const Route = () => {
    const currentTab = new URLSearchParams( useLocation().hash );
    return (
        <>
            { currentTab.get( 'tab' ) === 'settings' && (
                <Settings id={ 'settings' } />
            ) }
            { currentTab.get( 'tab' ) === 'payments' && (
                <Payments />
            ) }
            { currentTab.get( 'tab' ) === 'store-management' && (
                <Store />
            ) }
        </>
    );
};

const App = () => {
    const currentTabParams = new URLSearchParams( useLocation().hash );
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
            <ModuleProvider
                modules={ ( window as any ).appLocalizer?.active_modules || [] }
            >
                <Route />
            </ModuleProvider>
        </>
    );
};

export default App;
