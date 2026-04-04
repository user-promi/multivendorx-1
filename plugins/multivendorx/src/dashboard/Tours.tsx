import { __ } from '@wordpress/i18n';

interface AppLocalizer {
    site_url: string;
    admin_url?: string;
    apiUrl?: string;
    nonce?: string;
    [key: string]: unknown;
}

interface TourStep {
    selector: string;
    placement: string;
    title: string;
    description: string;
    next?: {
        link: string;
        step: number;
    };
    finish?: boolean;
}

export const getTourSteps = (appLocalizer: AppLocalizer): TourStep[] => [
    {
        selector: '.card-content',
        placement: 'auto',
        title: __('Dashboard', 'multivendorx'),
        description: __(
            'Your daily snapshot - orders, revenue, commissions, all at a glance. Welcome home!',
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=commissions`,
            step: 1,
        },
    },
    {
        selector:
            '.form-group:has(.settings-form-label[for="commission_type"])',
        placement: 'right',
        title: __('Settings', 'multivendorx'),
        description: __(
            "Set up your store name, payouts, shipping & more - get this right once, and you're sorted!",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=payouts`,
            step: 2,
        },
    },
    {
        selector:
            '.form-group:has(.settings-form-label[for="disbursement_order_status"])',
        placement: 'right',
        title: __('Commissions', 'multivendorx'),
        description: __(
            "Every order you earn from lives here - track what's paid, what's pending, all in one place.",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=onboarding`,
            step: 3,
        },
    },
    {
        selector: '.form-group:has(.settings-form-label[for="approve_store"])',
        placement: 'right',
        title: __('Withdrawals', 'multivendorx'),
        description: __(
            "Check your available balance and request a payout — your money, whenever you're ready.",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
            step: 4,
        },
    },
    {
        selector: '.category-filter .category-item:nth-child(3)',
        placement: 'right',
        title: __('Notifications', 'multivendorx'),
        description: __(
            'All your important updates land here - tap the bell and stay in the loop!',
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
            step: 5,
        },
    },
    {
        selector: '[data-tour="simple-showcase-tour"]',
        placement: 'right',
        title: __('Add Your First Product', 'multivendorx'),
        description: __(
            "You're all set — let's list your first product and make that first sale happen!",
            'multivendorx'
        ),
        next: {
            link: `${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
            step: 6,
        },
    },
    {
        selector: '.category-filter .category-item:nth-child(5)',
        placement: 'right',
        title: __('Modules', 'multivendorx'),
        description: __(
            'Here you can enable or disable marketplace modules.',
            'multivendorx'
        ),
        finish: true,
    },
];
