<?php

$subtab = get_query_var('subtab');
$value = get_query_var('value');

if ($subtab === 'edit') {
    if (!empty($value)) {
        MultiVendorX()->store->products->call_edit_product();
    } else {
        if ( MultiVendorX()->setting->get_setting('category_pyramid_guide') == 'yes' ) {
            MultiVendorX()->store->products->call_add_product();
        }
    }
}