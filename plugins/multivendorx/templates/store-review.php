<?php
/**
 * MultiVendorX Store Review Template
 *
 * @package MultiVendorX/Templates
 * @version 3.11
 */

if (!defined('ABSPATH')) exit;

$store_id = $args['store_id'];
$current_user = wp_get_current_user();
$is_logged_in = is_user_logged_in();

// Check if user already reviewed this store
$has_reviewed = 0;
if ($is_logged_in) {
    $has_reviewed = get_comments([
        'user_id'      => $current_user->ID,
        'meta_key'     => 'store_rating_id',
        'meta_value'   => $store_id,
        'comment_type' => 'multivendorx_review',
        'count'        => true
    ]);
}
?>

<div class="woocommerce">
    <div id="mvx_vendor_reviews">

        <!-- Review Form -->
        <div id="review_form_wrapper">
            <?php if (!$is_logged_in) : ?>
                <div class="woocommerce-info">
                    <?php esc_html_e('Please login to submit a review.', 'multivendorx'); ?>
                </div>
            <?php elseif ($has_reviewed == 0) : ?>
                <div id="respond" class="comment-respond">
                    <h3 id="reply-title" class="comment-reply-title"><?php esc_html_e('Add a Review', 'multivendorx'); ?></h3>
                    <form method="post" id="commentform" class="comment-form" novalidate>
                        <p class="comment-form-rating">
                            <label for="rating"><?php esc_html_e('Your Rating', 'multivendorx'); ?></label>
                            <select name="rating" id="rating">
                                <option value=""><?php esc_html_e('Rate...', 'multivendorx'); ?></option>
                                <option value="5"><?php esc_html_e('Perfect', 'multivendorx'); ?></option>
                                <option value="4"><?php esc_html_e('Good', 'multivendorx'); ?></option>
                                <option value="3"><?php esc_html_e('Average', 'multivendorx'); ?></option>
                                <option value="2"><?php esc_html_e('Not that bad', 'multivendorx'); ?></option>
                                <option value="1"><?php esc_html_e('Very Poor', 'multivendorx'); ?></option>
                            </select>
                        </p>
                        <p class="comment-form-comment">
                            <label for="comment"><?php esc_html_e('Your Review', 'multivendorx'); ?></label>
                            <textarea id="comment" name="comment" cols="45" rows="5" aria-required="true"></textarea>
                        </p>
                        <input type="hidden" id="store_for_rating" value="<?php echo esc_attr($store_id); ?>">
                        <p class="form-submit">
                            <input name="review_submit" type="button" id="review_submit" value="<?php esc_attr_e('Submit', 'multivendorx'); ?>">
                        </p>
                    </form>
                </div>
            <?php else : ?>
                <div class="woocommerce-info">
                    <?php esc_html_e('You have already reviewed this store.', 'multivendorx'); ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Hidden input always present for AJAX -->
        <input type="hidden" id="store_for_rating" value="<?php echo esc_attr($store_id); ?>">

        <!-- Review List -->
        <div id="mvx_vendor_reviews_list"></div>
        <div id="review_pagination"></div>

    </div>
</div>