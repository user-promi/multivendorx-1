import { applyFilters } from '@wordpress/hooks';
import AddProductCom from './dashboard/addProducts';
import SpmvProducts from './dashboard/spmvProducts';
import AddOrder from './dashboard/addOrder';
import OrderDetails from './dashboard/orderDetails';

export interface DashboardRouteConfig {
	tab: string;
	element: string;
	component: React.ComponentType<any>;
}

const BASE_DASHBOARD_ROUTES: DashboardRouteConfig[] = [
	{
		tab: 'products',
		element: 'add',
		component: SpmvProducts,
	},
	{
		tab: 'products',
		element: 'edit',
		component: AddProductCom,
	},
	{
		tab: 'orders',
		element: 'add',
		component: AddOrder,
	},
	{
		tab: 'orders',
		element: 'view',
		component: OrderDetails,
	},
];

export const getDashboardRoutes = (): DashboardRouteConfig[] => {
	return applyFilters(
		'multivendorx_dashboard_routes',
		BASE_DASHBOARD_ROUTES
	);
};