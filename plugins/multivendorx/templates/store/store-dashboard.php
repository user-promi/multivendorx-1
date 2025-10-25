<?php

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;

$all_endpoints = MultiVendorX()->rest->dashboard->all_endpoints();
$user          = wp_get_current_user();
$store_ids     = StoreUtil::get_stores_from_user_id( $user->ID );
$store_dashboard_logo = MultiVendorX()->setting->get_setting( 'store_dashboard_site_logo', array() );
$page_info     = MultiVendorX()->rest->dashboard->get_current_page_and_submenu();
$active_store  = $page_info['active_store'];
$current_page  = $page_info['current_page'];
$current_sub   = $page_info['current_sub'];
$id            = $page_info['id'];
$error_msg     = $page_info['error_msg'];

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <div id="store-dashboard">
        <div class="dashboard-tabs-wrapper">
        <div class="logo-wrapper">
            <?php if ( ! empty( $store_dashboard_logo ) ) : ?>
                <img src="<?php echo esc_url( $store_dashboard_logo ); ?>" alt="">
            <?php else : ?>
                <span class="site-name"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
            <?php endif; ?>
            <i class='adminlib-menu'></i>
        </div>

            <ul class="dashboard-tabs">
                <?php foreach ( $all_endpoints as $section ) : ?>
                    <?php
                    $has_submenu = ! empty( $section['submenu'] );
                    $is_active   = ( $current_page === $section['slug'] && empty( $current_sub ) );
                    ?>
                    <li class="tab-name <?php echo $is_active ? 'active' : ''; ?>">
                        <a
                            class="tab"
                            <?php echo $has_submenu ? 'href="#" onclick="return false;"' : 'href="' . esc_url( StoreUtil::get_endpoint_url( $section['slug'] ) ) . '"'; ?>
                        >
                            <i class="<?php echo esc_attr( $section['icon'] ); ?>"></i>
                            <?php echo esc_html( $section['name'] ); ?>
                            <?php if ( $has_submenu ) : ?>
                                <i class="admin-arrow adminlib-pagination-right-arrow"></i>
                            <?php endif; ?>
                        </a>

                        <?php if ( $has_submenu ) : ?>
                            <ul class="subtabs">
                                <?php foreach ( $section['submenu'] as $submenu ) : ?>
                                    <?php
                                    $sub_active = ( $current_page === $section['slug'] && $current_sub === $submenu['slug'] );
                                    ?>
                                    <li class="<?php echo $sub_active ? 'active' : ''; ?>">
                                        <a href="<?php echo esc_url( StoreUtil::get_endpoint_url( $section['slug'], $submenu['slug'] ) ); ?>">
                                            <?php echo esc_html( $submenu['name'] ); ?>
                                        </a>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        <?php endif; ?>
                    </li>
                <?php endforeach; ?>
            </ul>

        </div>

        <div class="dashboard-content tab-wrapper">
            <div class="top-navbar-wrapper">            
                <div class="top-navbar">
                    <div class="navbar-leftside">
                    </div>
                    <div class="navbar-rightside">
                        <ul class="navbar-right">
                            <li>
                                <div class="adminlib-icon adminlib-vendor-form-add"></div>
                            </li>
                            <li>
                                <div class="adminlib-icon notification adminlib-notification"></div>

                                <div class="dropdown-menu notification"><div class="title">Notifications <span class="admin-badge green">2 New</span></div><div class="notification"><ul><li><a href="/orders"><div class="icon admin-badge blue"><i class="adminlib-cart-icon"></i></div><div class="details"><span class="heading">New Order Received</span><span class="message">Order #1024 has been placed</span><span class="time">1 hour ago</span></div></a></li><li><a href="/reviews"><div class="icon admin-badge yellow"><i class="adminlib-star-icon"></i></div><div class="details"><span class="heading">New Review</span><span class="message">John left a 5-star review</span><span class="time">30 mins ago</span></div></a></li></ul></div><div class="footer"><a href="/notifications" class="admin-btn btn-purple"><i class="adminlib-eye"></i> View all notifications</a></div></div>
                            </li>
                            <li id="fullscreenToggle">
                                <div class="adminlib-icon adminlib-crop-free"></div>
                            </li>

                            <li class="dropdown login-user">
                                <div class="avatar-wrapper">
                                    <i class="adminlib-icon adminlib-person"></i>
                                </div>
                                <div class="dropdown-menu">

                                    <div class="dropdown-header">
                                        <div class="user-card">
                                            <div class="user-avatar">
                                                <?php echo get_avatar( $user->ID, 48 ); ?>
                                            </div>
                                            <div class="user-info">
                                                <span class="user-name"><?php echo esc_html( $user->display_name ); ?></span>
                                                <span class="user-email"><?php echo esc_html( $user->user_email ); ?></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="dropdown-body">
                                        <ul>
                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-person"></i>
                                                    My Profile
                                                </a>
                                            </li>

                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-setting"></i>
                                                    Account Setting
                                                </a>
                                            </li>
                                        </ul>
                                    </div>

                                    <div class="store-wrapper">
                                        <h3>Switch stores</h3>
                                        <?php
                                        // Count stores excluding the active one.
                                        $active_store = $page_info['active_store'] ?? null;

                                        $available_stores = array_filter(
                                            $store_ids,
                                            function ( $id ) use ( $active_store ) {
                                                return $id !== $active_store;
                                            }
                                        );

                                        if ( ! empty( $available_stores ) ) :
                                            ?>
                                            <ul>
                                                <?php
                                                foreach ( $available_stores as $store_id ) :
                                                    $store = Store::get_store_by_id( $store_id );
                                                    ?>
                                                    <li>
                                                        <a href="javascript:void(0);" class="switch-store" data-store-id="<?php echo esc_attr( $store_id ); ?>">
                                                            <i class="adminlib-user-network-icon"></i>
                                                            <?php echo esc_html( $store->get( 'name' ) ); ?>
                                                        </a>
                                                    </li>
                                                <?php endforeach; ?>
                                            </ul>
                                        <?php else : ?>
                                            <p><?php echo esc_html__( 'No store found', 'multivendorx' ); ?></p>
                                        <?php endif; ?>
                                    </div>

                                    <div class="dropdown-footer">
                                        <ul>
                                            <li>
                                                <a href="<?php echo esc_url( wp_logout_url( get_permalink( (int) MultiVendorX()->setting->get_setting( 'store_dashboard_page' ) ) ) ); ?>">
                                                    <i class="adminlib-import"></i>
                                                    <?php echo esc_html__( 'Sign Out', 'multivendorx' ); ?>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </li>

                        </ul>
                    </div>
                </div>
            </div>
            <?php
            
            ?>

            <div class="content-wrapper" id="<?php echo $id ? esc_attr( $id ) : ''; ?>"> 
                <div class="permission-wrapper">
                    <i class="adminlib-info red"></i>
                    <div class="title"><?php echo esc_html( $error_msg ); ?></div>
                    <div class="admin-btn btn-purple"><?php echo esc_html__( 'Contact Admin', 'multivendorx' ); ?></div>
                </div>

                <?php if ( !$error_msg ) { ?>
                    <div class="page-title-wrapper">
                        <div class="page-title">
                            <div class="title"><?php echo esc_html( $id ); ?></div>
                            <div class="des"><?php echo esc_html__( 'Manage your store information and preferences', 'multivendorx' ); ?></div>
                        </div>
                    </div>
                <?php } ?>
            </div>

        </div>
    </div>
    <?php wp_footer(); ?>
</body>

</html>
