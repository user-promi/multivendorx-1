<?php
/**
 * Template for displaying the Q&A tab on the store page.
 *
 * Override this template by copying it to yourtheme/dc-woocommerce-multi-vendor/store/single-product-qna-tab.php
 *
 * @package     MultiVendorX/Templates
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
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

$current_url    = get_permalink( $product_id );
$myaccount_url  = wc_get_page_permalink( 'myaccount' );
$login_url      = add_query_arg( 'redirect_to', $current_url, $myaccount_url );
?>

<div id="product-qna" data-product="<?php echo esc_attr( $product_id ); ?>">

	<div class="header">
		<h3><?php echo esc_html__( 'Questions about this product', 'multivendorx' ); ?></h3>

		<div class="qna-search">
			<p class="form-row form-row-wide">
				<input
					type="text"
					id="qna-search"
					class="input-text"
					placeholder="<?php echo esc_attr__( 'Search questions...', 'multivendorx' ); ?>"
				>
			</p>

			<button id="qna-direct-submit" class="button alt" style="display:none;">
				<?php echo esc_html__( 'Ask this question', 'multivendorx' ); ?>
			</button>
		</div>
	</div>

	<!-- Questions List -->
	<ul id="qna-list">
		<?php if ( $answered_questions ) : ?>
			<?php foreach ( $answered_questions as $row ) : ?>
				<li data-qna="<?php echo esc_attr( $row->id ); ?>" class="qna-item">

					<p class="qna-question">
						<strong><?php echo esc_html__( 'Q:', 'multivendorx' ); ?></strong>
						<?php echo esc_html( $row->question_text ); ?>
					</p>

					<small class="qna-meta">
						<?php
						printf(
							/* translators: 1: author name, 2: time ago */
							esc_html__( 'By %1$s, %2$s ago', 'multivendorx' ),
							esc_html( get_the_author_meta( 'display_name', $row->question_by ) ),
							esc_html(
								human_time_diff(
									strtotime( $row->question_date ),
									current_time( 'timestamp' )
								)
							)
						);
						?>
					</small>

					<p class="qna-answer">
						<strong><?php echo esc_html__( 'A:', 'multivendorx' ); ?></strong>
						<?php echo esc_html( $row->answer_text ); ?>
					</p>

					<div class="qna-votes">
						<span
							class="qna-vote dashicons dashicons-thumbs-up admin-badge green"
							data-type="up"
							aria-label="<?php echo esc_attr__( 'Upvote', 'multivendorx' ); ?>"
						></span>

						<span
							class="qna-vote dashicons dashicons-thumbs-down admin-badge red"
							data-type="down"
							aria-label="<?php echo esc_attr__( 'Downvote', 'multivendorx' ); ?>"
						></span>

						<p><?php echo intval( $row->total_votes ); ?></p>
					</div>

				</li>
			<?php endforeach; ?>
		<?php endif; ?>
	</ul>

	<div id="qna-success-message" class="qna-notice" style="display:none;">
		<?php echo esc_html__(
			'Your question has been submitted successfully. It will appear once answered.',
			'multivendorx'
		); ?>
	</div>

	<!-- Ask Question -->
	<?php if ( is_user_logged_in() ) : ?>

		<div id="qna-form" style="display:none; margin-top:1.25rem;">
			<h4><?php echo esc_html__( 'Ask a Question', 'multivendorx' ); ?></h4>

			<textarea
				id="qna-question"
				placeholder="<?php echo esc_attr__( 'Type your question...', 'multivendorx' ); ?>"
			></textarea><br>

			<button type="submit" id="qna-submit">
				<?php echo esc_html__( 'Submit', 'multivendorx' ); ?>
			</button>
		</div>

		<div class="qna-cta" style="display:none;">
			<button type="button" id="qna-show-form">
				<?php echo esc_html__( 'Post your Question', 'multivendorx' ); ?>
			</button>
		</div>

	<?php else : ?>

		<div class="login-wrapper">
			<div class="description">
				<?php echo esc_html__( 'Can’t find your answer?', 'multivendorx' ); ?>
			</div>

			<a class="button" href="<?php echo esc_url( $login_url ); ?>">
				<?php echo esc_html__( 'Log in', 'multivendorx' ); ?>
			</a>

			<span>
				<?php echo esc_html__( 'to share your question with us.', 'multivendorx' ); ?>
			</span>
		</div>

	<?php endif; ?>

</div>
