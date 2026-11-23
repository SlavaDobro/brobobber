<?php
/**
 * Plugin Name:       Brobobber Core
 * Description:       Контент мастерской Brobobber: проекты, услуги, стили, контакты, тексты, заявки с сайта и импорт материалов. Работает вместе с темой Brobobber.
 * Version:           1.0.0
 * Requires at least: 6.8
 * Tested up to:      7.1
 * Requires PHP:      7.4
 * Author:            Brobobber
 * License:           GPL-2.0-or-later
 * Text Domain:       brobobber-core
 */

defined( 'ABSPATH' ) || exit;

define( 'BBC_VERSION', '1.0.0' );
define( 'BBC_FILE', __FILE__ );
define( 'BBC_DIR', plugin_dir_path( __FILE__ ) );
define( 'BBC_URL', plugin_dir_url( __FILE__ ) );

require_once BBC_DIR . 'includes/texts.php';
require_once BBC_DIR . 'includes/content-types.php';
require_once BBC_DIR . 'includes/api.php';
require_once BBC_DIR . 'includes/fields.php';
require_once BBC_DIR . 'includes/meta-boxes.php';
require_once BBC_DIR . 'includes/settings.php';
require_once BBC_DIR . 'includes/requests.php';
require_once BBC_DIR . 'includes/importer.php';

register_activation_hook(
	__FILE__,
	static function () {
		bbc_register_content_types();
		bbc_register_request_type();
		flush_rewrite_rules();
		if ( ! get_option( 'bbc_import_done' ) ) {
			set_transient( 'bbc_go_to_import', 1, MINUTE_IN_SECONDS );
		}
	}
);

register_deactivation_hook( __FILE__, 'flush_rewrite_rules' );

// After activation, take the administrator straight to the import screen.
add_action(
	'admin_init',
	static function () {
		if ( get_transient( 'bbc_go_to_import' ) && current_user_can( 'manage_options' ) && ! wp_doing_ajax() && ! isset( $_GET['activate-multi'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
			delete_transient( 'bbc_go_to_import' );
			wp_safe_redirect( admin_url( 'admin.php?page=brobobber&tab=import' ) );
			exit;
		}
	}
);

// WebP sub-sizes keep the fine detail of engines and spokes.
add_filter(
	'wp_editor_set_quality',
	static function ( $quality, $mime ) {
		return 'image/webp' === $mime ? 86 : $quality;
	},
	10,
	2
);

// A very small copy fills the frame around a photo that is shown whole.
add_action(
	'after_setup_theme',
	static function () {
		add_image_size( 'bb-blur', 48, 48, false );
	}
);
