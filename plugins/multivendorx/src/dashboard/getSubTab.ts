// dashboard/getSubTab.ts
export interface Subtab {
    subtab: string;
    label: string;
    component: React.FC;
}

// Load all: dashboard/*/*/index.tsx (two levels deep)
const context = require.context(
    './',
    true,
    /^\.\/[^/]+\/[^/]+\/index\.(ts|tsx|js|jsx)$/
);

export const getSubtabs = ( tabKey: string ): Subtab[] => {
    return context
        .keys()
        .map( ( key ) => {
            // Match: ./products/add-product/index.tsx
            const match = key.match(
                /^\.\/([^/]+)\/([^/]+)\/index\.(ts|tsx|js|jsx)$/
            );
            if ( ! match ) return null;

            const [ , tab, subtab ] = match;
            if ( tab !== tabKey ) return null;

            const Component = context( key ).default;

            return {
                subtab,
                label: subtab
                    .replace( /-/g, ' ' )
                    .replace( /\b\w/g, ( l ) => l.toUpperCase() ),
                component: Component,
            };
        } )
        .filter( Boolean ) as Subtab[];
};
