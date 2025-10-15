declare module 'body-scroll-lock' {
    export function disableBodyScroll( targetElement: Element ): void;
    export function enableBodyScroll( targetElement: Element ): void;
}

// src/global.d.ts
export {};

declare global {
    interface AppLocalizer {
        google_maps_api_key: any;
        apiUrl: string;
        restUrl: string;
        nonce: string;
        woo_nonce:string,
        khali_dabba: boolean;
        tab_name: string;
        settings_databases_value: any;
        pages_list: any;
        vendor_dashboard_pages: any;
        pro_url: string;
        pro_settings_list: any;
        country_list: any;
        capabilities: any;
        custom_roles: any;
        store_owners: any;
        managers_list: any;
        product_managers_list: any;
        customer_support_list: any;
        assistants_list: any;
        all_payments: any;
        all_store_settings: any;
        store_payment_settings: any;
        store_id: any;
        freeVersion : any;
        marketplace_site:any;
        site_url:any;
        woocommerce_currency:any;
        color: any;
        ajaxurl: string;
        gateway_list: any;
        facilitators_list: any;
        user_id:any;
        currency:any;
        currency_symbol:any;
        edit_order_capability:any;
        add_product_link:any;
        map_providor:any;
        google_api_key:any;
        mapbox_api_key:any;
        all_verification_methods:any;
        tinymceApiKey:any;
        payout_payment_options:any;
    }
    interface Color{
        color: any;
    }
    interface RegistrationForm{
        apiUrl: string;
        nonce: string;
        settings: Array;
        default_placeholder: Array;
        content_before_form: any;
        content_after_form: any;
        error_strings: Array;
    }
    declare module '*.png';
    declare module '*.jpg';
    declare module '*.jpeg';

    var appLocalizer: AppLocalizer;
    var color: Color;
    var registrationForm:RegistrationForm
}
