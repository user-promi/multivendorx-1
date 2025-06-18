<?php
/**
 * Frontend class file.
 *
 * @package MooWoodle
 */

namespace MooWoodle;

/**
 * MooWoodle Frontend class
 *
 * @version 3.1.7
 * @package MooWoodle
 * @author  DualCube
 */
class Frontend {
	/**
     * Frontend constructor.
     */
	public function __construct() {
		// Reset cart quantities after update.
		add_action( 'woocommerce_cart_updated', array( $this, 'update_cart_quantity' ) );
	}

	/**
	 * Enforce quantity restriction based on plugin version and settings.
	 */
	public function update_cart_quantity() {
		$group_purchase_enabled = MooWoodle()->setting->get_setting( 'group_purchase_enable', array() );

		if ( in_array( 'group_purchase_enable', $group_purchase_enabled, true ) && MooWoodle()->util->is_khali_dabba() ) {
			return;
		}

		foreach ( WC()->cart->get_cart() as $cart_item_key => $cart_item ) {
			if ( $cart_item['quantity'] > 1 ) {
				WC()->cart->set_quantity( $cart_item_key, 1 );
			}
		}
	}
}
