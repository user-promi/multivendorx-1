<?php
/**
 * Notifima class file.
 *
 * @package Notifima
 */

namespace Notifima;

defined( 'ABSPATH' ) || exit;
use Automattic\WooCommerce\Utilities\FeaturesUtil;

/**
 * Notifima Main class
 *
 * @class       Main class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Notifima {

    /**
     * Holds the single instance of the class (singleton pattern).
     *
     * @var self|null
     */
    private static $instance = null;

    /**
     * The main plugin file path.
     *
     * @var string
     */
    private $file = '';

    /**
     * Container for dependency injection or shared resources.
     *
     * @var array
     */
    private $container = array();

    /**
     * Class constructor
     *
     * @param object $file file.
     */
    public function __construct( $file ) {
        require_once trailingslashit( dirname( $file ) ) . '/config.php';

        $this->file                     = $file;
        $this->container['plugin_url']  = trailingslashit( plugins_url( '', $plugin = $file ) );
        $this->container['plugin_path'] = trailingslashit( dirname( $file ) );
        $this->container['plugin_base'] = plugin_basename( $file );

        $this->container['version']        = NOTIFIMA_PLUGIN_VERSION;
        $this->container['rest_namespace'] = 'notifima/v1';
        $this->container['block_paths']    = array();
        $this->container['is_dev']         = defined( 'WP_ENV' ) && WP_ENV === 'development';

        add_action( 'init', array( $this, 'set_default_value' ) );
        // Activation Hooks.
        register_activation_hook( $file, array( $this, 'activate' ) );
        // Deactivation Hooks.
        register_deactivation_hook( $file, array( $this, 'deactivate' ) );

        add_filter( 'plugin_action_links_' . plugin_basename( $file ), array( &$this, 'notifima_settings' ) );
        add_action( 'admin_notices', array( &$this, 'database_migration_notice' ) );

        add_action( 'before_woocommerce_init', array( $this, 'declare_compatibility' ) );
        add_action( 'woocommerce_loaded', array( $this, 'init_plugin' ) );
        add_action( 'plugins_loaded', array( $this, 'is_woocommerce_loaded' ) );
        add_filter( 'plugin_row_meta', array( $this, 'plugin_row_meta' ), 10, 2 );
        add_action( 'init', array( $this, 'migrate_from_previous_version' ) );
    }

    /**
     * Set default values for plugin settings.
     *
     * @return void
     */
    public function set_default_value() {
        $default_value = array(
            'double_opt_in_success'     => __( 'Kindly check your inbox to confirm the subscription.', 'notifima' ),
            'shown_interest_text'       => __( 'Kindly check your inbox to confirm the subscription.', 'notifima' ),
            'email_placeholder_text'    => __( 'Enter your email', 'notifima' ),
            'alert_text'                => __( 'Receive in-stock notifications for this.', 'notifima' ),
            'unsubscribe_button_text'   => __( 'Unsubscribe', 'notifima' ),
            'alert_text_color'          => '',
            'customize_btn'             => array(
                'button_text'                     => __( 'Notify me', 'notifima' ),
                'button_background_color'         => '',
                'button_border_color'             => '',
                'button_text_color'               => '',
                'button_background_color_onhover' => '',
                'button_text_color_onhover'       => '',
                'button_border_color_onhover'     => '',
                'button_font_size'                => '',
                'button_border_radious'           => '',
                'button_border_size'              => '',
            ),
            'alert_success'             => __( 'Thank you for expressing interest in %product_title%. We will notify you via email once it is back in stock.', 'notifima' ),
            // Translators: This message display already registered user to display already registered message.
            'alert_email_exist'         => __( '%customer_email% is already registered for %product_title%. Please attempt a different email address.', 'notifima' ),
            'valid_email'               => __( 'Please enter a valid email ID and try again.', 'notifima' ),
            // Translators: This message display user sucessfully unregistered.
            'alert_unsubscribe_message' => __( '%customer_email% is successfully unsubscribed.', 'notifima' ),
            'ban_email_domain_text'     => __( 'This email domain is ban in our site, kindly use another email domain.', 'notifima' ),
            'ban_email_address_text'    => __( 'This email address is ban in our site, kindly use another email address.', 'notifima' ),
        );
        $this->container['default_value'] = $default_value;
    }

    /**
     * Add metadata links (e.g. documentation, support) to the plugin row on the Plugins screen.
     *
     * @param array  $links An array of the plugin's metadata links.
     * @param string $file  The path to the plugin file relative to the plugins directory.
     *
     * @return array Modified array of metadata links.
     */
    public function plugin_row_meta( $links, $file ) {
        if ( Notifima()->plugin_base === $file ) {
            $row_meta = array(
                'docs'    => '<a href="https://notifima.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" aria-label="' . esc_attr__( 'View WooCommerce documentation', 'notifima' ) . '" target="_blank">' . esc_html__( 'Docs', 'notifima' ) . '</a>',
                'support' => '<a href="https://wordpress.org/support/plugin/woocommerce-product-stock-alert/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" aria-label="' . esc_attr__( 'Visit community forums', 'notifima' ) . '" target="_blank">' . esc_html__( 'Support', 'notifima' ) . '</a>',
            );

            return array_merge( $links, $row_meta );
        }

        return $links;
    }

    /**
     * Placeholder for activation function.
     *
     * @return void
     */
    public function activate() {
        update_option( 'notifima_installed', 1 );
        delete_option( 'stock_manager_installed' );
        $this->set_default_value();
        $this->container['install'] = new Install();
    }

    /**
     * Placeholder for deactivation function.
     *
     * @return void
     */
    public function deactivate() {
        if ( get_option( 'notifima_cron_start' ) ) {
            wp_clear_scheduled_hook( 'notifima_start_notification_cron_job' );
            delete_option( 'notifima_cron_start' );
        }

        delete_option( 'notifima_installed' );
    }

    /**
     * Add High Performance Order Storage Support.
     *
     * @return void
     */
    public function declare_compatibility() {
        FeaturesUtil::declare_compatibility( 'custom_order_tables', plugin_basename( $this->file ), true );
    }

    /**
     * Initilizing plugin on WP init.
     *
     * @return void
     */
    public function init_plugin() {
        $this->load_plugin_textdomain();
        $this->init_classes();
        add_filter( 'woocommerce_email_classes', array( $this, 'setup_email_class' ) );

        do_action( 'notifima_loaded' );
    }

    /**
     * Init all Notifima classess.
     * Access this classes using magic method.
     *
     * @return void
     */
    public function init_classes() {
        $this->container['util']            = new Utill();
        $this->container['setting']         = new Setting();
        $this->container['ajax']            = new Ajax();
        $this->container['frontend']        = new FrontEnd();
        $this->container['shortcode']       = new Shortcode();
        $this->container['subscriber']      = new Subscriber();
        $this->container['filters']         = new Deprecated\DeprecatedFilterHooks();
        $this->container['actions']         = new Deprecated\DeprecatedActionHooks();
        $this->container['admin']           = new Admin();
        $this->container['restapi']         = new RestAPI();
        $this->container['block']           = new Block();
        $this->container['frontendScripts'] = new FrontendScripts();
    }

    /**
     * Add Notifima Email Class.
     *
     * @param array $emails  All notifima emails.
     * @return array
     */
    public function setup_email_class( $emails ) {

        $emails['Admin_New_Subscriber_Email']    = new Emails\AdminNewSubscriberEmail();
        $emails['Subscriber_Confirmation_Email'] = new Emails\SubscriberConfirmationEmail();
        $emails['Product_Back_In_Stock_Email']   = new Emails\ProductBackInStockEmail();

        return $emails;
    }

    /**
     * Take action based on if woocommerce is not loaded.
     *
     * @return void
     */
    public function is_woocommerce_loaded() {
        if ( did_action( 'woocommerce_loaded' ) || ! is_admin() ) {
            return;
        }
        add_action( 'admin_notices', array( $this, 'woocommerce_admin_notice' ) );
    }

    /**
     * Migrate data from previous version.
     */
    public function migrate_from_previous_version() {
        $previous_version = get_option( 'notifima_version', '' );

        if ( version_compare( $previous_version, Notifima()->version, '<' ) ) {
            new Install();
        }
    }

    /**
     * Load Localisation files.
     * Note: the first-loaded translation file overrides any following ones if the same translation is present.
     *
     * @access public
     * @return void
     */
    public function load_plugin_textdomain() {
        if ( version_compare( $GLOBALS['wp_version'], '6.7', '<' ) ) {
            load_plugin_textdomain( 'notifima', false, plugin_basename( dirname( __DIR__ ) ) . '/languages' );
        } else {
            load_textdomain( 'notifima', WP_LANG_DIR . '/plugins/notifima-' . determine_locale() . '.mo' );
        }
    }

    /**
     * Magic getter function to get the reference of class.
     * Accept class name, If valid return reference, else Wp_Error.
     *
     * @param  mixed $class all classes.
     * @return object | \WP_Error
     */
    public function __get( $class ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        if ( array_key_exists( $class, $this->container ) ) {
            return $this->container[ $class ];
        }

        return new \WP_Error( sprintf( 'Call to unknown class %s.', $class ) );
    }

    /**
     * Magic setter function to store a reference of a class.
     * Accepts a class name as the key and stores the instance in the container.
     *
     * @param string $class The class name or key to store the instance.
     * @param object $value The instance of the class to store.
     */
    public function __set( $class, $value ) { // phpcs:ignore Universal.NamingConventions.NoReservedKeywordParameterNames.classFound
        $this->container[ $class ] = $value;
    }

    /**
     * Admin notice for woocommerce inactive.
     *
     * @return void
     */
    public static function woocommerce_admin_notice() {
        ?>
        <div id="message" class="error">
            <p>
                <?php
                    printf(
                        // translators: 1: Opening strong tag, 2: Closing strong tag, 3: Opening WooCommerce link, 4: Closing link, 5: Opening install link, 6: Closing install link.
                        esc_html__(
                            '%1$sNotifima is inactive.%2$s The %3$sWooCommerce plugin%4$s must be active for the Notifima to work. Please %5$sinstall & activate WooCommerce%6$s',
                            'notifima'
                        ),
                        '<strong>',
                        '</strong>',
                        '<a target="_blank" href="' . esc_url( 'https://wordpress.org/plugins/woocommerce/' ) . '">',
                        '</a>',
                        '<a href="' . esc_url( admin_url( 'plugins.php' ) ) . '">',
                        ' &raquo;</a>'
                    );
                ?>
            </p>
        </div>
        <?php
    }

    /**
     * Html for database migration notice.
     *
     * @return void
     */
    public static function database_migration_notice() {
        // check if plugin vertion in databse is not same to current notifima version.
        $plugin_version = get_option( 'notifima_version', '' );

        if ( Install::is_migration_running() ) {
            ?>
            <div id="message" class="notice notice-warning">
                <p><?php esc_html_e( 'Notifima is currently updating the database in the background. Please be patient while the process completes.', 'notifima' ); ?></p>
            </div>
            <?php
        } elseif ( NOTIFIMA_PLUGIN_VERSION !== $plugin_version ) {
            ?>
            <div id="message" class="error">
                <p><?php esc_html_e( 'The Notifima is experiencing configuration issues. To ensure proper functioning, kindly deactivate and then activate the plugin.', 'notifima' ); ?></p>
            </div>
            <?php
        }
    }

    /**
     * Set the stoct Manager settings in plugin activation page.
     *
     * @param  mixed $links all links.
     * @return array
     */
    public static function notifima_settings( $links ) {
        $plugin_links = array(
            '<a href="' . admin_url( 'admin.php?page=notifima#&tab=settings&subtab=general' ) . '">' . __( 'Settings', 'notifima' ) . '</a>',
            '<a href="https://notifima.com/support/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" target="_blank">' . __( 'Support', 'notifima' ) . '</a>',
            '<a href="https://notifima.com/docs/?utm_source=wpadmin&utm_medium=pluginsettings&utm_campaign=notifima" target="_blank">' . __( 'Docs', 'notifima' ) . '</a>',
        );
        if ( ! Utill::is_khali_dabba() ) {
            $links['go_pro'] = '<a href="' . NOTIFIMA_PRO_SHOP_URL . '" class="notifima-pro-plugin" target="_blank" style="font-weight: 700;background: linear-gradient(110deg, rgb(63, 20, 115) 0%, 25%, rgb(175 59 116) 50%, 75%, rgb(219 75 84) 100%);-webkit-background-clip: text;-webkit-text-fill-color: transparent;">' . __( 'Upgrade to Pro', 'notifima' ) . '</a>';
        }

        return array_merge( $plugin_links, $links );
    }

    /**
     * Initializes the Notifima class.
     * Checks for an existing instance
     * And if it doesn't find one, create it.
     *
     * @param  mixed $file file.
     * @return object | null
     */
    public static function init( $file ) {
        if ( null === self::$instance ) {
            self::$instance = new self( $file );
        }

        return self::$instance;
    }
}
