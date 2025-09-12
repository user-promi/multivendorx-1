<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$store_id = $args['store_id'];

$store_tabs = MultiVendorX()->store->storeutil->get_store_tabs( $store_id );
if ( empty( $store_tabs ) ) {
	return;
}
?>
<ul class="mvx-store-tabs">
    <?php foreach ( $store_tabs as $key => $tab ) : ?>
        <?php if ( ! empty( $tab['url'] ) ) : ?>
            <li class="mvx-store-tab <?php echo esc_attr( $key ); ?>">
                <a href="<?php echo esc_url( $tab['url'] ); ?>">
                    <?php echo esc_html( $tab['title'] ); ?>
                </a>
            </li>
        <?php endif; ?>
    <?php endforeach; ?>
</ul>

<div class="mvx-store-products">
        <?php
         
        if ( woocommerce_product_loop() ) : 

        /**
         * Hook: woocommerce_before_shop_loop.
         */
        do_action( 'woocommerce_before_shop_loop' );

        woocommerce_product_loop_start();

        while ( have_posts() ) {
            the_post();

            /**
             * Hook: woocommerce_shop_loop.
             */
            do_action( 'woocommerce_shop_loop' );

            wc_get_template_part( 'content', 'product' );
        }

        woocommerce_product_loop_end();

        /**
         * Hook: woocommerce_after_shop_loop.
         */
        do_action( 'woocommerce_after_shop_loop' );
        
    else :

        /**
         * Hook: woocommerce_no_products_found.
         */
        do_action( 'woocommerce_no_products_found' );
    
    endif;
        ?>
    </div>
<?php
// if ( woocommerce_product_loop() ) {

// 			/**
// 			 * Hook: woocommerce_before_shop_loop.
// 			 *
// 			 * @see woocommerce_output_all_notices() Render error notices (priority 10)
// 			 * @see woocommerce_result_count() Show number of results found (priority 20)
// 			 * @see woocommerce_catalog_ordering() Show form to control sort order (priority 30)
// 			 *
// 			 * @since 6.3.0
// 			 */
// 			do_action( 'woocommerce_before_shop_loop' );

// 			woocommerce_product_loop_start();

// 			if ( wc_get_loop_prop( 'total' ) ) {
// 				while ( have_posts() ) {
// 					the_post();

// 					/**
// 					 * Hook: woocommerce_shop_loop.
// 					 *
// 					 * @since 6.3.0
// 					 */
// 					do_action( 'woocommerce_shop_loop' );

// 					wc_get_template_part( 'content', 'product' );
// 				}
// 			}

// 			woocommerce_product_loop_end();

// 			/**
// 			 * Hook: woocommerce_after_shop_loop.
// 			 *
// 			 * @see woocommerce_pagination() Renders pagination (priority 10)
// 			 *
// 			 * @since 6.3.0
// 			 */
// 			do_action( 'woocommerce_after_shop_loop' );
// 		} else {
// 			/**
// 			 * Hook: woocommerce_no_products_found.
// 			 *
// 			 * @see wc_no_products_found() Default no products found content (priority 10)
// 			 *
// 			 * @since 6.3.0
// 			 */
// 			do_action( 'woocommerce_no_products_found' );
// 		}




// $paged = max( 1, get_query_var( 'paged' ) );

// $args = [
//     'post_type'      => 'product',
//     'post_status'    => 'publish',
//     'posts_per_page' => wc_get_default_products_per_row() * wc_get_default_product_rows_per_page(),
//     'paged'          => $paged,
//     'meta_query'     => [
//         [
//             'key'     => 'multivendorx_store_id',
//             'value'   => $store_id,
//             'compare' => '=',
//         ],
//     ],
// ];

// $products = new WP_Query( $args );

// if ( $products->have_posts() ) :

//     wc_setup_loop( [
//         'total'    => $products->found_posts,
//         'per_page' => $products->query_vars['posts_per_page'],
//         'current'  => max( 1, $paged ),
//         'is_paginated' => true,
//         'total_pages'  => $products->max_num_pages,
//     ] );

//     /**
//      * Same as shop page: notices, sorting, result count
//      */
//     do_action( 'woocommerce_before_shop_loop' );

//     woocommerce_product_loop_start();

//     while ( $products->have_posts() ) :
//         $products->the_post();

//         do_action( 'woocommerce_shop_loop' );

//         wc_get_template_part( 'content', 'product' );

//     endwhile;

//     woocommerce_product_loop_end();

//     do_action( 'woocommerce_after_shop_loop' );

//     wp_reset_postdata();
//     wc_reset_loop(); // cleanup WooCommerce loop data

// else :

//     do_action( 'woocommerce_no_products_found' );

// endif;

