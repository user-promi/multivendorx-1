import React from 'react';
declare global {
	interface Window {
		MULTIVENDORX_ROUTES: {
			tab: string;
			component: React.ComponentType<Record<string, unknown>>;
		}[];
		registerMultiVendorXRoute: (route: {
			tab: string;
			component: React.ComponentType<Record<string, unknown>>;
		}) => void;
	}
}

window.MULTIVENDORX_ROUTES = window.MULTIVENDORX_ROUTES || [];

export const registerMultiVendorXRoute = (route) => {
	window.MULTIVENDORX_ROUTES.push(route);

	// notify React
	window.dispatchEvent(new Event('multivendorx-routes'));
};

window.registerMultiVendorXRoute = registerMultiVendorXRoute;
