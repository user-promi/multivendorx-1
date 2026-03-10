declare global {
	interface Window {
		MVX_ROUTES: {
			tab: string;
			component: React.ComponentType<any>;
		}[];
		registerMVXRoute: (route: {
			tab: string;
			component: React.ComponentType<any>;
		}) => void;
	}
}

window.MVX_ROUTES = window.MVX_ROUTES || [];

window.registerMVXRoute = (route) => {
	window.MVX_ROUTES.push(route);

	// notify React
	window.dispatchEvent(new Event('mvx-routes-updated'));
};