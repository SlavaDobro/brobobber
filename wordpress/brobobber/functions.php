<?php
/**
 * Brobobber theme setup.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

define( 'BB_THEME_VERSION', '1.0.0' );

require_once get_template_directory() . '/inc/components.php';

add_action(
	'after_setup_theme',
	static function () {
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
		add_theme_support( 'responsive-embeds' );
		register_nav_menus( array( 'primary' => 'Главное меню' ) );
	}
);

add_action(
	'wp_enqueue_scripts',
	static function () {
		$uri = get_template_directory_uri();
		$dir = get_template_directory();
		wp_enqueue_style( 'brobobber-site', $uri . '/assets/css/site.css', array(), (string) filemtime( $dir . '/assets/css/site.css' ) );
		wp_enqueue_style( 'brobobber-theme', $uri . '/assets/css/theme.css', array( 'brobobber-site' ), (string) filemtime( $dir . '/assets/css/theme.css' ) );
		wp_enqueue_script( 'brobobber-site', $uri . '/assets/js/site.js', array(), (string) filemtime( $dir . '/assets/js/site.js' ), array( 'strategy' => 'defer', 'in_footer' => true ) );
		wp_localize_script( 'brobobber-site', 'bbSite', array( 'requestUrl' => esc_url_raw( rest_url( 'brobobber/v1/request' ) ) ) );
		// The design has its own styles; the block defaults would only add weight and conflicts.
		foreach ( array( 'wp-block-library', 'wp-block-library-theme', 'global-styles', 'classic-theme-styles' ) as $handle ) {
			wp_dequeue_style( $handle );
		}
	},
	20
);

remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
remove_action( 'wp_head', 'wp_generator' );

// Fonts of the first screen load before the text is painted.
add_action(
	'wp_head',
	static function () {
		$fonts = get_template_directory_uri() . '/assets/fonts/';
		foreach ( array( 'tektur-cyrillic-wdth-normal.woff2', 'golos-text-cyrillic-wght-normal.woff2' ) as $font ) {
			echo '<link rel="preload" href="' . esc_url( $fonts . $font ) . '" as="font" type="font/woff2" crossorigin>' . "\n";
		}
		// The roller door must already be down when a page opens after a transition.
		echo "<script>try{if(sessionStorage.getItem('bb-door'))document.documentElement.classList.add('bb-door-down')}catch(e){}</script>\n";
	},
	1
);

add_action( 'wp_head', 'bb_meta_tags', 2 );

/** Meta description, unless an SEO plugin is in charge. */
function bb_meta_tags() {
	if ( defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || ! bb_core_ready() ) {
		return;
	}
	$text = '';
	if ( is_front_page() ) {
		$text = 'Кастомизация, тюнинг и обслуживание мотоциклов: Harley-Davidson, Triumph, Yamaha, BMW и другие. Мастерская в Москве, ' . bbc_contacts()['address_short'] . '.';
	} elseif ( is_singular( 'bb_project' ) ) {
		$project = bbc_project( get_queried_object_id() );
		$count   = count( $project['works'] );
		if ( $count ) {
			$text = $project['name'] . ': ' . $count . ' ' . bbc_plural( $count, array( 'работа', 'работы', 'работ' ) ) . ' в мастерской Brobobber. ' . implode( '. ', array_slice( $project['works'], 0, 3 ) ) . '.';
		} else {
			$text = $project['name'] . ' — проект мастерской Brobobber. ' . wp_strip_all_tags( get_post_field( 'post_content', $project['id'] ) );
		}
	} elseif ( is_singular( 'bb_service' ) ) {
		$service = bbc_service( get_queried_object_id() );
		$text    = $service['name'] . ': ' . $service['short'] . ' Мастерская Brobobber, Москва.';
	} elseif ( is_singular( 'bb_style' ) ) {
		$style = bbc_style( get_queried_object_id() );
		$text  = $style['name'] . ': ' . $style['lead'] . ' Кастомизация в мастерской Brobobber, Москва.';
	} elseif ( is_post_type_archive( 'bb_project' ) ) {
		$text = 'Мотоциклы, которые прошли через мастерскую Brobobber: Harley-Davidson V-Rod, Triumph Rocket 3R, BMW K100, Yamaha V-Max и другие — со списком работ и фото.';
	} elseif ( is_post_type_archive( 'bb_service' ) ) {
		$text = 'Кастомизация, тюнинг, обслуживание и ремонт, прошивка ЭБУ, сиденья, электроника, детейлинг, мотоэвакуатор. Мастерская Brobobber в Москве.';
	} elseif ( is_post_type_archive( 'bb_style' ) ) {
		$text = 'Боббер, чоппер, кафе-рейсер, скрэмблер, бэггер, маскл, клаб-стайл, чикано: стили, с которыми работает мастерская Brobobber.';
	} elseif ( is_page_template( 'templates/about.php' ) ) {
		$text = 'Brobobber — студия кастомайзинга мотоциклов в Москве. Техническое мастерство и стильный дизайн, 3D-моделирование и ЧПУ, гарантия год.';
	} elseif ( is_page_template( 'templates/process.php' ) ) {
		$text = 'Восемь этапов кастомизации в Brobobber: консультация, концепция, техзадание и смета, договор, работы, проверка и передача, обслуживание после.';
	} elseif ( is_page_template( 'templates/contacts.php' ) ) {
		$c    = bbc_contacts();
		$text = 'Brobobber: ' . $c['address'] . '. ' . ( $c['phones'][0]['name'] ?? '' ) . ' ' . ( $c['phones'][0]['phone'] ?? '' ) . ', ' . $c['email'] . '.';
	}
	if ( $text ) {
		echo '<meta name="description" content="' . esc_attr( mb_substr( trim( preg_replace( '/\s+/u', ' ', $text ) ), 0, 300 ) ) . '">' . "\n";
	}
	if ( is_page() && (int) get_option( 'wp_page_for_privacy_policy' ) === get_queried_object_id() ) {
		echo '<meta name="robots" content="noindex">' . "\n";
	}
}

// Page titles as on the original site.
add_filter(
	'pre_get_document_title',
	static function ( $title ) {
		if ( defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) ) {
			return $title;
		}
		if ( is_front_page() ) {
			return 'Brobobber — кастом-ателье мотоциклов в Москве';
		}
		if ( is_singular( 'bb_project' ) ) {
			return single_post_title( '', false ) . ' — проект Brobobber';
		}
		if ( is_singular( 'bb_style' ) ) {
			$name = single_post_title( '', false );
			return $name . ' — кастом в стиле ' . mb_strtolower( $name ) . ' | Brobobber';
		}
		if ( is_post_type_archive( 'bb_project' ) ) {
			return 'Наши проекты — Brobobber';
		}
		if ( is_post_type_archive( 'bb_service' ) ) {
			return 'Услуги — Brobobber';
		}
		if ( is_post_type_archive( 'bb_style' ) ) {
			return 'Мотоциклы и стили кастома — Brobobber';
		}
		if ( is_404() ) {
			return 'Страница не найдена — Brobobber';
		}
		return is_singular() ? single_post_title( '', false ) . ' — Brobobber' : $title;
	}
);

/** True when the plugin with the content is active. */
function bb_core_ready() {
	return function_exists( 'bbc_contacts' );
}

// Without the plugin there is no content to show: say so instead of breaking.
add_filter(
	'template_include',
	static function ( $template ) {
		return bb_core_ready() ? $template : get_template_directory() . '/templates/plugin-required.php';
	},
	99
);

add_action(
	'admin_notices',
	static function () {
		if ( ! bb_core_ready() && current_user_can( 'activate_plugins' ) ) {
			echo '<div class="notice notice-error"><p><strong>Тема Brobobber:</strong> установите и активируйте плагин Brobobber Core, в нём хранится контент сайта.</p></div>';
		}
	}
);
