<?php
/**
 * MultiVendorX Admin class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\StaffManager;

/**
 * MultiVendorX Staff Manager Admin class
 *
 * @class       Admin class
 * @version     6.0.0
 * @author      MultiVendorX
 */
class Admin {
    public function __construct(){
        add_action( 'init', [ $this, 'multivendorx_add_custom_roles' ] );
        add_filter( 'multivendorx_admin_localize_scripts', [ $this, 'localize_scripts'] );
    }

    public function multivendorx_add_custom_roles() {
        if ( ! get_role( 'store_manager' ) ) {
            add_role(
                'store_manager',
                'Store Manager',
                array(
                    'read' => true,
                )
            );
        }
        if ( ! get_role( 'product_manager' ) ) {
            add_role(
                'product_manager',
                'Product Manager',
                array(
                    'read' => true,
                )
            );
        }
        if ( ! get_role( 'customer_support' ) ) {
            add_role(
                'customer_support',
                'Customer Support',
                array(
                    'read' => true,
                )
            );
        }
        if ( ! get_role( 'order_assistant' ) ) {
            add_role(
                'order_assistant',
                'Order Assistant',
                array(
                    'read' => true,
                )
            );
        }
    }

    public function localize_scripts($scripts) {
        $store_managers = get_users([
            'role'    => 'store_manager',
            'orderby' => 'ID',
            'order'   => 'ASC',
        ]);

        $managers_list = [];
        foreach ( $store_managers as $manager ) {
            $managers_list[] = array(
                'label' => $manager->display_name,
                'value' => $manager->ID,
            );
        }

        $product_managers = get_users([
            'role'    => 'product_manager',
            'orderby' => 'ID',
            'order'   => 'ASC',
        ]);

        $product_managers_list = [];
        foreach ( $product_managers as $manager ) {
            $product_managers_list[] = array(
                'label' => $manager->display_name,
                'value' => $manager->ID,
            );
        }

        $supports = get_users([
            'role'    => 'customer_support',
            'orderby' => 'ID',
            'order'   => 'ASC',
        ]);

        $customer_support_list = [];
        foreach ( $supports as $support ) {
            $customer_support_list[] = array(
                'label' => $support->display_name,
                'value' => $support->ID,
            );
        }

        $order_assistants = get_users([
            'role'    => 'order_assistant',
            'orderby' => 'ID',
            'order'   => 'ASC',
        ]);

        $assistants_list = [];
        foreach ( $order_assistants as $assistant ) {
            $assistants_list[] = array(
                'label' => $assistant->display_name,
                'value' => $assistant->ID,
            );
        }

        $all_scripts = [
            'managers_list' => $managers_list,
            'product_managers_list' => $product_managers_list,
            'customer_support_list' => $customer_support_list,
            'assistants_list' => $assistants_list
        ];
        
        return array_merge($scripts, $all_scripts);
    }
}