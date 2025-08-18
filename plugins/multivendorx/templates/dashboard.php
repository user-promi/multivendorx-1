<?php
use MultiVendorX\RestAPI\Controllers\MultiVendorX_REST_Dashboard_Controller;

$dashboard_controller = new MultiVendorX_REST_Dashboard_Controller();
$all_endpoints = $dashboard_controller->all_endpoints();
$current_user = wp_get_current_user();
$role = reset($current_user->roles);
$capability_settings = MultiVendorX()->setting->get_setting($role);

if (get_option('permalink_structure')) {
    $current_page = get_query_var('dashboard_page');
    $current_sub  = get_query_var('dashboard_subpage');
} else {
    $current_page = filter_input(INPUT_GET, 'dashboard_page', FILTER_SANITIZE_STRING);
    $current_sub  = filter_input(INPUT_GET, 'dashboard_subpage', FILTER_SANITIZE_STRING);
}

function get_endpoint_url($page = '', $sub = '') {
    if (get_option('permalink_structure')) {
        $url = home_url('/dashboard');
        if ($page && $page !== 'dashboard') {
            $url .= '/' . $page;
        }
        if ($sub) {
            $url .= '/' . $sub;
        }
    } else {
        $url = add_query_arg(array('dashboard' => '1'), home_url('/'));
        if ($page && $page !== 'dashboard') {
            $url = add_query_arg('dashboard_page', $page, $url);
        }
        if ($sub) {
            $url = add_query_arg('dashboard_subpage', $sub, $url);
        }
    }
    return esc_url($url);
}

if (empty($current_page)) {
    $current_page = 'dashboard';
}

// Auto-redirect if submenu exists
if ($current_page && empty($current_sub)) {
    foreach ($all_endpoints as $section) {
        if ($section['slug'] === $current_page && !empty($section['submenu'])) {
            $first_sub = $section['submenu'][0]['slug'];
            wp_safe_redirect(get_endpoint_url($current_page, $first_sub));
            exit;
        }
    }
}

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
    <div id="store-dashboard">
        <div class="dashboard-nav">
            <ul>
                <?php foreach ($all_endpoints as $section): ?>
                    <li class="<?php echo ($current_page === $section['slug'] && empty($current_sub)) ? 'active' : ''; ?>">
                        <?php if (!empty($section['submenu'])): ?>
                            <a href="#" onclick="return false;">
                                <?php echo esc_html($section['name']); ?>
                            </a>
                        <?php else: ?>
                            <a href="<?php echo esc_url(get_endpoint_url($section['slug'])); ?>">
                                <?php echo esc_html($section['name']); ?>
                            </a>
                        <?php endif; ?>
                    </li>

                    <?php if (!empty($section['submenu'])): ?>
                        <ul>
                            <?php foreach ($section['submenu'] as $submenu): ?>
                                <li class="<?php echo ($current_page === $section['slug'] && $current_sub === $submenu['slug']) ? 'active' : ''; ?>">
                                    <a href="<?php echo esc_url(get_endpoint_url($section['slug'], $submenu['slug'])); ?>">
                                        <?php echo esc_html($submenu['name']); ?>
                                    </a>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                <?php endforeach; ?>
            </ul>
        </div>

        <div class="dashboard-content">
            <?php
            $div_id  = '';
            $allowed = true;

            if ($current_page) {
                foreach ($all_endpoints as $key => $section) {
                    if ($section['slug'] === $current_page) {
                        if (!empty($section['capability'])) {
                            $allowed = false;
                            
                            foreach ($section['capability'] as $cap) {
                                if (current_user_can($cap) && in_array( $cap, $capability_settings, true )) {
                                    $allowed = true;
                                    break;
                                }
                            }
                        }

                        if ($current_sub && !empty($section['submenu'])) {
                            foreach ($section['submenu'] as $submenu) {
                                if ($submenu['slug'] === $current_sub) {
                                    if (!empty($submenu['capability'])) {
                                        $allowed = false;
                                        
                                        foreach ($submenu['capability'] as $cap) {
                                            if (current_user_can($cap) && in_array( $cap, $capability_settings, true )) {
                                                $allowed = true;
                                                break;
                                            }
                                        }
                                    }
                                    $div_id = 'dashboard-' . $submenu['key'];
                                    break;
                                }
                            }
                        } else {
                            $div_id = 'dashboard-' . $key;
                        }
                        break;
                    }
                }

                if ($div_id) {
                    if ($allowed) {
                        echo '<div id="' . esc_attr($div_id) . '">' . esc_html($div_id) . '</div>';
                    } else {
                        echo '<div>You do not have permission to access this section.</div>';
                    }
                }
            }
            ?>
        </div>

    </div>
<?php wp_footer(); ?>
</body>
</html>