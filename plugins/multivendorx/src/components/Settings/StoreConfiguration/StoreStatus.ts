import { __ } from '@wordpress/i18n';

export default {
id: 'store_status_control',
priority: 3,
name: __( 'Store Status', 'multivendorx' ),
desc: __(
'Control access and visibility based on store approval status. Configure how pending, rejected, suspended, and approved stores behave within your marketplace.',
'multivendorx'
),
icon: 'adminlib-store',
submitUrl: 'settings',
modal: [
{
key: 'pending_status',
type: 'notice',
label: __( 'Pending Status', 'multivendorx' ),
desc: __(
'Pending stores can log in to their dashboard but cannot configure any settings. All configuration options remain locked until the store is approved.',
'multivendorx'
),
icon: 'info-outline',
status: 'warning',
},
{
key: 'rejected_status',
type: 'notice',
label: __( 'Rejected Status', 'multivendorx' ),
desc: __(
'Rejected stores can log in to their dashboard and reapply for approval. Their actions are limited to resubmitting store information for review.',
'multivendorx'
),
icon: 'dismiss',
status: 'error',
},
{
key: 'suspended_status_section',
type: 'section',
label: __( 'Suspended Status', 'multivendorx' ),
hint: __( 'Temporarily inactive stores', 'multivendorx' ),
},
{
key: 'show_products_on_storefront',
type: 'setting-toggle',
label: __( 'Show products on storefront', 'multivendorx' ),
desc: __(
'Keep suspended store products visible to customers (non-purchasable). When enabled, customers can view products but will see a notice that the store is temporarily unavailable for purchases.',
'multivendorx'
),
tooltip: __(
'Even if visible, suspended store products cannot be purchased. They appear with a “Currently Unavailable” message.',
'multivendorx'
),
options: [
{
key: 'show',
label: __( 'Visible (non-purchasable)', 'multivendorx' ),
value: 'show',
},
{
key: 'hide',
label: __( 'Hidden', 'multivendorx' ),
value: 'hide',
},
],
},
{
key: 'approved_status_section',
type: 'section',
label: __( 'Approved Status', 'multivendorx' ),
hint: __( 'Active and operational stores', 'multivendorx' ),
},
{
key: 'dashboard_access_control',
type: 'button',
label: __( 'Configure dashboard capabilities', 'multivendorx' ),
desc: __(
'Manage which dashboard menus and features approved stores can access.',
'multivendorx'
),
buttonText: __( 'Open Configuration', 'multivendorx' ),
icon: 'admin-generic',
action: 'redirect', // could open a specific settings subpage
},
{
key: 'approved_status_highlights',
type: 'checkbox',
label: __( 'Approved store features', 'multivendorx' ),
class: 'mvx-toggle-checkbox',
options: [
{
key: 'full_dashboard_access',
label: __( 'Full dashboard access', 'multivendorx' ),
desc: __( 'All dashboard features enabled for the store.', 'multivendorx' ),
value: 'full_dashboard_access',
},
{
key: 'storefront_live',
label: __( 'Storefront live', 'multivendorx' ),
desc: __( 'Products visible and purchasable by customers.', 'multivendorx' ),
value: 'storefront_live',
},
],
selectDeselect: false,
},
{
key: 'global_notice',
type: 'notice',
label: __( 'Global impact', 'multivendorx' ),
desc: __(
'Changes made here apply to all stores with the corresponding status. Adjust these settings carefully as they affect overall marketplace behavior.',
'multivendorx'
),
icon: 'info-outline',
status: 'info',
},
],
};