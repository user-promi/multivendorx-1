// dashboard/subtab.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export interface Subtab {
    subtab: string;
    label: string;
    component: React.FC;
}

interface Props {
    tabKey: string;
    subtabs: Subtab[];
}

const SubtabWrapper: React.FC< Props > = ( { tabKey, subtabs } ) => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams( location.search );

    const currentSubtab = query.get( 'subtab' ) || subtabs[ 0 ].subtab;
    const CurrentComponent =
        subtabs.find( ( s ) => s.subtab === currentSubtab )?.component ||
        subtabs[ 0 ].component;

    const handleClick = ( subtab: string ) => {
        query.set( 'tab', tabKey );
        query.set( 'subtab', subtab );
        navigate( `?${ query.toString() }` );
    };

    return (
        <div className="subtab-wrapper">
            <ul className="subtabs">
                { subtabs.map( ( s ) => (
                    <li
                        key={ s.subtab }
                        className={
                            s.subtab === currentSubtab ? 'current' : ''
                        }
                    >
                        <a
                            href={ `?tab=${ tabKey }&subtab=${ s.subtab }` }
                            onClick={ ( e ) => {
                                e.preventDefault();
                                handleClick( s.subtab );
                            } }
                        >
                            { s.label }
                        </a>
                    </li>
                ) ) }
            </ul>

            <div className="subtab-content">
                <CurrentComponent />
            </div>
        </div>
    );
};

export default SubtabWrapper;
