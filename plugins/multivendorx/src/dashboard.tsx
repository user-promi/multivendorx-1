import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TabDefinition {
    tab: string;
    label: string;
    component: React.FC;
}

// Dynamically load all components from each endpoint folder
const getEndpoints = (): TabDefinition[] => {
    const context = require.context(
        './dashboard',
        true,
        /index\.(ts|tsx|js|jsx)$/
    );

    return context
        .keys()
        .map( ( key ) => {
            const match = key.match( /^\.\/([^\/]+)\/index\.(ts|tsx|js|jsx)$/ );
            if ( ! match ) return null;

            const tab = match[ 1 ];
            const Component = context( key ).default;

            return {
                tab,
                label: tab.charAt( 0 ).toUpperCase() + tab.slice( 1 ),
                component: Component,
            };
        } )
        .filter( Boolean ) as TabDefinition[];
};

const RouteRenderer: React.FC< {
    currentTab: string;
    endpoints: TabDefinition[];
} > = ( { currentTab, endpoints } ) => {
    const matched = endpoints.find( ( e ) => e.tab === currentTab );
    const Component = matched?.component;
    return Component ? <Component /> : <div>Invalid tab</div>;
};

const Dashboard: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const endpoints = useMemo( () => getEndpoints(), [] );

    const getTabFromURL = () => {
        const query = new URLSearchParams( location.search );
        return query.get( 'tab' ) || ( endpoints[ 0 ]?.tab ?? '' );
    };

    const [ currentTab, setCurrentTab ] = useState( getTabFromURL() );

    // Watch for tab changes in URL
    useEffect( () => {
        setCurrentTab( getTabFromURL() );
    }, [ location.search, endpoints ] );

    const handleTabClick = ( tab: string ) => {
        navigate( `?tab=${ tab }` );
    };

    if ( endpoints.length === 0 ) return <div>No endpoints found</div>;

    return (
        <div className="vendor-dashboard">
            <ul className="dashboard-tabs">
                { endpoints.map( ( e ) => (
                    <li
                        key={ e.tab }
                        className={ currentTab === e.tab ? 'current' : '' }
                    >
                        <a
                            href={ `?tab=${ e.tab }` }
                            onClick={ ( eClick ) => {
                                eClick.preventDefault();
                                handleTabClick( e.tab );
                            } }
                        >
                            { e.label }
                        </a>
                    </li>
                ) ) }
            </ul>

            <div className="tab-content">
                <RouteRenderer
                    currentTab={ currentTab }
                    endpoints={ endpoints }
                />
            </div>
        </div>
    );
};

export default Dashboard;
