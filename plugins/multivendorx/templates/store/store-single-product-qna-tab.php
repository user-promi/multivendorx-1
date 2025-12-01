<?php
/**
 * Template for displaying the Q&A tab on single product pages.
 *
 * @package MultiVendorX
 */

use MultiVendorX\QuestionsAnswers\Util;

$product_id = $args['product_id'];
$questions  = Util::get_questions( $product_id );

// Filter only questions with answers.
$answered_questions = array_filter(
    $questions,
    function ( $q ) {
		return ! empty( $q->answer_text );
	}
);
$current_url        = get_permalink( $product_id );
// Get My Account page URL with redirect parameter.
$myaccount_url = wc_get_page_permalink( 'myaccount' );
$login_url     = add_query_arg( 'redirect_to', $current_url, $myaccount_url );
?>

<div id="product-qna" data-product="<?php echo esc_attr( $product_id ); ?>">

    <div class="header">
        <h3>Questions about this product</h3>
        <div class="qna-search">
            <input type="text" id="qna-search" placeholder="Search questions...">
            <button id="qna-direct-submit" style="display:none;">Ask this question</button>
        </div>
    </div>

    <!-- Questions List -->
    <ul id="qna-list">
        <?php if ( $answered_questions ) : ?>
            <?php foreach ( $answered_questions as $row ) : ?>
                <li data-qna="<?php echo esc_attr( $row->id ); ?>" class="qna-item">
                    <p class="qna-question"><strong>Q:</strong> <?php echo esc_html( $row->question_text ); ?></p>
                    <small class="qna-meta">
                        By <?php echo esc_html( get_the_author_meta( 'display_name', $row->question_by ) ); ?>,
                        <?php echo esc_html( human_time_diff( strtotime( $row->question_date ), current_time() ) ) . ' ago'; ?>
                    </small>

                    <p class="qna-answer"><strong>A:</strong> <?php echo esc_html( $row->answer_text ); ?></p>

                    <!-- Voting buttons -->
                    <div class="qna-votes">
                        <span class="qna-vote adminlib-thumbs-ok admin-badge green" data-type="up"></span>
                        <span class="qna-vote adminlib-thumbs-ok admin-badge red" data-type="down"></span>
                        <p><?php echo intval( $row->total_votes ); ?></p>
                    </div>
                </li>
            <?php endforeach; ?>

        <?php endif; ?>
    </ul>

    <!-- Ask Question -->
    <?php if ( is_user_logged_in() ) : ?>
        <div id="qna-form" style="display:none; margin-top:1.25rem;">
            <h4>Ask a Question</h4>
            <textarea id="qna-question" placeholder="Type your question..."></textarea><br>
            <button type="submit" id="qna-submit">Submit</button>
        </div>
        <div class="qna-cta" style="display:none;">
            <button type="button" id="qna-show-form">Post your Question</button>
        </div>
    <?php else : ?>
        <div class="login-wrapper">
            <div class="description">
                Can’t find your answer?
            </div>
            <a class="button" href="<?php echo esc_url( $login_url ); ?>">
                Log in
            </a>
            <span>to share your question with us.</span>
        </div>
    <?php endif; ?>

</div>