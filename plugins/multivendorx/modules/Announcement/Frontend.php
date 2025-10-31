<?php
namespace MultiVendorXPro\Announcement;

class Frontend {
    public function __construct() {
        // Hook into the filter that defines the admin submenus
        add_filter( 'multivendorx_submenus', [ $this, 'add_announcement_menu' ], 20 );
    }

    /**
     * Add Advertisement submenu at the correct position.
     *
     * @param array $submenus Existing submenu array.
     * @return array Modified submenu array.
     */
    public function add_announcement_menu( $submenus ) {
        $new_item = [
            'announcement' => array(
                'name'   => __( 'Announcement', 'multivendorx' ),
                'subtab' => '',
            ),
        ];

        $ordered = [];
        foreach ( $submenus as $key => $menu ) {
            // Copy existing menu
            $ordered[ $key ] = $menu;

            // Insert advertisement right after "status-tools"
            if ( $key === 'status-tools' ) {
                $ordered = array_merge( $ordered, $new_item );
            }
        }

        return $ordered;
    }
}
