<?php
/**
 * Cron class file.
 *
 * @package MultiVendorX
 */

namespace MultiVendorX;

defined( 'ABSPATH' ) || exit;

/**
 * MultiVendorX Cron class
 *
 * @class       Cron class
 * @version     PRODUCT_VERSION
 * @author      MultiVendorX
 */
class Cron {

    public function __construct(){
        add_filter( 'cron_schedules', array($this, 'custom_cron_schedules') );
        add_action('multivendorx_after_save_settings', array($this, 'register_cron_based_on_settings'));

        if (!wp_next_scheduled('multivendorx_transaction_status_update')) {
            wp_schedule_event(time(), 'hourly', 'multivendorx_transaction_status_update');
        }

        if (!wp_next_scheduled('multivendorx_clear_notifications')) {
            wp_schedule_event(time(), 'daily', 'multivendorx_clear_notifications');
        }
    }

    public function custom_cron_schedules( $schedules ) {
        $schedules['weekly'] = [
            'interval' => WEEK_IN_SECONDS,
            'display'  => __( 'Once Weekly', 'multivendorx' ),
        ];
        $schedules['fortnightly'] = [
            'interval' => 2 * WEEK_IN_SECONDS,
            'display'  => __( 'Once Every Two Weeks', 'multivendorx' ),
        ];
        $schedules['monthly'] = [
            'interval' => MONTH_IN_SECONDS,
            'display'  => __( 'Once Monthly', 'multivendorx' ),
        ];
        return $schedules;
    }

    public function register_cron_based_on_settings() {
        $schedule_type = MultiVendorX()->setting->get_setting('payment_schedules');

        if (empty($schedule_type)) {
            return;
        }

        $settings = $this->normalize_settings($schedule_type);

        switch ($schedule_type) {
            case 'hourly':
                $this->register_cron('hourly', $settings);
                break;

            case 'daily':
                $this->register_cron('daily', $settings);
                break;

            case 'weekly':
                $this->register_cron('weekly', $settings);
                break;

            case 'fortnightly':
                $this->register_cron('fortnightly', $settings);
                break;

            case 'monthly':
                $this->register_cron('monthly', $settings);
                break;

            case 'manual':
            default:
                $this->deregister_cron();
                break;
        }
    }

    /**
     * Normalize settings structure from DB into a standard format
     */
    public function normalize_settings($type) {
        switch ($type) {
            case 'hourly':
                return [
                    'interval' => MultiVendorX()->setting->get_setting('disbursement_hourly') ? (int) MultiVendorX()->setting->get_setting('disbursement_hourly') : 1,
                ];

            case 'daily':
                $time = MultiVendorX()->setting->get_setting('daily_payout_time');
                return [
                    'time' => $time ?: '09:00',
                ];

            case 'weekly':
                $raw = reset(MultiVendorX()->setting->get_setting('disbursement_weekly')) ?? [];
                return [
                    'weekday' => $raw['weekly_payout_day']['value'] ?? 'monday',
                    'time'    => $raw['weekly_payout_time'] ?? '09:00',
                ];

            case 'fortnightly':
                $raw = reset(MultiVendorX()->setting->get_setting('disbursement_fortnightly')) ?? [];
                return [
                    'nth'     => $raw['payout_frequency'] ?? 'first',
                    'weekday' => $raw['payout_day']['value'] ?? 'monday',
                    'time'    => $raw['store_opening_time'] ?? '09:00',
                ];

            case 'monthly':
                $raw = reset(MultiVendorX()->setting->get_setting('disbursement_monthly')) ?? [];
                return [
                    'day_of_month' => isset($raw['payouts_every_month']) ? (int) $raw['payouts_every_month'] : 1,
                    'time'         => $raw['monthly_payout_time'] ?? '09:00',
                ];

            default:
                return [];
        }
    }

    public function get_first_run($schedule, $settings) {
        $hour   = isset($settings['time']) ? (int) date('H', strtotime($settings['time'])) : 9;
        $minute = isset($settings['time']) ? (int) date('i', strtotime($settings['time'])) : 0;

        switch ($schedule) {
            case 'daily':
                $ts = strtotime("today {$hour}:{$minute}");
                if ($ts <= time()) {
                    $ts = strtotime("tomorrow {$hour}:{$minute}");
                }
                return $ts;

            case 'weekly':
                $day = $settings['weekday'] ?? 'monday';
                $ts  = strtotime("next {$day} {$hour}:{$minute}");
                return $ts;

            case 'fortnightly':
                $nth = $settings['nth'] ?? 'first'; // e.g. first, second
                $day = $settings['weekday'] ?? 'monday';
                $ts  = strtotime("{$nth} {$day} of this month {$hour}:{$minute}");
                if ($ts <= time()) {
                    $ts = strtotime("{$nth} {$day} of next month {$hour}:{$minute}");
                }
                return $ts;

            case 'monthly':
                $date = !empty($settings['day_of_month']) ? (int) $settings['day_of_month'] : 1;
                $ts   = strtotime(date("Y-m-{$date} {$hour}:{$minute}:00"));
                if ($ts <= time()) {
                    $ts = strtotime("+1 month", $ts);
                }
                return $ts;

            case 'hourly':
                $interval = !empty($settings['interval']) ? (int) $settings['interval'] : 1;
                $now      = time();

                $current_minute = (int) date('i', $now);

                if ( $current_minute >= $interval ) {
                    $next = strtotime('+' . (60 - $current_minute + $interval) . ' minutes', $now);
                } else {
                    $next = strtotime('+' . ($interval - $current_minute) . ' minutes', $now);
                }

                return $next;

            default:
                return time() + MINUTE_IN_SECONDS;
        }
    }

    public function register_cron( $schedule, $settings ) {
        $hook = 'multivendorx_payout_cron';

        // Always clear old cron first
        wp_clear_scheduled_hook( $hook );

        $first_run = $this->get_first_run( $schedule, $settings );

        wp_schedule_event( $first_run, $schedule, $hook );
    }

    public function deregister_cron() {
        wp_clear_scheduled_hook( 'multivendorx_payout_cron' );
    }
}