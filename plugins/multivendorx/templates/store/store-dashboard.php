<?php

use MultiVendorX\Store\StoreUtil;
use MultiVendorX\Store\Store;

$all_endpoints = MultiVendorX()->rest->dashboard->all_endpoints();
$current_user = wp_get_current_user();
$store_ids = StoreUtil::get_stores_from_user_id($current_user->ID);
$page_info = MultiVendorX()->rest->dashboard->get_current_page_and_submenu();
$active_store = $page_info['active_store'];
$current_page = $page_info['current_page'];
$current_sub = $page_info['current_sub'];
$div_id = $page_info['div_id'];
$allowed = $page_info['allowed'];
$store = Store::get_store_by_id($active_store);

<<<<<<< HEAD:plugins/multivendorx/templates/store/store-dashboard.php
=======
if (get_option('permalink_structure')) {
    $current_page = get_query_var('tab');
    $current_sub = get_query_var('subtab');
} else {
    $current_page = filter_input(INPUT_GET, 'tab', FILTER_DEFAULT);
    $current_sub = filter_input(INPUT_GET, 'subtab', FILTER_DEFAULT);
}

if (empty($current_page)) {
    $current_page = 'dashboard';
}

// Auto-redirect if submenu exists
if ($current_page && empty($current_sub)) {
    foreach ($all_endpoints as $section) {
        if ($section['slug'] === $current_page && !empty($section['submenu'])) {
            $first_sub = $section['submenu'][0]['slug'];
            wp_safe_redirect(StoreUtil::get_endpoint_url($current_page, $first_sub));
            exit;
        }
    }
}

// Prepare the store dashboard logo
$store_dashboard_logo = MultiVendorX()->setting->get_setting('store_dashboard_site_logo', []);

// If not set, fallback to site name
$store_dashboard_logo = !empty($store_dashboard_logo) ? $store_dashboard_logo : get_bloginfo('name');

>>>>>>> 8aff9e41 (up to date):plugins/multivendorx/templates/store-dashboard.php
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <div id="store-dashboard">
        <div class="dashboard-tabs-wrapper">
        <div class="logo-wrapper">
            <?php if (filter_var($store_dashboard_logo, FILTER_VALIDATE_URL)): ?>
                <img src="<?php echo esc_url($store_dashboard_logo); ?>" alt="">
            <?php else: ?>
                <span class="site-name"><?php echo esc_html($store_dashboard_logo); ?></span>
            <?php endif; ?>
            <i class='adminlib-menu'></i>
        </div>

            <ul class="dashboard-tabs">
                <?php foreach ($all_endpoints as $section): ?>
                    <li
                        class="tab-name <?php echo ($current_page === $section['slug'] && empty($current_sub)) ? 'active' : ''; ?>">
                        <?php if (!empty($section['submenu'])): ?>
                            <a href="#" class="tab" onclick="return false;">
                                <i class="<?php echo esc_html($section['icon']); ?>"></i>
                                <?php echo esc_html($section['name']); ?>
                                <i class="admin-arrow adminlib-pagination-right-arrow"></i>
                            </a>
                        <?php else: ?>
                            <a class="tab" href="<?php echo esc_url(StoreUtil::get_endpoint_url($section['slug'])); ?>">
                                <i class="<?php echo esc_html($section['icon']); ?>"></i>
                                <?php echo esc_html($section['name']); ?>
                            </a>
                        <?php endif; ?>

                        <?php if (!empty($section['submenu'])): ?>
                            <ul class="subtabs">
                                <?php foreach ($section['submenu'] as $submenu): ?>
                                    <li
                                        class="<?php echo ($current_page === $section['slug'] && $current_sub === $submenu['slug']) ? 'active' : ''; ?>">
                                        <a href="<?php echo esc_url(StoreUtil::get_endpoint_url($section['slug'], $submenu['slug'])); ?>">
                                            <?php echo esc_html($submenu['name']); ?>
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
                                                <span>MS</span>
                                            </div>
                                            <div class="user-info">
                                                <span class="user-name">Max Smith </span>
                                                <span class="user-email">maxsmith@gmail.com </span>
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
                                    <?php if (!empty($store_ids) && is_array($store_ids)): ?>
                                        <div class="store-wrapper">
                                            <h3>Switch stores</h3>
                                            <ul>
                                                <?php
                                                foreach ($store_ids as $id) {
                                                    if ($id == $active_store)
                                                        continue; // skip active one
                                                    $store = Store::get_store_by_id($id);
                                                    ?>
                                                    <li>
                                                        <a href="javascript:void(0);" class="switch-store"
                                                            data-store-id="<?php echo esc_attr($id); ?>">
                                                            <i class="adminlib-user-network-icon"></i>
                                                            <?php echo esc_html($store->get('name')); ?>
                                                        </a>
                                                    </li>

                                                    <?php
                                                }
                                                ?>
                                            </ul>
                                        </div>
                                    <?php endif; ?>

                                    <div class="dropdown-footer">
                                        <ul>
                                            <li>
                                                <a href="#">
                                                    <i class="adminlib-import"></i>
                                                    Sign Out
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
            $status = $store->get('status');

            switch ($status) {
                case 'pending':
                    echo '<div>Waiting for approval</div>';
                    break;

                case 'reject':
                    echo '<div>The application is rejected</div>';
                    break;

                default:
                    if (!$div_id) {
                        return;
                    }

                    if (!$allowed) {
                        echo '
                            <div class="content-wrapper"> 
                                <div class="permission-wrapper">
                                    <i class="adminlib-info red"></i>
                                    <div class="title">You do not have permission to access this section.</div>
                                    <div class="des">Manage your store information and preferences</div>
                                    <div class="admin-btn btn-purple">Contact Admin</div>
                                </div>
                            </div>';
                        return;
                    }

                    if ($div_id === 'edit') {
                        MultiVendorX()->rest->dashboard->call_edit_product_template();
                    } else {
                        ?>
                        <div class="content-wrapper" id="<?php echo esc_attr($div_id); ?>">     
                            <div class="page-title-wrapper">
                                <div class="page-title">
                                    <div class="title"><?php echo esc_html($div_id); ?></div>
                                    <div class="des">Manage your store information and preferences</div>
                                </div>
                            </div> 
                        </div>
                        <?php
                    }
                    break;
            }
            ?>

        </div>
    </div>
    <?php wp_footer(); ?>
</body>

</html>