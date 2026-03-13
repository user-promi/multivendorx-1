<?php
namespace MultiVendorX\Elementor\Widgets;

defined( 'ABSPATH' ) || exit;

use Elementor\Widget_Social_Icons;
use Elementor\Controls_Manager;
use MultiVendorX\Elementor\StoreHelper;

class Store_Social extends Widget_Social_Icons {

    use StoreHelper;

    /**
     * Get widget name
     */
    public function get_name() {
        return 'multivendorx_store_social';
    }

    /**
     * Get widget title
     */
    public function get_title() {
        return __( 'Store Social', 'multivendorx' );
    }

    /**
     * Get widget icon
     */
    public function get_icon() {
        return 'eicon-social-icons';
    }

    /**
     * Get widget categories
     */
    public function get_categories() {
        return array( 'multivendorx' );
    }

    /**
     * Get widget keywords
     */
    public function get_keywords() {
        return array( 'social', 'store', 'vendor', 'mvx', 'multivendorx' );
    }

    /**
     * Register widget controls
     */
    protected function register_controls() {
        // First, register parent controls
        parent::register_controls();

        // Modify the existing social icon list control
        $this->update_control(
            'social_icon_list',
            array(
                'label' => __( 'Social Icons', 'multivendorx' ),
                'type' => Controls_Manager::REPEATER,
                'default' => $this->get_dynamic_social_icons_default(),
                'fields' => $this->get_social_icon_repeater_fields(),
                'title_field' => '<# 
                    var migrated = isset( elementor.helpers.getSocialNetworkNameFromIcon( social_icon ) ) 
                        ? elementor.helpers.getSocialNetworkNameFromIcon( social_icon ) 
                        : social_icon;
                    #>
                    {{{ migrated }}}',
            )
        );

        // Add store-specific section after the parent sections
        $this->start_controls_section(
            'section_store_social_settings',
            array(
                'label' => __( 'Store Social Settings', 'multivendorx' ),
                'tab' => Controls_Manager::TAB_CONTENT,
            )
        );

        $this->add_control(
            'dynamic_store_links_note',
            array(
                'type' => Controls_Manager::RAW_HTML,
                'raw' => sprintf(
                    '<div class="elementor-control-field-description" style="padding:10px; background:#f0f0f0; border-left:4px solid #93003c;">
                        <strong>%s</strong><br>%s
                    </div>',
                    __( 'Dynamic Store Social Links:', 'multivendorx' ),
                    __( 'Social icons will automatically populate from the store settings. You can customize them below.', 'multivendorx' )
                ),
                'content_classes' => 'elementor-panel-alert elementor-panel-alert-info',
            )
        );

        $this->add_control(
            'show_store_labels',
            array(
                'label' => __( 'Show Store Labels', 'multivendorx' ),
                'type' => Controls_Manager::SWITCHER,
                'label_on' => __( 'Show', 'multivendorx' ),
                'label_off' => __( 'Hide', 'multivendorx' ),
                'return_value' => 'yes',
                'default' => 'no',
            )
        );

        $this->end_controls_section();

        // Add store-specific style controls
        $this->start_controls_section(
            'section_store_social_style',
            array(
                'label' => __( 'Store Social Style', 'multivendorx' ),
                'tab' => Controls_Manager::TAB_STYLE,
            )
        );

        $this->add_responsive_control(
            'icons_layout',
            array(
                'label' => __( 'Layout', 'multivendorx' ),
                'type' => Controls_Manager::CHOOSE,
                'options' => array(
                    'row' => array(
                        'title' => __( 'Horizontal', 'multivendorx' ),
                        'icon' => 'eicon-navigation-horizontal',
                    ),
                    'column' => array(
                        'title' => __( 'Vertical', 'multivendorx' ),
                        'icon' => 'eicon-navigation-vertical',
                    ),
                ),
                'default' => 'row',
                'toggle' => true,
                'selectors' => array(
                    '{{WRAPPER}} .elementor-social-icons-wrapper' => 'flex-direction: {{VALUE}};',
                ),
                'style_transfer' => true,
            )
        );

        $this->add_responsive_control(
            'icons_gap',
            array(
                'label' => __( 'Gap', 'multivendorx' ),
                'type' => Controls_Manager::SLIDER,
                'size_units' => array( 'px', 'em', 'rem' ),
                'range' => array(
                    'px' => array(
                        'min' => 0,
                        'max' => 50,
                    ),
                ),
                'default' => array(
                    'unit' => 'px',
                    'size' => 10,
                ),
                'selectors' => array(
                    '{{WRAPPER}} .elementor-social-icons-wrapper' => 'gap: {{SIZE}}{{UNIT}};',
                ),
            )
        );

        $this->add_control(
            'label_style_heading',
            array(
                'label' => __( 'Label Style', 'multivendorx' ),
                'type' => Controls_Manager::HEADING,
                'separator' => 'before',
                'condition' => array(
                    'show_store_labels' => 'yes',
                ),
            )
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            array(
                'name' => 'label_typography',
                'selector' => '{{WRAPPER}} .mvx-social-label',
                'condition' => array(
                    'show_store_labels' => 'yes',
                ),
            )
        );

        $this->add_control(
            'label_color',
            array(
                'label' => __( 'Label Color', 'multivendorx' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .mvx-social-label' => 'color: {{VALUE}};',
                ),
                'condition' => array(
                    'show_store_labels' => 'yes',
                ),
            )
        );

        $this->add_control(
            'label_hover_color',
            array(
                'label' => __( 'Label Hover Color', 'multivendorx' ),
                'type' => Controls_Manager::COLOR,
                'selectors' => array(
                    '{{WRAPPER}} .elementor-social-icon:hover .mvx-social-label' => 'color: {{VALUE}};',
                ),
                'condition' => array(
                    'show_store_labels' => 'yes',
                ),
            )
        );

        $this->add_responsive_control(
            'label_spacing',
            array(
                'label' => __( 'Label Spacing', 'multivendorx' ),
                'type' => Controls_Manager::SLIDER,
                'size_units' => array( 'px', 'em' ),
                'range' => array(
                    'px' => array(
                        'min' => 0,
                        'max' => 30,
                    ),
                ),
                'default' => array(
                    'unit' => 'px',
                    'size' => 5,
                ),
                'selectors' => array(
                    '{{WRAPPER}} .mvx-social-label' => 'margin-left: {{SIZE}}{{UNIT}};',
                ),
                'condition' => array(
                    'show_store_labels' => 'yes',
                ),
            )
        );

        $this->end_controls_section();
    }

    /**
     * Get dynamic social icons default values
     */
    protected function get_dynamic_social_icons_default() {
        $store = $this->get_store_data();
        
        $default_icons = array();
        
        // Social platforms mapping with their icons
        $social_platforms = array(
            'facebook'  => array(
                'value' => 'fab fa-facebook',
                'library' => 'fa-brands',
                'label' => 'Facebook',
            ),
            'twitter'   => array(
                'value' => 'fab fa-twitter',
                'library' => 'fa-brands',
                'label' => 'Twitter',
            ),
            'instagram' => array(
                'value' => 'fab fa-instagram',
                'library' => 'fa-brands',
                'label' => 'Instagram',
            ),
            'youtube'   => array(
                'value' => 'fab fa-youtube',
                'library' => 'fa-brands',
                'label' => 'YouTube',
            ),
            'pinterest' => array(
                'value' => 'fab fa-pinterest',
                'library' => 'fa-brands',
                'label' => 'Pinterest',
            ),
            'linkedin'  => array(
                'value' => 'fab fa-linkedin',
                'library' => 'fa-brands',
                'label' => 'LinkedIn',
            ),
        );

        if ( $store ) {
            foreach ( $social_platforms as $key => $icon ) {
                if ( ! empty( $store[ $key ] ) ) {
                    $default_icons[] = array(
                        'social_icon' => array(
                            'value' => $icon['value'],
                            'library' => $icon['library'],
                        ),
                        'social_text' => $icon['label'],
                        'link' => array(
                            'url' => $store[ $key ],
                            'is_external' => 'on',
                            'nofollow' => '',
                        ),
                    );
                }
            }
        }

        // If no store data or empty, return default icons
        if ( empty( $default_icons ) ) {
            $default_icons = array(
                array(
                    'social_icon' => array(
                        'value' => 'fab fa-facebook',
                        'library' => 'fa-brands',
                    ),
                    'social_text' => 'Facebook',
                    'link' => array(
                        'url' => '#',
                        'is_external' => 'on',
                        'nofollow' => '',
                    ),
                ),
                array(
                    'social_icon' => array(
                        'value' => 'fab fa-twitter',
                        'library' => 'fa-brands',
                    ),
                    'social_text' => 'Twitter',
                    'link' => array(
                        'url' => '#',
                        'is_external' => 'on',
                        'nofollow' => '',
                    ),
                ),
                array(
                    'social_icon' => array(
                        'value' => 'fab fa-instagram',
                        'library' => 'fa-brands',
                    ),
                    'social_text' => 'Instagram',
                    'link' => array(
                        'url' => '#',
                        'is_external' => 'on',
                        'nofollow' => '',
                    ),
                ),
            );
        }

        return $default_icons;
    }

    /**
     * Get social icon repeater fields
     */
    protected function get_social_icon_repeater_fields() {
        $repeater = new \Elementor\Repeater();

        $repeater->add_control(
            'social_icon',
            array(
                'label' => __( 'Icon', 'multivendorx' ),
                'type' => Controls_Manager::ICONS,
                'fa4compatibility' => 'social',
                'default' => array(
                    'value' => 'fab fa-facebook',
                    'library' => 'fa-brands',
                ),
                'recommended' => array(
                    'fa-brands' => array(
                        'facebook',
                        'twitter',
                        'instagram',
                        'youtube',
                        'pinterest',
                        'linkedin',
                    ),
                ),
            )
        );

        $repeater->add_control(
            'social_text',
            array(
                'label' => __( 'Label', 'multivendorx' ),
                'type' => Controls_Manager::TEXT,
                'default' => '',
                'placeholder' => __( 'Enter social label', 'multivendorx' ),
            )
        );

        $repeater->add_control(
            'link',
            array(
                'label' => __( 'Link', 'multivendorx' ),
                'type' => Controls_Manager::URL,
                'default' => array(
                    'is_external' => 'true',
                ),
                'dynamic' => array(
                    'active' => true,
                ),
                'placeholder' => __( 'https://your-link.com', 'multivendorx' ),
            )
        );

        return $repeater->get_controls();
    }

    /**
     * Render widget output on the frontend
     */
    protected function render() {
        $store = $this->get_store_data();
        $settings = $this->get_settings_for_display();
        
        // Update social icon links with store data if available
        if ( $store && ! empty( $settings['social_icon_list'] ) ) {
            $social_platforms = array(
                'fab fa-facebook' => 'facebook',
                'fab fa-twitter' => 'twitter',
                'fab fa-instagram' => 'instagram',
                'fab fa-youtube' => 'youtube',
                'fab fa-pinterest' => 'pinterest',
                'fab fa-linkedin' => 'linkedin',
            );

            foreach ( $settings['social_icon_list'] as $key => $item ) {
                if ( isset( $item['social_icon']['value'] ) ) {
                    $icon_value = $item['social_icon']['value'];
                    
                    if ( isset( $social_platforms[ $icon_value ] ) ) {
                        $platform_key = $social_platforms[ $icon_value ];
                        
                        if ( ! empty( $store[ $platform_key ] ) ) {
                            // Update the link with store URL
                            $settings['social_icon_list'][ $key ]['link']['url'] = $store[ $platform_key ];
                        }
                    }
                }
            }
        }

        // Add wrapper attributes
        $this->add_render_attribute(
            'social-icons-wrapper',
            'class',
            'mvx-store-social-icons elementor-social-icons-wrapper'
        );

        if ( 'yes' === $settings['show_store_labels'] ) {
            $this->add_render_attribute( 'social-icons-wrapper', 'class', 'show-labels' );
        }

        ?>
        <div <?php echo $this->get_render_attribute_string( 'social-icons-wrapper' ); ?>>
            <?php $this->render_social_icons( $settings ); ?>
        </div>
        <?php
    }

    /**
     * Render social icons
     */
    protected function render_social_icons( $settings ) {
        $migration_allowed = \Elementor\Icons_Manager::is_migration_allowed();
        $show_labels = 'yes' === $settings['show_store_labels'];

        foreach ( $settings['social_icon_list'] as $index => $item ) {
            $social = '';

            // For backward compatibility
            if ( ! $migration_allowed || empty( $item['social'] ) ) {
                $migrated = isset( $item['__fa4_migrated']['social_icon'] );
                $is_new = empty( $item['social'] ) && $migration_allowed;
                if ( $is_new || $migrated ) {
                    $social = $item['social_icon']['value'];
                }
            } else {
                $social = $item['social'];
            }

            if ( empty( $social ) ) {
                $social = 'fab fa-facebook';
            }

            $social_name = $this->get_social_network_name( $social );

            $link_key = 'link_' . $index;
            $this->add_render_attribute( $link_key, 'class', array(
                'elementor-icon',
                'elementor-social-icon',
                'elementor-social-icon-' . $social_name,
                'elementor-repeater-item-' . $item['_id'],
            ) );

            if ( ! empty( $item['link']['url'] ) ) {
                $this->add_link_attributes( $link_key, $item['link'] );
            }

            ?>
            <a <?php echo $this->get_render_attribute_string( $link_key ); ?>>
                <span class="elementor-screen-only"><?php echo ucwords( $social_name ); ?></span>
                <?php
                if ( ! empty( $item['social_icon']['value'] ) ) {
                    \Elementor\Icons_Manager::render_icon( $item['social_icon'], array( 'aria-hidden' => 'true' ) );
                } else { ?>
                    <i class="<?php echo esc_attr( $social ); ?>" aria-hidden="true"></i>
                <?php } 
                
                if ( $show_labels && ! empty( $item['social_text'] ) ) {
                    echo '<span class="mvx-social-label">' . esc_html( $item['social_text'] ) . '</span>';
                }
                ?>
            </a>
            <?php
        }
    }

    /**
     * Get social network name from icon class
     */
    private function get_social_network_name( $social_icon ) {
        $social_network_name = str_replace( 'fa fa-', '', $social_icon );
        $social_network_name = str_replace( 'fab fa-', '', $social_network_name );
        $social_network_name = str_replace( 'fas fa-', '', $social_network_name );
        $social_network_name = str_replace( 'far fa-', '', $social_network_name );
        
        return $social_network_name;
    }

    /**
     * Render widget output in the editor
     */
    protected function content_template() {
        ?>
        <#
        var showLabels = settings.show_store_labels === 'yes';
        var iconsLayout = settings.icons_layout || 'row';
        var iconsGap = settings.icons_gap || { size: 10, unit: 'px' };
        #>
        <div class="mvx-store-social-icons elementor-social-icons-wrapper show-labels-{{ showLabels ? 'yes' : 'no' }}" style="flex-direction: {{ iconsLayout }}; gap: {{ iconsGap.size }}{{ iconsGap.unit }};">
            <# _.each( settings.social_icon_list, function( item, index ) {
                var social = elementor.helpers.getSocialNetworkNameFromIcon( item.social_icon, item.social, false, item.social_icon ? item.social_icon.value : '' );
                var link = item.link ? item.link.url : '#';
                var iconHTML = elementor.helpers.renderIcon( view, item.social_icon, { 'aria-hidden': true }, 'i' , 'object' );
                var migrated = elementor.helpers.isIconMigrated( item, 'social_icon' );
                var labelText = item.social_text ? item.social_text : '';
                #>
                <a class="elementor-icon elementor-social-icon elementor-social-icon-{{ social }} elementor-repeater-item-{{ item._id }}" href="{{ link }}">
                    <span class="elementor-screen-only">{{{ social }}}</span>
                    <#
                    if ( iconHTML && iconHTML.rendered && ( ! item.social || migrated ) ) { #>
                        {{{ iconHTML.value }}}
                    <# } else { #>
                        <i class="{{ item.social }}" aria-hidden="true"></i>
                    <# }
                    
                    if ( showLabels && labelText ) { #>
                        <span class="mvx-social-label">{{{ labelText }}}</span>
                    <# } #>
                </a>
            <# }); #>
        </div>
        <?php
    }
}