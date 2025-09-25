<?php

$self = $args['self'];
$product_object = $args['product_object'];
$post = $args['post'];

$get_product_data_tabs = $self->get_product_data_tabs();
$other_tabs = apply_filters('mvx_product_extra_tabs_added', array('shipping', 'variations'));
$product_fileds = MultiVendorX()->setting->get_setting('products_fields', array());
$default_types = array('general', 'inventory', 'linked_product', 'attribute', 'advanced', 'policies');
foreach ($get_product_data_tabs as $key_tabs => $value_tabs) {
    if (is_array($other_tabs) && in_array($key_tabs, $other_tabs))
        continue;
}

if ($default_types && !empty($default_types)) {
    foreach ($default_types as $key_types => $value_types) {
        if (!in_array($value_types, $product_fileds)) {
            unset($get_product_data_tabs[$value_types]);
        }
    }
} else {
    unset($get_product_data_tabs['general'], $get_product_data_tabs['inventory'], $get_product_data_tabs['linked_product'], $get_product_data_tabs['attribute'], $get_product_data_tabs['advanced']);
}
?>

<div class="content-wrapper">
    <div class="page-title-wrapper">
        <div class="page-title">
            <div class="title">Edit Product</div>
            <div class="breadcrumbs">
                <span><a href="#">Products</a></span>
                <span> / <a href="">Edit Product</a></span>
            </div>
        </div>

        <div class="buttons-wrapper">
            <?php
            $primary_action = __('Submit', 'multivendorx');    //default value
            if (current_user_can('publish_products')) {
                if (!empty($product_object->get_id()) && get_post_status($product_object->get_id()) === 'publish') {
                    $primary_action = __('Update', 'multivendorx');
                } else {
                    $primary_action = __('Publish', 'multivendorx');
                }
            }
            ?>
            <input type="submit" class="admin-btn btn-purple" name="submit-data"
                value="<?php echo esc_attr($primary_action); ?>" id="mvx_frontend_dashboard_product_submit" />
            <input type="submit" class="admin-btn btn-purple" name="draft-data"
                value="<?php esc_attr_e('Draft', 'multivendorx'); ?>" id="mvx_frontend_dashboard_product_draft" />
            <input type="hidden" name="status" value="<?php echo esc_attr(get_post_status($post)); ?>">
            <?php wp_nonce_field('mvx-product', 'mvx_product_nonce'); ?>


            <div class="admin-btn btn-purple">
                Save draft
            </div>
            <div class="admin-btn btn-purple">
                Publish product
            </div>
        </div>
    </div>


<form id="mvx-edit-product-form" class="woocommerce form-horizontal" method="post"></form>
    <div class="container-wrapper">
        
            <div class="card-wrapper width-65">
                <div class="card-content">
                    <div class="card-title">Product information</div>

                     <div class="form-group-wrapper">
                    <div class="form-group">
                        <label for="product-name"><?php esc_html_e('Product Title', 'multivendorx'); ?></label>
                        <div class=" ">
                            <input type="text" class="basic-input" name="post_title" id="post_title"
                                value="<?php echo htmlspecialchars($product_object->get_title('edit')); ?>" ?>
                            <input type="hidden" name="original_post_title"
                                value="<?php echo htmlspecialchars($product_object->get_title('edit')); ?>">
                            <input type="hidden" name="post_ID" value="<?php echo $self->get_the_id(); ?>">
                            <input type="hidden" name="original_post_status"
                                value="<?php echo esc_attr(get_post_status($post)); ?>">
                        </div>
                    </div>
                </div>

                    <!-- <div class="pull-right full-1080">
                        <?php
                        $current_visibility = $product_object->get_catalog_visibility();
                        $current_featured = wc_bool_to_string($product_object->get_featured());
                        $visibility_options = wc_get_product_visibility_options();
                        ?>

                        <div id="product_visiblity" class="mvx-clps collapse dropdown-panel">
                            <input type="hidden" name="current_visibility" id="current_visibility"
                                value="<?php echo esc_attr($current_visibility); ?>" />
                            <input type="hidden" name="current_featured" id="current_featured"
                                value="<?php echo esc_attr($current_featured); ?>" />
                            <div class="product-visibility-toggle-inner">
                                <?php
                                foreach ($visibility_options as $name => $label) {
                                    echo '<div class="form-group"><label><input type="radio" name="_visibility" id="_visibility_' . esc_attr($name) . '" value="' . esc_attr($name) . '" ' . checked($current_visibility, $name, false) . ' data-label="' . esc_attr($label) . '" /> <span for="_visibility_' . esc_attr($name) . '" class="selectit">' . esc_html($label) . '</span></label></div>';
                                }
                                if (apply_filters('mvx_feature_product_is_enable', true)) {
                                    echo '<hr><div class="form-group"><label><input type="checkbox" name="_featured" class="mt-0" id="_featured" ' . checked($current_featured, 'yes', false) . ' data-label="' . __('Featured', 'multivendorx') . '" /> <span for="_featured">' . esc_html__('This is a featured product', 'multivendorx') . '</label></label></div>';
                                }
                                ?>
                                <div class="form-group mt-15">
                                    <button type="button"
                                        class="btn btn-default btn-sm catalog-visiblity-btn"><?php esc_html_e('Ok', 'multivendorx'); ?></button>
                                    <a href="javascript:void(0)" class="btn btn-default btn-sm" data-toggle="collapse"
                                        data-target="#product_visiblity"><?php esc_html_e('Cancel', 'multivendorx'); ?></a>
                                </div>
                            </div>
                        </div>
                    </div> -->

                </div>
                <div class="card-content">
                    <div class="card-title">Product short description</div>
                    <div class="form-group-wrapper">
                        <div class="form-group">
                            <?php
                            $settings = array(
                                'textarea_name' => 'product_excerpt',
                                'textarea_rows' => get_option('default_post_edit_rows', 10),
                                'quicktags' => array('buttons' => 'em,strong,link'),
                                'tinymce' => array(
                                    'theme_advanced_buttons1' => 'bold,italic,strikethrough,separator,bullist,numlist,separator,blockquote,separator,justifyleft,justifycenter,justifyright,separator,link,unlink,separator,undo,redo,separator',
                                    'theme_advanced_buttons2' => '',
                                ),
                                'editor_css' => '<style>#wp-product_excerpt-editor-container .wp-editor-area{height:100px; width:100%;}</style>',
                            );
                            if (!apply_filters('mvx_vendor_product_excerpt_richedit', true)) {
                                $settings['tinymce'] = $settings['quicktags'] = $settings['media_buttons'] = false;
                            }
                            wp_editor(htmlspecialchars_decode(isset($_POST['product_excerpt']) ? wc_clean($_POST['product_excerpt']) : $product_object->get_short_description('edit')), 'product_excerpt', $settings);
                            ?>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-title">Product description</div>
                    <div class="form-group-wrapper">
                        <div class="form-group">
                            <?php
                            $settings = array(
                                'textarea_name' => 'product_description',
                                'textarea_rows' => get_option('default_post_edit_rows', 10),
                                'quicktags' => array('buttons' => 'em,strong,link'),
                                'tinymce' => array(
                                    'theme_advanced_buttons1' => 'bold,italic,strikethrough,separator,bullist,numlist,separator,blockquote,separator,justifyleft,justifycenter,justifyright,separator,link,unlink,separator,undo,redo,separator',
                                    'theme_advanced_buttons2' => '',
                                ),
                                'editor_css' => '<style>#wp-product_description-editor-container .wp-editor-area{height:175px; width:100%;}</style>',
                            );
                            if (!apply_filters('mvx_vendor_product_description_richedit', true)) {
                                $settings['tinymce'] = $settings['quicktags'] = $settings['media_buttons'] = false;
                            }
                            wp_editor($product_object->get_description('edit'), 'product_description', $settings);
                            ?>
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="add-product-info-holder">

                        <div class="add-product-info-header row-padding">
                            <div class="select-group">
                                <label for="product-type"><?php esc_html_e('Product Type', 'multivendorx'); ?></label>
                                <select class="form-control inline-select" id="product-type" name="product-type">
                                    <?php foreach (wc_get_product_types() as $value => $label): ?>
                                        <option value="<?php echo esc_attr($value); ?>" <?php echo selected($product_object->get_type(), $value, false); ?>>
                                            <?php echo esc_html($label); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                            <?php
                            $product_type_options = $self->get_product_type_options();
                            $required_types = array();
                            foreach ($product_type_options as $type) {
                                if (isset($type['wrapper_class'])) {
                                    $classes = explode(' ', str_replace('show_if_', '', $type['wrapper_class']));
                                    foreach ($classes as $class) {
                                        $required_types[$class] = true;
                                    }
                                }
                            }
                            ?>
                            <?php if ($self->mvx_is_allowed_product_type(array_keys($required_types))):
                                ?>
                                <div class="pull-right">
                                    <?php foreach ($self->get_product_type_options() as $key => $option): ?>
                                        <?php
                                        if (!empty($post->ID) && metadata_exists('post', $post->ID, '_' . $key)) {
                                            $selected_value = isset($_POST['_' . $key]) && $_POST['_' . $key] == 'on' ? true : (is_callable(array($product_object, "is_$key")) ? $product_object->{"is_$key"}() : 'yes' === get_post_meta($post->ID, '_' . $key, true));
                                        } else {
                                            $selected_value = 'yes' === (isset($_POST['_' . $key]) && $_POST['_' . $key] == 'on' ? 'yes' : (isset($option['default']) ? $option['default'] : 'no'));
                                        }
                                        ?>
                                        <label for="<?php echo esc_attr($option['id']); ?>"
                                            class="<?php echo esc_attr($option['wrapper_class']); ?> tips"
                                            data-tip="<?php echo esc_attr($option['description']); ?>"><input type="checkbox"
                                                name="<?php echo esc_attr($option['id']); ?>"
                                                id="<?php echo esc_attr($option['id']); ?>" <?php echo checked($selected_value, true, false); ?> />
                                            <?php echo esc_html($option['label']); ?></label>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </div>

                        <!-- product Info Tab start -->
                        <div class="product-info-tab-wrapper" role="tabpanel">
                            <!-- Nav tabs start -->
                            <div>
                                <div class="tab-nav-direction-wrapper"></div>
                                <ul class="nav nav-tabs" role="tablist" id="product_data_tabs">
                                    <?php foreach ($get_product_data_tabs as $key => $tab): ?>
                                        <?php if (apply_filters('mvx_frontend_dashboard_product_data_tabs_filter', (!isset($tab['p_type']) || array_key_exists($tab['p_type'], $self->mvx_get_product_types())), $key, $tab)): ?>
                                            <li role="presentation"
                                                class="nav-item <?php echo esc_attr($key); ?>_options <?php echo esc_attr($key); ?>_tab <?php echo esc_attr(isset($tab['class']) ? implode(' ', (array) $tab['class']) : ''); ?>">
                                                <a class="nav-link" href="#<?php echo esc_attr($tab['target']); ?>"
                                                    aria-controls="<?php echo $tab['target']; ?>" role="tab"
                                                    data-toggle="tab"><span><?php echo esc_html($tab['label']); ?></span></a>
                                            </li>
                                        <?php endif; ?>
                                    <?php endforeach; ?>
                                    <?php do_action('mvx_product_write_panel_tabs', $post->ID); ?>
                                </ul>
                            </div>
                            <!-- Nav tabs End -->

                            <!-- Tab content start -->
                            <div class="tab-content">
                                <?php
                                MultiVendorX()->util->get_template('views/html-product-data-general.php', array('self' => $self, 'product_object' => $product_object, 'post' => $post));
                                MultiVendorX()->util->get_template('views/html-product-data-inventory.php', array('self' => $self, 'product_object' => $product_object, 'post' => $post));
                                MultiVendorX()->util->get_template('views/html-product-data-linked-products.php', array('self' => $self, 'product_object' => $product_object, 'post' => $post));
                                MultiVendorX()->util->get_template('views/html-product-data-attributes.php', array('self' => $self, 'product_object' => $product_object, 'post' => $post));
                                MultiVendorX()->util->get_template('views/html-product-data-advanced.php', array('self' => $self, 'product_object' => $product_object, 'post' => $post));
                                ?>
                                <?php do_action('mvx_product_tabs_content', $self, $product_object, $post); ?>
                            </div>
                            <!-- Tab content End -->
                        </div>
                        <!-- product Info Tab End -->
                    </div>
                </div>
            </div>

            <!-- right section start -->
            <div class="card-wrapper width-35">
                <div class="card-content">
                    <div class="card-title">Upload Image</div>
                    <div class="product-gallery-wrapper">
                        <div class="featured-img upload_image">
                            <?php $featured_img = isset($_POST['featured_img']) ? wc_clean($_POST['featured_img']) : ($product_object->get_image_id('edit') ? $product_object->get_image_id('edit') : ''); ?>
                            <a href="#" class="upload_image_button tips <?php echo $featured_img ? 'remove' : ''; ?>"
                                <?php echo current_user_can('upload_files') ? '' : 'data-nocaps="true" '; ?>data-title="<?php esc_attr_e('Product image', 'multivendorx'); ?>"
                                data-button="<?php esc_attr_e('Set product image', 'multivendorx'); ?>"
                                rel="<?php echo esc_attr($post->ID); ?>">
                                <div class="upload-placeholder pos-middle">
                                    <i class="mvx-font ico-image-icon"></i>
                                    <p><?php _e('Click to upload Image', 'multivendorx'); ?></p>
                                </div>
                                <img
                                    src="<?php echo $featured_img ? esc_url(wp_get_attachment_image_src($featured_img, $image_size)[0]) : esc_url(wc_placeholder_img_src()); ?>" />
                                <input type="hidden" name="featured_img" class="upload_image_id"
                                    value="<?php echo esc_attr($featured_img); ?>" />
                            </a>
                        </div>

                        <div class="file-uploader">
                            <i class="upload-icon adminlib-cloud-upload"></i>
                            <input class="mvx_new_dashboard_site_logo basic-input" type="hidden" name="file-input">
                            <span class="title">Drag and drop your file here</span>
                            <span>Or</span>
                            <button class="admin-btn btn-purple admin-btn" type="button">Upload Image</button>
                        </div>

                        <div id="product_images_container" class="custom-panel">
                            <h3><?php _e('Product gallery', 'multivendorx'); ?></h3>
                            <ul class="product_images">
                                <?php
                                if (metadata_exists('post', $post->ID, '_product_image_gallery')) {
                                    $product_image_gallery = get_post_meta($post->ID, '_product_image_gallery', true);
                                } else {
                                    // Backwards compatibility.
                                    $attachment_ids = get_posts('post_parent=' . $post->ID . '&numberposts=-1&post_type=attachment&orderby=menu_order&order=ASC&post_mime_type=image&fields=ids&meta_key=_woocommerce_exclude_image&meta_value=0');
                                    $attachment_ids = array_diff($attachment_ids, array(get_post_thumbnail_id()));
                                    $product_image_gallery = isset($_POST['product_image_gallery']) ? wc_clean($_POST['product_image_gallery']) : implode(',', $attachment_ids);
                                }

                                $attachments = array_filter(explode(',', $product_image_gallery));
                                $update_meta = false;
                                $updated_gallery_ids = array();

                                if (!empty($attachments)) {
                                    foreach ($attachments as $attachment_id) {
                                        $attachment = wp_get_attachment_image($attachment_id, 'thumbnail');

                                        // if attachment is empty skip
                                        if (empty($attachment)) {
                                            $update_meta = true;
                                            continue;
                                        }

                                        echo '<li class="image" data-attachment_id="' . esc_attr($attachment_id) . '">
                                                ' . $attachment . '
                                                <ul class="actions">
                                                    <li><a href="#" class="delete tips" data-tip="' . esc_attr__('Delete image', 'multivendorx') . '">' . __('Delete', 'multivendorx') . '</a></li>
                                                </ul>
                                            </li>';

                                        // rebuild ids to be saved
                                        $updated_gallery_ids[] = $attachment_id;
                                    }

                                    // need to update product meta to set new gallery ids
                                    if ($update_meta) {
                                        update_post_meta($post->ID, '_product_image_gallery', implode(',', $updated_gallery_ids));
                                    }
                                }
                                ?>
                            </ul>
                            <input type="hidden" id="product_image_gallery" name="product_image_gallery"
                                value="<?php echo esc_attr($product_image_gallery); ?>" />
                            <p class="add_product_images">
                                <a href="#" <?php echo current_user_can('upload_files') ? '' : 'data-nocaps="true" '; ?>data-choose="<?php esc_attr_e('Add images to product gallery', 'multivendorx'); ?>"
                                    data-update="<?php esc_attr_e('Add to gallery', 'multivendorx'); ?>"
                                    data-delete="<?php esc_attr_e('Delete image', 'multivendorx'); ?>"
                                    data-text="<?php esc_attr_e('Delete', 'multivendorx'); ?>"><?php _e('Add product gallery images', 'multivendorx'); ?></a>
                            </p>
                        </div>



                        <div id="product_images_container" class="custom-panel">
                                <h3><?php _e('Product gallery', 'multivendorx'); ?></h3>
                                <ul class="product_images">
                                    <?php
                                    if (metadata_exists('post', $post->ID, '_product_image_gallery')) {
                                        $product_image_gallery = get_post_meta($post->ID, '_product_image_gallery', true);
                                    } else {
                                        $attachment_ids = get_posts(array(
                                            'post_parent' => $post->ID,
                                            'numberposts' => -1,
                                            'post_type' => 'attachment',
                                            'orderby' => 'menu_order',
                                            'order' => 'ASC',
                                            'post_mime_type' => 'image',
                                            'fields' => 'ids',
                                            'meta_key' => '_woocommerce_exclude_image',
                                            'meta_value' => 0
                                        ));
                                        $attachment_ids = array_diff($attachment_ids, array(get_post_thumbnail_id()));
                                        $product_image_gallery = isset($_POST['product_image_gallery']) ? wc_clean($_POST['product_image_gallery']) : implode(',', $attachment_ids);
                                    }

                                    $attachments = array_filter(explode(',', $product_image_gallery));
                                    $update_meta = false;
                                    $updated_gallery_ids = array();

                                    if (!empty($attachments)) {
                                        foreach ($attachments as $attachment_id) {
                                            $attachment = wp_get_attachment_image($attachment_id, 'thumbnail');

                                            if (empty($attachment)) {
                                                $update_meta = true;
                                                continue;
                                            }

                                            echo '<li class="image" data-attachment_id="' . esc_attr($attachment_id) . '">
                                                    ' . $attachment . '
                                                    <ul class="actions">
                                                        <li><a href="#" class="delete tips" data-tip="' . esc_attr__('Delete image', 'multivendorx') . '">' . __('Delete', 'multivendorx') . '</a></li>
                                                    </ul>
                                                </li>';

                                            $updated_gallery_ids[] = $attachment_id;
                                        }

                                        // Update gallery meta if needed
                                        if ($update_meta) {
                                            update_post_meta($post->ID, '_product_image_gallery', implode(',', $updated_gallery_ids));
                                        }
                                    }
                                    ?>
                                </ul>
                                <input type="hidden" id="product_image_gallery" name="product_image_gallery"
                                    value="<?php echo esc_attr($product_image_gallery); ?>"/>
                                <p class="add_product_images">
                                    <a href="#" 
                                    <?php echo current_user_can('upload_files') ? '' : 'data-nocaps="true" '; ?>
                                    data-choose="<?php esc_attr_e('Add images to product gallery', 'multivendorx'); ?>"
                                    data-update="<?php esc_attr_e('Add to gallery', 'multivendorx'); ?>"
                                    data-delete="<?php esc_attr_e('Delete image', 'multivendorx'); ?>"
                                    data-text="<?php esc_attr_e('Delete', 'multivendorx'); ?>"><?php _e('Add product gallery images', 'multivendorx'); ?></a>
                                </p>
                            </div>

                        <?php do_action('mvx_product_manager_right_panel_after', $post->ID); ?>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-title">Product categories</div>
                        <div class="category">
                        <?php
                        $product_categories = $self->mvx_get_product_terms_HTML('product_cat', $post->ID, apply_filters('mvx_vendor_can_add_product_category', false, get_current_user_id())); ?>
                        <?php if ($product_categories): ?>
                                <?php
                                echo $product_categories;
                                ?>
                        <?php endif; ?>
                        </div>
                </div>
                <div class="card-content">
                    <div class="card-title">Product tags</div>
                    <div class="form-group-wrapper">
                        <?php
                            $product_tags = $self->mvx_get_product_terms_HTML(
                                'product_tag',
                                $post->ID,
                                apply_filters('mvx_vendor_can_add_product_tag', true, get_current_user_id()),
                                false
                            );
                            ?>

                            <?php if ($product_tags && !empty($product_fileds) && in_array('product_tag', $product_fileds)): ?>
                            <div class="form-card">
                                <div class="form-card-header">
                                <label for="product_tags" class="form-card-label">
                                    <?php esc_html_e('Product Tags', 'multivendorx'); ?>
                                </label>
                                <span class="form-card-desc">
                                    <?php esc_html_e('Add or select tags to help customers find your product.', 'multivendorx'); ?>
                                </span>
                                </div>
                                <div class="form-card-body">
                                <div class="form-group product-tag-field">
                                    <?php echo $product_tags; ?>
                                </div>
                                </div>
                            </div>
                            <?php endif; ?>

                    </div>
                </div>
                <div class="card-content">
                    <div class="card-title">Brands</div>
                    <div class="form-group-wrapper">
                        <?php
                        $product_brands = $self->mvx_get_product_terms_HTML('product_brand', $post->ID, apply_filters('mvx_vendor_can_add_product_category', false, get_current_user_id())); ?>
                        <?php if ($product_brands): ?>
                            <div class="panel panel-default pannel-outer-heading">
                                <div class="panel-body panel-content-padding form-group-wrapper">
                                    <?php
                                    echo $product_brands;
                                    ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div> <!-- right section end -->

            <!-- <div class="mvx-action-container">
                <?php
                $primary_action = __('Submit', 'multivendorx');    //default value
                if (current_user_can('publish_products')) {
                    if (!empty($product_object->get_id()) && get_post_status($product_object->get_id()) === 'publish') {
                        $primary_action = __('Update', 'multivendorx');
                    } else {
                        $primary_action = __('Publish', 'multivendorx');
                    }
                }
                ?>
                <input type="submit" class="btn btn-default" name="submit-data"
                    value="<?php echo esc_attr($primary_action); ?>" id="mvx_frontend_dashboard_product_submit" />
                <input type="submit" class="btn btn-default" name="draft-data"
                    value="<?php esc_attr_e('Draft', 'multivendorx'); ?>" id="mvx_frontend_dashboard_product_draft" />
                <input type="hidden" name="status" value="<?php echo esc_attr(get_post_status($post)); ?>">
                <?php wp_nonce_field('mvx-product', 'mvx_product_nonce'); ?>
            </div> -->
        
    </div>
    </form>
</div>
</div>

<style>
    .add-product-info-header{
        display: flex;
    justify-content: end;
    flex-direction: column;
    align-items: end;
    gap: 0.813rem;
    }
    .add-product-info-header .select-group{
        width: 30%;
    }
    .product-info-tab-wrapper .nav.nav-tabs li{
            padding-bottom: 0.5rem;
    border-bottom: 0.125rem solid #fff;
    font-weight: 600;
    font-size: 1rem;
    }
    .product-info-tab-wrapper .nav.nav-tabs li.active{
    border-bottom: 0.125rem solid #5007aa;
    color: #5007aa;

    }

    .product-info-tab-wrapper ul{
        display: flex;
        margin: 0;
        list-style-type: none;
        gap: 0.813rem;
        font-size: 1rem;
        margin: 1rem 0;
    }


    .category ul{
        margin: 0;
        list-style-type: none;
    }
    .category ul li{
        margin-bottom: 0.45rem;
    }
    .category ul li input{
        border: 1px solid #8c8f94;
    border-radius: 4px;
    background: #fff;
    color: #50575e;
    clear: none;
    cursor: pointer;
    display: inline-block;
    line-height: 0;
    height: 1rem;
    margin: -.25rem .25rem 0 0;
    outline: 0;
    padding: 0 !important;
    text-align: center;
    vertical-align: middle;
    width: 1rem;
    min-width: 1rem;
    -webkit-appearance: none;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);
    transition: .05s border-color ease-in-out;
    }
    .category ul li label{
        font-size: 1rem;
    }
    .category ul li ul{
        margin-left: 1rem;
        margin-top: 0.45rem;
    }
    .category ul li ul li{
        margin-bottom: 0.45rem;
    }

    /* tag select style */
    
.tag-panel {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  background: #fff;
  padding: 16px;
  margin-bottom: 20px;
}

.tag-panel-body {
  padding: 8px 0;
}

.form-group{
    position: relative;
}
.form-group ul{
    margin: 0;
    padding: 0;
    list-style-type: none;
}
.form-group select{
    position: absolute;
    bottom: -3rem;
}
.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  display: block;
}


.select2-container--default .select2-selection--multiple {
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 42px;
  display: flex;
  flex-wrap: wrap;
  padding: 4px 6px;
  cursor: text;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.select2-container--default.select2-container--focus .select2-selection--multiple {
  border-color: #5007aa;
  box-shadow: 0 0 0 2px rgba(80,7,170,0.2);
}

/* Tag chip */
.select2-container--default .select2-selection--multiple .select2-selection__choice {
  background-color: #5007aa;
  border-radius: 16px;
  padding: 4px 10px;
  color: #fff;
  font-size: 13px;
  margin: 3px;
  display: flex;
  align-items: center;
  border: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Remove button (×) */
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove {
  color: #fff;
  margin-right: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove:hover {
  color: #ffeb3b;
}

/* Search input inside */
.select2-container--default .select2-selection--multiple .select2-search__field {
  border: none !important;
  outline: none !important;
  margin: 4px;
  font-size: 14px;
  min-width: 80px;
}

/* Dropdown results */
.select2-container--default .select2-results__option {
  padding: 10px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.select2-container--default .select2-results__option--highlighted[aria-selected] {
  background-color: #5007aa;
  color: #fff;
}
/* end tag style */






/* Card wrapper */
.form-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

/* Header with label + description */
.form-card-header {
  margin-bottom: 12px;
}

.form-card-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
}

.form-card-desc {
  font-size: 12px;
  color: #777;
}

/* Body (where select2 renders) */
.form-card-body .form-group {
  margin: 0;
}

/* Enhance select2 styling (chips look) */
.select2-container--default .select2-selection--multiple {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 6px;
  min-height: 44px;
  display: flex;
  flex-wrap: wrap;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.select2-container--default.select2-container--focus .select2-selection--multiple {
  border-color: #5007aa;
  box-shadow: 0 0 0 2px rgba(80,7,170,0.15);
}

/* Tag chip */
.select2-container--default .select2-selection--multiple .select2-selection__choice {
  background-color: #5007aa;
  color: #fff;
  border-radius: 16px;
  padding: 4px 10px;
  font-size: 13px;
  margin: 3px;
  border: none;
}

/* Tag remove (×) */
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove {
  color: #fff;
  margin-right: 6px;
  cursor: pointer;
}
.select2-container--default .select2-selection--multiple .select2-selection__choice__remove:hover {
  color: #ffeb3b;
}

</style>