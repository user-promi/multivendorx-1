<?php
/**
 * Plugin block template wrapper.
 *
 * Renders plugin block template for /store/{store_slug}/ endpoint.
 *
 * @package MultiVendorX
 */

defined( 'ABSPATH' ) || exit;

get_header();

$store_page = get_page_by_path( 'store' );

if ( $store_page && ! empty( $store_page->post_content ) ) {
    echo wp_kses_post( do_blocks( $store_page->post_content ) );
} else {
    // Fallback (unlikely, page should have content).
    $block_template_path = MultiVendorX()->plugin_path . 'templates/store/store.html';

    // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
    $blocks_html = file_exists( $block_template_path ) ? file_get_contents( $block_template_path ) : '';

    echo wp_kses_post( do_blocks( $blocks_html ) );
}

get_footer();
