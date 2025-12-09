<?php
/**
 * MultiVendorX Frontend class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\QuestionsAnswers;

use MultiVendorX\FrontendScripts;
use MultiVendorX\Utill;

/**
 * MultiVendorX Questions & Answers Frontend class
 *
 * @class       Frontend class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Frontend {
    /**
     * Frontend class constructor function.
     */
    public function __construct() {
        add_filter( 'woocommerce_product_tabs', array( $this, 'product_questions_answers_tab' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'load_scripts' ) );
    }

    /**
     * Load scripts
     *
     * @return void
     */
    public function load_scripts() {
        FrontendScripts::load_scripts();
        FrontendScripts::enqueue_script( 'multivendorx-qna-frontend-script' );
        FrontendScripts::localize_scripts( 'multivendorx-qna-frontend-script' );
    }

    /**
     * Add Question and answer tab
     *
     * @param array $tabs Tabs.
     *
     * @return array
     */
    public function product_questions_answers_tab( $tabs ) {
        global $product;

        $qna_count = 0;

        if ( isset( $product ) && $product instanceof \WC_Product ) {
            $product_id = $product->get_id();

            $qna_count = Util::get_question_information(
                array(
					'product_ids'         => array( $product_id ),
					'question_visibility' => 'public',
					'has_answer'          => true,
					'count'               => true,
                )
            );

            $qna_count = intval( $qna_count );
        }

        $tabs['product_qna'] = array(
            /* translators: %d: Number of answered questions for this product */
            'title'    => sprintf( __( 'Questions & Answers (%d)', 'multivendorx' ), $qna_count ),
            'priority' => 50,
            'callback' => array( $this, 'multivendorx_product_qna_tab_content' ),
        );

        return $tabs;
    }

    /**
     * Add Question and answer tab html
     *
     * @return void
     */
    public function multivendorx_product_qna_tab_content() {
        global $product;
        MultiVendorX()->util->get_template( 'store/store-single-product-qna-tab.php', array( 'product_id' => $product->get_id() ) );
    }
}
