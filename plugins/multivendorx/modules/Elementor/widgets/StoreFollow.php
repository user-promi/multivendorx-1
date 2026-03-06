<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Button;
use MultiVendorX\Elementor\StoreHelper;

class Store_Follow_Button extends Widget_Button {

	use StoreHelper;

	public function get_name() {
		return 'multivendorx_store_follow';
	}

	public function get_title() {
		return __( 'Store Follow Button', 'multivendorx' );
	}

	public function get_icon() {
		return 'eicon-person';
	}

	public function get_categories() {
		return [ 'multivendorx' ];
	}

	protected function register_controls() {
		parent::register_controls();
    
        $this->update_control(
            'text',
            [
                'dynamic'   => [
                    'default' => \Elementor\Plugin::instance()
											->dynamic_tags
											->tag_data_to_tag_text( null, 'multivendorx-store-follow-tag' ),
                    'active'  => true,
                ],
                'selectors' => [
                    '{{WRAPPER}} > .elementor-widget-container > .elementor-button-wrapper > .multivendorx-store-follow-btn' => 'width: auto; margin: 0;',
                ]
            ]
        );
	}

    protected function render() {
        $store = $this->get_store_data();

        if ( ! $store ) {
            return;
        }

        $store_id = ! empty( $store['storeId'] ) ? $store['storeId'] : '';

        $current_user_id = get_current_user_id();

        /**
         * Follow status snapshot (initial render only)
         */
        $customer_follow_store = get_user_meta(
            $current_user_id,
            'multivendorx_following_stores',
            true
        ) ?? array();

        $store_lists = ! empty( $customer_follow_store )
            ? wp_list_pluck( $customer_follow_store, 'user_id' )
            : array();

        $follow_status = in_array( $store_id, $store_lists )
            ? __( 'Unfollow', 'multivendorx' )
            : __( 'Follow', 'multivendorx' );

        /**
         * Follower count
         */
        $follower_count = ! empty( $store['followerCount'] )
            ? intval( $store['followerCount'] )
            : 0;

        /**
         * Elementor button attributes
         */
        $this->add_render_attribute( 'button', 'class', 'follow-btn multivendorx-store-follow-btn' );

        $this->add_render_attribute( 'button', 'data-store-id', $store_id );
        $this->add_render_attribute( 'button', 'data-user-id', $current_user_id );
        $this->add_render_attribute( 'button', 'data-status', $follow_status );

        ?>

        <div class="multivendorx-follow-store-wrapper"
            data-store-id="<?php echo esc_attr( $store_id ); ?>">

            <?php parent::render(); ?>

            <p class="multivendorx-follow-count"
            id="followers-count-<?php echo esc_attr( $store_id ); ?>">

                <?php
                echo esc_html(
                    sprintf(
                        _n( '%d Follower', '%d Followers', $follower_count, 'multivendorx' ),
                        $follower_count
                    )
                );
                ?>

            </p>

        </div>

        <?php
    }
}