declare global {
	interface Window {
		MULTIVENDORX_ROUTES: {
			tab: string;
			component: React.ComponentType<any>;
		}[];
		registerMultiVendorXRoute: (route: {
			tab: string;
			component: React.ComponentType<any>;
		}) => void;
	}
}

window.MULTIVENDORX_ROUTES = window.MULTIVENDORX_ROUTES || [];

window.registerMultiVendorXRoute = (route) => {
	window.MULTIVENDORX_ROUTES.push(route);

	// notify React
	window.dispatchEvent(new Event('mvx-routes-updated'));
};