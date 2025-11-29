<?php
namespace MultiVendorX\Knowledgebase;

class Frontend {
    public function __construct() {
        // Hook into the filter that defines the admin submenus
        add_filter( 'multivendorx_submenus', array( $this, 'add_knowledgebase_menu' ), 20 );
    }

    /**
     * Add Advertisement submenu at the correct position.
     *
     * @param array $submenus Existing submenu array.
     * @return array Modified submenu array.
     */
    public function add_knowledgebase_menu( $submenus ) {
        $new_item = array(
            'knowledgebase' => array(
                'name'   => __( 'Knowledgebase', 'multivendorx' ),
                'subtab' => '',
            ),
        );

        $ordered = array();
        foreach ( $submenus as $key => $menu ) {
            // Copy existing menu
            $ordered[ $key ] = $menu;

            // Insert advertisement right after "status-tools"
            if ( $key === 'announcement' || $key === 'status-tools' ) {
                $ordered = array_merge( $ordered, $new_item );
            }
        }

        return $ordered;
    }
}
