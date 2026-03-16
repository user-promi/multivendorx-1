<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Icon_List;
use Elementor\Controls_Manager;
use Elementor\Icons_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Info extends Widget_Icon_List {

    use StoreHelper;

    public function get_name() {
        return 'multivendorx_store_info';
    }

    public function get_title() {
        return __( 'Store Info', 'multivendorx' );
    }

    public function get_icon() {
        return 'eicon-bullet-list';
    }

    public function get_categories() {
        return array( 'multivendorx' );
    }

    public function get_keywords() {
        return array( 'multivendorx', 'store', 'info', 'address', 'location', 'phone', 'email' );
    }

    protected function register_controls() {
        // Register parent controls first
        parent::register_controls();

        // Hide the icon_list control
        $this->update_control(
            'icon_list',
            array(
                'type'    => Controls_Manager::HIDDEN,
                'default' => array(),
            )
        );

        // Update section label
        $this->update_control(
            'section_icon',
            array(
                'label' => __( 'Store Info Details', 'multivendorx' ),
            )
        );

        // Start new section for store info visibility
        $this->start_controls_section(
            'store_info_settings',
            array(
                'label' => __( 'Store Info Visibility', 'multivendorx' ),
                'tab'   => Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'show_address',
            array(
                'label'        => __( 'Show Address', 'multivendorx' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => __( 'Show', 'multivendorx' ),
                'label_off'    => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default'      => 'yes',
            )
        );

        $this->add_control(
            'show_email',
            array(
                'label'        => __( 'Show Email', 'multivendorx' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => __( 'Show', 'multivendorx' ),
                'label_off'    => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default'      => 'yes',
            )
        );

        $this->add_control(
            'show_phone',
            array(
                'label'        => __( 'Show Phone', 'multivendorx' ),
                'type'         => Controls_Manager::SWITCHER,
                'label_on'     => __( 'Show', 'multivendorx' ),
                'label_off'    => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default'      => 'yes',
            )
        );

        $this->end_controls_section();

        // Add icon style controls
        $this->start_controls_section(
            'section_icon_style',
            array(
                'label' => __( 'Icon', 'multivendorx' ),
                'tab'   => Controls_Manager::TAB_STYLE,
            )
        );

        $this->add_control(
            'icon_color',
            array(
                'label'     => __( 'Color', 'multivendorx' ),
                'type'      => Controls_Manager::COLOR,
                'default'   => '',
                'selectors' => array(
                    '{{WRAPPER}} .elementor-icon-list-icon i' => 'color: {{VALUE}};',
                    '{{WRAPPER}} .elementor-icon-list-icon svg' => 'fill: {{VALUE}};',
                ),
            )
        );

        $this->add_responsive_control(
            'icon_size',
            array(
                'label'     => __( 'Size', 'multivendorx' ),
                'type'      => Controls_Manager::SLIDER,
                'default'   => array(
                    'size' => 14,
                ),
                'range'     => array(
                    'px' => array(
                        'min' => 6,
                    ),
                ),
                'selectors' => array(
                    '{{WRAPPER}} .elementor-icon-list-icon' => 'width: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .elementor-icon-list-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
                    '{{WRAPPER}} .elementor-icon-list-icon svg' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};',
                ),
            )
        );

        $this->end_controls_section();
    }

    /**
     * Get store info items in the format expected by Elementor
     */
    private function get_store_info_items() {
		$store_data = $this->get_store_data();
		if ( empty( $store_data ) ) {
			return array();
		}

		$settings = $this->get_settings_for_display();
		$items    = array();

		// Address
		if ( $settings['show_address'] === 'yes' && ! empty( $store_data['storeAddress'] ) ) {
			$items[] = array(
				'text' => $store_data['storeAddress'],
				'icon' => array(
					'value'   => 'fas fa-map-marker-alt',
					'library' => 'fa-solid',
				),
				'link' => false,
				'_id'  => uniqid( 'address_' ),
			);
		}

		// Email
		if ( $settings['show_email'] === 'yes' && ! empty( $store_data['storeEmail'] ) ) {
			$items[] = array(
				'text' => $store_data['storeEmail'],
				'icon' => array(
					'value'   => 'fas fa-envelope',
					'library' => 'fa-solid',
				),
				'link' => array(
					'url' => 'mailto:' . $store_data['storeEmail'],
				),
				'_id'  => uniqid( 'email_' ),
			);
		}

		// Phone
		if ( $settings['show_phone'] === 'yes' && ! empty( $store_data['storePhone'] ) ) {
			$items[] = array(
				'text' => $store_data['storePhone'],
				'icon' => array(
					'value'   => 'fas fa-phone-alt',
					'library' => 'fa-solid',
				),
				'link' => array(
					'url' => 'tel:' . preg_replace( '/\s+/', '', $store_data['storePhone'] ),
				),
				'_id'  => uniqid( 'phone_' ),
			);
		}

		return $items;
	}

    protected function render() {
		$items = $this->get_store_info_items();

		if ( empty( $items ) ) {
			return;
		}

		// Set inline layout class
		$this->add_render_attribute( 'wrapper', 'class', 'elementor-icon-list-items elementor-inline-items' );

		?>
    <div class="elementor-icon-list-wrapper">
        <ul <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
            <?php
            foreach ( $items as $index => $item ) :
                // Skip if text is empty
                if ( empty( $item['text'] ) ) {
                    continue;
                }

                $repeater_setting_key = $this->get_repeater_setting_key( 'text', 'icon_list', $index );
                $this->add_render_attribute( $repeater_setting_key, 'class', 'elementor-icon-list-text' );

                // Add item class
                $item_class = 'elementor-icon-list-item elementor-inline-item';

                // Only add icon class if icon exists and text exists
                if ( ! empty( $item['icon'] ) ) {
                    $item_class .= ' elementor-icon-list-item-with-icon';
                }

                $this->add_render_attribute( 'item-' . $index, 'class', $item_class );

                // Add link attributes if needed
                if ( ! empty( $item['link']['url'] ) ) {
                    $link_key = 'link_' . $index;
                    $this->add_link_attributes( $link_key, $item['link'] );
                }
                ?>
                <li <?php echo $this->get_render_attribute_string( 'item-' . $index ); ?>>
                    <?php
                    // Only show icon if it exists AND text exists (already ensured by skipping empty text)
                    if ( ! empty( $item['icon'] ) ) :
						?>
                        <span class="elementor-icon-list-icon">
                            <?php Icons_Manager::render_icon( $item['icon'], array( 'aria-hidden' => 'true' ) ); ?>
                        </span>
                    <?php endif; ?>
                    
                    <?php
                    // Text is not empty here because we skipped empty text at the beginning
                    ?>
                    <span <?php echo $this->get_render_attribute_string( $repeater_setting_key ); ?>>
                        <?php if ( ! empty( $item['link']['url'] ) ) : ?>
                            <a <?php echo $this->get_render_attribute_string( 'link_' . $index ); ?>>
                        <?php endif; ?>
                        <?php echo wp_kses_post( $item['text'] ); ?>
                        <?php if ( ! empty( $item['link']['url'] ) ) : ?>
                            </a>
                        <?php endif; ?>
                    </span>
                </li>
            <?php endforeach; ?>
        </ul>
    </div>
		<?php
	}

    /**
     * Render output in the editor
     */
    protected function content_template() {
		?>
    <#
    var storeData = <?php echo json_encode( $this->get_store_data() ); ?>;
    var items = [];

    if (settings.show_address === 'yes' && storeData.storeAddress) {
        items.push({
            text: storeData.storeAddress,
            icon: {
                value: 'fas fa-map-marker-alt',
                library: 'fa-solid'
            },
            _id: 'address_' + Math.random().toString(36).substr(2, 9)
        });
    }

    if (settings.show_email === 'yes' && storeData.storeEmail) {
        items.push({
            text: storeData.storeEmail,
            icon: {
                value: 'fas fa-envelope',
                library: 'fa-solid'
            },
            link: { url: 'mailto:' + storeData.storeEmail },
            _id: 'email_' + Math.random().toString(36).substr(2, 9)
        });
    }

    if (settings.show_phone === 'yes' && storeData.storePhone) {
        items.push({
            text: storeData.storePhone,
            icon: {
                value: 'fas fa-phone-alt',
                library: 'fa-solid'
            },
            link: { url: 'tel:' + storeData.storePhone.replace(/\s+/g, '') },
            _id: 'phone_' + Math.random().toString(36).substr(2, 9)
        });
    }
    #>
    <div class="elementor-icon-list-wrapper">
        <ul class="elementor-icon-list-items elementor-inline-items">
            <# _.each( items, function( item, index ) { 
                // Skip if text is empty
                if ( !item.text ) return;
            #>
            <li class="elementor-icon-list-item elementor-inline-item <# if ( item.icon ) { #>elementor-icon-list-item-with-icon<# } #>">
                <# if ( item.icon ) { #>
                    <span class="elementor-icon-list-icon">
                        <#
                        var iconHTML = elementor.helpers.renderIcon( view, item.icon, { 'aria-hidden': true }, 'i' , 'object' );
                        if ( iconHTML.rendered ) { #>
                            {{{ iconHTML.value }}}
                        <# } #>
                    </span>
                <# } #>
                <span class="elementor-icon-list-text">
                    <# if ( item.link && item.link.url ) { #>
                        <a href="{{ item.link.url }}">
                    <# } #>
                    {{{ item.text }}}
                    <# if ( item.link && item.link.url ) { #>
                        </a>
                    <# } #>
                </span>
            </li>
            <# }); #>
        </ul>
    </div>
		<?php
	}
}