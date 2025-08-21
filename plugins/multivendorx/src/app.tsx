import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AdminHeader, initializeModules } from 'zyra';
import Settings from './components/Settings/Settings';
import Modules from './components/Modules/Modules';
import Store from './components/Store/Store';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import Membership from './components/Memberships/Membership';
import Brand from './assets/images/mvx-brand-logo.png';
import StatusAndTools from './components/StatusAndTools/StatusAndTools';
import SetupWizard from './blocks/setupWizard/SetupWizard';

localStorage.setItem('force_multivendorx_context_reload', 'true');

const Route = () => {
    const currentTab = new URLSearchParams(useLocation().hash);
    return (
        <>
            {currentTab.get('tab') === 'settings' && (
                <Settings id={'settings'} />
            )}
            {currentTab.get('tab') === 'memberships' && (
                <Membership id='memberships' />
            )}
            {currentTab.get('tab') === 'status-tools' && (
                <StatusAndTools id='status-tools' />
            )}
            {currentTab.get('tab') === 'modules' && <Modules />}
            {currentTab.get('tab') === 'stores' && (
                <Store />
            )}
            {currentTab.get('tab') === 'dashboard' && (
                <AdminDashboard />
            )}
            {currentTab.get('tab') === 'setup' && (
                <SetupWizard />
            )}
        </>
    );
};

const App = () => {
    const currentTabParams = new URLSearchParams(useLocation().hash);
    document
        .querySelectorAll('#toplevel_page_multivendorx>ul>li>a')
        .forEach((menuItem) => {
            const menuItemUrl = new URL(
                (menuItem as HTMLAnchorElement).href
            );
            const menuItemHashParams = new URLSearchParams(
                menuItemUrl.hash.substring(1)
            );

            if (menuItem.parentNode) {
                (menuItem.parentNode as HTMLElement).classList.remove(
                    'current'
                );
            }
            if (
                menuItemHashParams.get('tab') ===
                currentTabParams.get('tab')
            ) {
                (menuItem.parentNode as HTMLElement).classList.add(
                    'current'
                );
            }
        });

    useEffect(() => {
        initializeModules(appLocalizer, 'multivendorx', 'free', 'modules');
    }, []);

    return (
        <>
            <AdminHeader brandImg={Brand} />
            <Route />
        </>
    );
};

export default App;
