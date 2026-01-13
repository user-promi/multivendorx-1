<?php

namespace MultiVendorX\WPML;

use MultiVendorX\Utill;

class Admin
{
    protected $original_lang = null;

    public function __construct()
    {
        add_action('wp', array($this, 'disable_wpml_switcher_on_dashboard'), 99);
        add_filter('rest_pre_dispatch', array($this, 'switch_wpml_language_before_wc_query'), 10, 3);
        // add_filter(
        //     'rest_post_dispatch',
        //     array( $this, 'restore_wpml_language_after_request' ),
        //     10,
        //     3
        // );
    }

    /**
     * Disable WPML language switcher on multivendorx React store dashboard
     */
    public function disable_wpml_switcher_on_dashboard()
    {

        if (! Utill::is_store_dashboard()) {
            return;
        }

        add_filter('icl_ls_languages', '__return_empty_array');
    }
    public function switch_wpml_language_before_wc_query($result, $server, $request)
    {

        // Only WooCommerce products REST
        if (strpos($request->get_route(), '/wc/v3/products') === false) {
            return $result;
        }

        $lang = $request->get_param('lang');
        if (empty($lang)) {
            return $result;
        }

        if (defined('ICL_SITEPRESS_VERSION')) {
            global $sitepress;

            // Store original language once
            if (empty($this->original_lang)) {
                $this->original_lang = $sitepress->get_current_language();
            }

            $sitepress->switch_lang(sanitize_text_field($lang));
        }

        return $result;
    }

    public function restore_wpml_language_after_request()
    {

        if (! defined('ICL_SITEPRESS_VERSION')) {
            return;
        }

        if (empty($this->original_lang)) {
            return;
        }

        global $sitepress;
        $sitepress->switch_lang($this->original_lang);

        // Reset for next request
        $this->original_lang = null;
    }
}
