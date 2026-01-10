<?php
return array(
    'name'        => 'basic-store-template',
    'title'       => __( 'Basic Store Template', 'multivendorx' ),
    'description' => __( 'A simple starter layout for a store page.', 'multivendorx' ),
    'keywords'    => array( 'store', 'basic', 'layout' ),
    'content'     => '
        <!-- wp:group {"layout":{"type":"constrained"}} -->
        <div class="wp-block-group">

            <!-- wp:heading -->
            <h2>Store Title</h2>
            <!-- /wp:heading -->

            <!-- wp:paragraph -->
            <p>This is a simple store description. You can customize this text.</p>
            <!-- /wp:paragraph -->

            <!-- wp:separator -->
            <hr class="wp-block-separator"/>
            <!-- /wp:separator -->

            <!-- wp:columns -->
            <div class="wp-block-columns">

                <!-- wp:column -->
                <div class="wp-block-column">
                    <!-- wp:heading {"level":3} -->
                    <h3>About the Store</h3>
                    <!-- /wp:heading -->

                    <!-- wp:paragraph -->
                    <p>Write something about the vendor here.</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:column -->

                <!-- wp:column -->
                <div class="wp-block-column">
                    <!-- wp:heading {"level":3} -->
                    <h3>Contact Information</h3>
                    <!-- /wp:heading -->

                    <!-- wp:paragraph -->
                    <p>Email: store@example.com</p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:column -->

            </div>
            <!-- /wp:columns -->

        </div>
        <!-- /wp:group -->
    ',
);
