<?php
/**
 * MultiVendorX Email class file
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\Emails;

/**
 * MultiVendorX MultiVendorXEmails
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class MultiVendorXEmails extends \WC_Email {

    /**
	 * Constructor.
	 */
	public function __construct() {
        // Call WC_Email constructor.
        parent::__construct();
    }
}
