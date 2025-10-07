<?php
/**
 * MultiVendorX Store Review Template - Dynamic Criteria Based with Existing Ratings
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

// Get dynamic rating criteria from settings
$rating_criteria = get_option('mvx_rating_criteria', [
    'quality' => __('Product Quality', 'multivendorx'),
    'shipping' => __('Shipping Speed', 'multivendorx'),
    'design' => __('Design & Presentation', 'multivendorx'),
    'communication' => __('Communication', 'multivendorx')
]);

$ratings = MultiVendorX()->setting->get_setting('ratings_parameters', array());

// Get existing store ratings
$store_ratings = MultiVendorX\StoreReview\Ajax::get_store_ratings($store_id);
?>

<div class="woocommerce">
    <div id="mvx_vendor_reviews">

        <!-- Existing Store Ratings Summary -->
        <div class="mvx-store-ratings-summary">
            <h3><?php esc_html_e('Store Ratings Summary', 'multivendorx'); ?></h3>
            <div class="overall-rating-summary">
                <div class="overall-rating">
                    <strong><?php esc_html_e('Overall Rating:', 'multivendorx'); ?></strong>
                    <span class="rating-value"><?php echo esc_html($store_ratings['overall']); ?>/5</span>
                    <span class="rating-count">(<?php echo esc_html($store_ratings['count']); ?> reviews)</span>
                </div>
            </div>
            
            <div class="criteria-ratings-summary">
                <?php foreach ($rating_criteria as $key => $label) : ?>
                    <?php if (isset($store_ratings[$key]) && $store_ratings[$key] > 0) : ?>
                        <div class="criteria-rating-summary">
                            <span class="criteria-label"><?php echo esc_html($label); ?>:</span>
                            <span class="criteria-value"><?php echo esc_html($store_ratings[$key]); ?>/5</span>
                            <div class="rating-bar">
                                <div class="rating-fill" style="width: <?php echo ($store_ratings[$key] / 5) * 100; ?>%"></div>
                            </div>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Review Form -->
        <div id="review_form_wrapper">
            <?php if (!$is_logged_in) : ?>
                <div class="woocommerce-info">
                    <?php esc_html_e('Please login to submit a review.', 'multivendorx'); ?>
                </div>
            <?php elseif ($has_reviewed == 0) : ?>
                <div id="respond" class="comment-respond">
                    <h3 id="reply-title" class="comment-reply-title"><?php esc_html_e('Add Your Review', 'multivendorx'); ?></h3>
                    <form method="post" id="commentform" class="comment-form" novalidate>
                        
                        <!-- Dynamic Criteria Based Ratings -->
                        <div class="mvx-rating-criteria">
                            <h4><?php esc_html_e('Rate this store:', 'multivendorx'); ?></h4>
                            <?php foreach ($rating_criteria as $key => $label) : ?>
                                <div class="criteria-rating-wrapper">
                                    <p class="comment-form-rating criteria-rating">
                                        <label for="rating_<?php echo esc_attr($key); ?>">
                                            <?php echo esc_html($label); ?>
                                            <?php if (isset($store_ratings[$key]) && $store_ratings[$key] > 0) : ?>
                                                <small class="existing-rating">
                                                    (Current: <?php echo esc_html($store_ratings[$key]); ?>/5)
                                                </small>
                                            <?php endif; ?>
                                        </label>
                                        <select name="rating_<?php echo esc_attr($key); ?>" id="rating_<?php echo esc_attr($key); ?>" class="criteria-select">
                                            <option value=""><?php esc_html_e('Rate...', 'multivendorx'); ?></option>
                                            <option value="5"><?php esc_html_e('5 - Excellent', 'multivendorx'); ?></option>
                                            <option value="4"><?php esc_html_e('4 - Good', 'multivendorx'); ?></option>
                                            <option value="3"><?php esc_html_e('3 - Average', 'multivendorx'); ?></option>
                                            <option value="2"><?php esc_html_e('2 - Poor', 'multivendorx'); ?></option>
                                            <option value="1"><?php esc_html_e('1 - Very Poor', 'multivendorx'); ?></option>
                                        </select>
                                    </p>
                                </div>
                            <?php endforeach; ?>
                            
                            <!-- Overall Rating Display (Auto-calculated) -->
                            <div class="overall-rating-display">
                                <p>
                                    <strong><?php esc_html_e('Your Overall Rating:', 'multivendorx'); ?></strong>
                                    <span id="overall_rating_value">0</span>/5
                                </p>
                                <p class="existing-overall-rating">
                                    <small>
                                        <?php esc_html_e('Store Overall Rating:', 'multivendorx'); ?>
                                        <strong><?php echo esc_html($store_ratings['overall']); ?>/5</strong>
                                    </small>
                                </p>
                            </div>
                        </div>
                        
                        <p class="comment-form-comment">
                            <label for="comment"><?php esc_html_e('Your Review', 'multivendorx'); ?></label>
                            <textarea id="comment" name="comment" cols="45" rows="5" aria-required="true" placeholder="<?php esc_attr_e('Share your experience with this store...', 'multivendorx'); ?>"></textarea>
                        </p>
                        <input type="hidden" id="store_for_rating" value="<?php echo esc_attr($store_id); ?>">
                        <input type="hidden" name="overall_rating" id="overall_rating" value="0">
                        <p class="form-submit">
                            <input name="review_submit" type="button" id="review_submit" value="<?php esc_attr_e('Submit Review', 'multivendorx'); ?>">
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

<style>
.mvx-store-ratings-summary {
    background: #f8f8f8;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    border: 1px solid #e0e0e0;
}

.overall-rating-summary {
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ddd;
}

.overall-rating .rating-value {
    font-size: 24px;
    font-weight: bold;
    color: #ffa500;
}

.overall-rating .rating-count {
    color: #666;
    font-size: 14px;
}

.criteria-ratings-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.criteria-rating-summary {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.criteria-label {
    font-weight: 500;
    color: #333;
}

.criteria-value {
    color: #ffa500;
    font-weight: bold;
}

.rating-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.rating-fill {
    height: 100%;
    background: #ffa500;
    transition: width 0.3s ease;
}

.criteria-rating-wrapper {
    margin-bottom: 15px;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 5px;
}

.existing-rating {
    color: #666;
    font-weight: normal;
    margin-left: 5px;
}

.overall-rating-display {
    background: #fff;
    padding: 15px;
    border-radius: 5px;
    border: 2px solid #e0e0e0;
    margin-top: 20px;
}

.overall-rating-display #overall_rating_value {
    font-size: 20px;
    font-weight: bold;
    color: #ffa500;
}

.existing-overall-rating {
    margin-top: 5px;
    color: #666;
}
</style>