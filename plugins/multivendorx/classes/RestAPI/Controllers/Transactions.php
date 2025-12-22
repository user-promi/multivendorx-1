<?php
/**
 * MultiVendorX REST API Transaction Controller
 *
 * @package MultiVendorX
 */

namespace MultiVendorX\RestAPI\Controllers;

use MultiVendorX\Store\Store;
use MultiVendorX\Transaction\Transaction;
use MultiVendorX\Utill;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX REST API Transaction Controller
 *
 * @class       Module class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Transactions extends \WP_REST_Controller {

	/**
	 * Route base.
	 *
	 * @var string
	 */
	protected $rest_base = 'transaction';

    /**
     * Register the routes for transaction.
     */
    public function register_routes() {
        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base,
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
				),
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_item' ),
					'permission_callback' => array( $this, 'create_item_permissions_check' ),
				),
			)
        );

        register_rest_route(
            MultiVendorX()->rest_namespace,
            '/' . $this->rest_base . '/(?P<id>[\d]+)',
            array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'get_items_permissions_check' ),
					'args'                => array(
						'id' => array( 'required' => true ),
					),
				),
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'update_item_permissions_check' ),
				),
			)
        );
    }

    /**
     * Get items permissions check.
     *
     * @param object $request Full details about the request.
     */
    public function get_items_permissions_check( $request ) {
        return true;
    }

    /**
     * Create item permissions check.
     *
     * @param object $request Full details about the request.
     */
    public function create_item_permissions_check( $request ) {
        return true;
    }

    /**
     * Update item endpoint handler.
     *
     * @param object $request Full details about the request.
     */
    public function update_item_permissions_check( $request ) {
        return true;
    }

    /**
     * Get items endpoint handler.
     *
     * @param object $request Full details about the request.
     */
    public function get_items( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            $error = new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );

            // Log the error.
            if ( is_wp_error( $error ) ) {
                MultiVendorX()->util->log( $error );
            }

            return $error;
        }
        try {
            // Check if CSV download is requested.
            $format = $request->get_param( 'format' );
            if ( 'csv' === $format ) {
                return $this->download_transaction_csv( $request );
            }

            $limit         = intval( $request->get_param( 'row' ) ) ? intval( $request->get_param( 'row' ) ) : 10;
            $page          = intval( $request->get_param( 'page' ) ) ? intval( $request->get_param( 'page' ) ) : 1;
            $offset        = ( $page - 1 ) * $limit;
            $count         = $request->get_param( 'count' );
            $store_id      = intval( $request->get_param( 'store_id' ) );
            $status        = $request->get_param( 'status' );
            $filter_status = $request->get_param( 'filter_status' );

            // 🔹 Handle date range from request.
            $start_date         = $request->get_param( 'start_date' );
            $end_date           = $request->get_param( 'end_date' );
            $transaction_type   = $request->get_param( 'transaction_type' );
            $transaction_status = $request->get_param( 'transaction_status' );
            $order_by           = sanitize_text_field( $request->get_param( 'orderBy' ) );
            $order              = strtoupper( sanitize_text_field( $request->get_param( 'order' ) ) );

            if ( $start_date ) {
                $start_date = gmdate( 'Y-m-d H:i:s', strtotime( $start_date ) );
            }
            if ( $end_date ) {
                $end_date = gmdate( 'Y-m-d H:i:s', strtotime( $end_date ) );
            }

            $args = array();
            if ( $count ) {
                $args['count'] = true;
            }
            if ( $status ) {
                $args['status'] = $status;
            }
            if ( $store_id ) {
                $args['store_id'] = $store_id;
            }

            // Add date filters.
            if ( $start_date ) {
                $args['start_date'] = $start_date;
            }
            if ( $end_date ) {
                $args['end_date'] = $end_date;
            }
            if ( $filter_status ) {
                $args['entry_type'] = $filter_status;
            }

            if ( $count ) {
                $transactions = Transaction::get_transaction_information( $args );
                return rest_ensure_response( (int) $transactions );
            }
            if ( $transaction_status ) {
                $args['entry_type'] = $transaction_status;
            }
            if ( $transaction_type ) {
                $args['transaction_type'] = $transaction_type;
            }
            $args['limit']  = $limit;
            $args['offset'] = $offset;

            if ( ! empty( $order_by ) ) {
                $args['orderBy'] = $order_by;
            }
            if ( in_array( $order, array( 'ASC', 'DESC' ), true ) ) {
                $args['order'] = $order;
            }

            $transactions = Transaction::get_transaction_information( $args );

            $formatted = array_map(
                function ( $row ) {
                    $store = new \MultiVendorX\Store\Store( $row['store_id'] );
                    return array(
                        'id'               => $row['id'],
                        'commission_id'    => $row['commission_id'],
                        'store_name'       => $store ? $store->get( Utill::STORE_SETTINGS_KEYS['name'] ) : '-',
                        'amount'           => $row['amount'],
                        'balance'          => $row['balance'],
                        'status'           => $row['status'],
                        'payment_method'   => $row['payment_method'] ?? '',
                        'account_number'   => $store ? $store->get_meta( Utill::STORE_SETTINGS_KEYS['account_number'] ) : '',
                        'credit'           => 'Cr' === $row['entry_type'] ? $row['amount'] : 0,
                        'debit'            => 'Dr' === $row['entry_type'] ? $row['amount'] : 0,
                        'date'             => $row['created_at'],
                        'order_details'    => $row['order_id'],
                        'transaction_type' => $row['transaction_type'],
                    );
                },
                $transactions
            );

            $count_args = array(
                'count' => true,
            );

            if ( $store_id ) {
                $count_args['store_id'] = $store_id;
            }

            $all       = Transaction::get_transaction_information( $count_args );
            $completed = Transaction::get_transaction_information( array_merge( $count_args, array( 'status' => 'Completed' ) ) );
            $processed = Transaction::get_transaction_information( array_merge( $count_args, array( 'status' => 'Processed' ) ) );
            $upcoming  = Transaction::get_transaction_information( array_merge( $count_args, array( 'status' => 'Upcoming' ) ) );
            $failed    = Transaction::get_transaction_information( array_merge( $count_args, array( 'status' => 'Failed' ) ) );

            $response = array(
                'transaction' => $formatted,
                'all'         => $all,
                'completed'   => $completed,
                'processed'   => $processed,
                'upcoming'    => $upcoming,
                'failed'      => $failed,
            );
            return rest_ensure_response( $response );
        } catch ( \Exception $e ) {
            MultiVendorX()->util->log( $e );

            return new \WP_Error( 'server_error', __( 'Unexpected server error', 'multivendorx' ), array( 'status' => 500 ) );
        }
    }

    /**
     * Download transactions as CSV
     *
     * @param object $request Request object.
     */
    private function download_transaction_csv( $request ) {
        $store_id           = intval( $request->get_param( 'store_id' ) );
        $filter_status      = $request->get_param( 'filter_status' );
        $transaction_type   = $request->get_param( 'transaction_type' );
        $transaction_status = $request->get_param( 'transaction_status' );
        $ids                = $request->get_param( 'ids' );
        $start_date         = sanitize_text_field( $request->get_param( 'start_date' ) );
        $end_date           = sanitize_text_field( $request->get_param( 'end_date' ) );
        $page               = $request->get_param( 'page' );
        $per_page           = $request->get_param( 'row' );

        // Prepare filter for Transaction - NO pagination by default.
        $args = array();
        if ( ! empty( $store_id ) ) {
            $args['store_id'] = $store_id;
        }
        if ( ! empty( $filter_status ) ) {
            $args['entry_type'] = $filter_status;
        }
        if ( ! empty( $transaction_type ) ) {
            $args['transaction_type'] = $transaction_type;
        }
        if ( ! empty( $transaction_status ) ) {
            $args['entry_type'] = $transaction_status;
        }
        if ( ! empty( $start_date ) && ! empty( $end_date ) ) {
            $args['start_date'] = gmdate( 'Y-m-d 00:00:00', strtotime( $start_date ) );
            $args['end_date']   = gmdate( 'Y-m-d 23:59:59', strtotime( $end_date ) );
        }

        // If specific IDs are requested (selected rows from bulk action).
        if ( ! empty( $ids ) ) {
			$args['id__in'] = array_map( 'intval', explode( ',', $ids ) ); }

        // If pagination parameters are provided (current page export from bulk action).
        elseif ( ! empty( $page ) && ! empty( $per_page ) ) {
            $args['limit']  = intval( $per_page );
            $args['offset'] = ( intval( $page ) - 1 ) * intval( $per_page );
        }

        // Fetch transactions.
        $transactions = Transaction::get_transaction_information( $args );

        if ( empty( $transactions ) ) {
            return new \WP_Error( 'no_data', __( 'No transaction data found.', 'multivendorx' ), array( 'status' => 404 ) );
        }

        // CSV headers.
        $headers = array(
            'Transaction ID',
            'Date',
            'Order ID',
            'Store Name',
            'Transaction Type',
            'Credit',
            'Debit',
            'Balance',
            'Status',
            'Payment Method',
            'Narration',
        );

        // Build CSV data.
        $csv_output = fopen( 'php://output', 'w' );
        ob_start();

        // Add BOM for UTF-8 compatibility.
        fwrite( $csv_output, "\xEF\xBB\xBF" );

        fputcsv( $csv_output, $headers );

        foreach ( $transactions as $transaction ) {
            $store      = new \MultiVendorX\Store\Store( $transaction['store_id'] );
            $store_name = $store ? $store->get( 'name' ) : '';

            // Format date.
            $date = ! empty( $transaction['created_at'] ) ? gmdate( 'M j, Y', strtotime( $transaction['created_at'] ) ) : '-';

            fputcsv(
                $csv_output,
                array(
					$transaction['id'],
					$date,
					$transaction['order_id'] ? $transaction['order_id'] : '-',
					$store_name,
					$transaction['transaction_type'] ? $transaction['transaction_type'] : '-',
					'Cr' === $transaction['entry_type'] ? $transaction['amount'] : 0,
					'Dr' === $transaction['entry_type'] ? $transaction['amount'] : 0,
					$transaction['balance'],
					$transaction['status'],
					$transaction['payment_method'] ? $transaction['payment_method'] : '',
					$transaction['narration'],
                )
            );
        }

        fclose( $csv_output );
        $csv = ob_get_clean();

        // Determine filename based on context.
        $filename = 'transactions_';
        if ( ! empty( $ids ) ) {
            $filename .= 'selected_';
        } elseif ( ! empty( $page ) ) {
            $filename .= 'page_' . $page . '_';
        } else {
            $filename .= 'all_';
        }

        // Add store ID to filename if available.
        if ( ! empty( $store_id ) ) {
            $filename .= 'store_' . $store_id . '_';
        }

        $filename .= gmdate( 'Y-m-d' ) . '.csv';

        // Send headers for browser download.
        header( 'Content-Type: text/csv; charset=UTF-8' );
        header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
        header( 'Pragma: no-cache' );
        header( 'Expires: 0' );
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CSV must output raw data
        echo $csv;
        exit;
    }

    /**
     * Create transaction
     *
     * @param object $request Request object.
     */
    public function create_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error( 'invalid_nonce', __( 'Invalid nonce', 'multivendorx' ), array( 'status' => 403 ) );
        }
    }

    /**
     * Get store balance
     *
     * @param object $request Request object.
     */
    public function get_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        $store_id = absint( $request->get_param( 'id' ) );

        if ( ! $store_id ) {
            return rest_ensure_response(
                array(
					'balance'          => 0,
					'locking_balance'  => 0,
					'lifetime_earning' => 0,
                )
            );
        }

        global $wpdb;
        $table_name = "{$wpdb->prefix}" . Utill::TABLES['transaction'];

        // Fetch last transaction row for the store.
        $last_transaction = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT balance, locking_balance 
                 FROM $table_name 
                 WHERE store_id = %d 
                 ORDER BY created_at DESC 
                 LIMIT 1",
                $store_id
            ),
            ARRAY_A
        );

        $balance         = isset( $last_transaction['balance'] ) ? $last_transaction['balance'] : 0;
        $locking_balance = isset( $last_transaction['locking_balance'] ) ? $last_transaction['locking_balance'] : 0;

        // Calculate total lifetime earnings (sum of all amounts).
        $total_earning = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(amount) 
                 FROM $table_name 
                 WHERE store_id = %d",
                $store_id
            )
        );

        $total_earning = $total_earning ? $total_earning : 0;

        // Lifetime earning minus locking balance.
        $lifetime_earning = $total_earning - $locking_balance;

        $payout_threshold = MultiVendorX()->setting->get_setting( 'payout_threshold_amount', 0 );

        // If it's an array, take first value, else use as is.
        if ( is_array( $payout_threshold ) ) {
            $payout_threshold = reset( $payout_threshold ) ? reset( $payout_threshold ) : 0;
        }

        $payout_threshold      = floatval( $payout_threshold );
        $minimum_wallet_amount = MultiVendorX()->setting->get_setting( 'wallet_threshold_amount', 0 );
        $locking_day           = MultiVendorX()->setting->get_setting( 'commission_lock_period', 0 );
        $payment_schedules     = MultiVendorX()->setting->get_setting( 'payment_schedules', '' );
        $withdrawals_fees      = MultiVendorX()->setting->get_setting( 'withdrawals_fees', array() );
        $store                 = Store::get_store( $store_id );

        return rest_ensure_response(
            array(
				'wallet_balance'     => $balance,
				'reserve_balance'    => $minimum_wallet_amount,
				'thresold'           => $payout_threshold,
				'available_balance'  => max( 0, $balance - $minimum_wallet_amount ),
				'balance'            => $balance,
				'locking_day'        => $locking_day,
				'locking_balance'    => $locking_balance,
				'lifetime_earning'   => $lifetime_earning,
				'payment_schedules'  => $payment_schedules,
				'free_withdrawal'    => (int) $store->get_meta( Utill::STORE_SETTINGS_KEYS['withdrawals_count'] ),
				'withdrawal_setting' => $withdrawals_fees,
            )
        );
    }

    /**
     * Update item endpoint handler. This method handles both approve and reject actions.
     *
     * @param object $request Full details about the request.
     */
    public function update_item( $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new \WP_Error(
                'invalid_nonce',
                __( 'Invalid nonce', 'multivendorx' ),
                array( 'status' => 403 )
            );
        }

        $store_id = absint( $request->get_param( 'store_id' ) );
        $amount   = (float) $request->get_param( 'amount' );
        $withdraw = $request->get_param( 'withdraw' );
        $action   = $request->get_param( 'action' );

        $store        = new \MultiVendorX\Store\Store( $store_id );
        $disbursement = $request->get_param( 'disbursement' );

        $threshold_amount = MultiVendorX()->setting->get_setting( 'payout_threshold_amount', 0 );
        if ( $disbursement ) {
            $method = $request->get_param( 'method' );
            $note   = $request->get_param( 'note' );

            if ( $threshold_amount < $amount ) {
                MultiVendorX()->payments->processor->process_payment( $store_id, $amount, null, $method, $note );
                return rest_ensure_response(
                    array(
						'success' => true,
						'id'      => $store_id,
                    )
                );
            }
        }

        if ( $withdraw ) {
            if ( 'approve' === $action && $threshold_amount < $amount ) {
                MultiVendorX()->payments->processor->process_payment( $store_id, $amount );
            } else {
                $parameters = array(
                    'store_email' => 'test@gmail.com',
                    'store_id'    => $store_id,
                    'category'    => 'activity',
                );

                do_action( 'multivendorx_notify_payout_rejected', 'new_store_approval', $parameters );
            }

            $store->delete_meta( Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] );

            return rest_ensure_response(
                array(
					'success' => true,
					'id'      => $store_id,
                )
            );
        }

        // Check if a withdrawal request already exists.
        $existing_request = $store->get_meta( Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'] );
        if ( $existing_request ) {
            return rest_ensure_response(
                array(
					'success' => false,
					'message' => __( 'You already have a pending withdrawal request.', 'multivendorx' ),
					'id'      => $store_id,
                )
            );
        }

        $withdraw_type = MultiVendorX()->setting->get_setting( 'withdraw_type', 'manual' );

        $should_update_meta = true;

        if ( 'automatic' === $withdraw_type && $threshold_amount < $amount ) {
            $payment_method = $store->get_meta( 'payment_method' ) ?? '';

            if ( 'stripe-connect' === ! empty( $payment_method ) && ( $payment_method || 'paypal-payout' === $payment_method ) ) {
                do_action( "multivendorx_process_{$payment_method}_payment", $store_id, $amount, null, null, null );
            } else {
                $should_update_meta = true;
            }
        }

        if ( $should_update_meta ) {
            $store->update_meta( Utill::STORE_SETTINGS_KEYS['request_withdrawal_amount'], $amount );
        }

        return rest_ensure_response(
            array(
				'success' => true,
				'id'      => $store_id,
				'message' => __( 'Withdrawal request submitted successfully.', 'multivendorx' ),
            )
        );
    }
}
