<?php
/**
 * The "Brobobber" admin screen: contacts, texts, lists, page photos, videos and import.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

/** Tabs of the screen. */
function bbc_tabs() {
	return array(
		'contacts' => 'Контакты',
		'texts'    => 'Тексты страниц',
		'lists'    => 'Этапы, FAQ, отзывы',
		'images'   => 'Фото страниц',
		'videos'   => 'Ролики',
		'import'   => 'Импорт',
	);
}

/** Contact fields. */
function bbc_contact_fields() {
	return array(
		array(
			'phones',
			'rows',
			'Мастера (первый показан в шапке)',
			array(
				'name'     => array( 'Имя', 'text' ),
				'phone'    => array( 'Телефон', 'text' ),
				'telegram' => array( 'Telegram без @', 'text' ),
			),
		),
		array( 'hours', 'text', 'Время работы (полностью, например «Ежедневно с 10:00 до 20:00»)' ),
		array( 'hours_short', 'text', 'Время работы для шапки (коротко, например «Ежедневно 10–20»)' ),
		array( 'email', 'email', 'Почта на сайте' ),
		array( 'requests_email', 'email', 'Почта для заявок с сайта' ),
		array( 'channel_url', 'url', 'Telegram-канал: ссылка' ),
		array( 'channel_handle', 'text', 'Telegram-канал: название (@...)' ),
		array( 'address', 'textarea', 'Адрес полностью' ),
		array( 'address_short', 'text', 'Адрес коротко (в шапке)' ),
		array( 'postal', 'text', 'Индекс' ),
	);
}

/** Editable lists. */
function bbc_list_fields() {
	return array(
		array( 'process', 'rows', 'Этапы работы', array( 'title' => array( 'Этап', 'text' ), 'text' => array( 'Описание', 'textarea' ) ) ),
		array( 'advantages', 'rows', 'Преимущества', array( 'title' => array( 'Заголовок', 'text' ), 'text' => array( 'Текст', 'textarea' ) ) ),
		array( 'faq', 'rows', 'Частые вопросы', array( 'q' => array( 'Вопрос', 'text' ), 'a' => array( 'Ответ', 'textarea' ) ) ),
		array( 'reviews', 'rows', 'Отзывы', array( 'author' => array( 'Автор', 'text' ), 'text' => array( 'Отзыв', 'textarea' ) ) ),
	);
}

/** Page photo fields. */
function bbc_image_fields() {
	return array(
		array( 'showcase', 'rows', 'Слайды на главной', array( 'project' => array( 'Проект', 'project' ), 'photo' => array( 'Фото', 'image' ) ) ),
		array( 'about', 'image', 'Главная и «О нас»: фото мастеров' ),
		array( 'philosophy', 'image', '«О нас»: блок «Наша философия»' ),
		array( 'about_hero', 'image', '«О нас»: верх страницы' ),
		array( 'services_hero', 'image', '«Услуги»: верх страницы' ),
		array( 'projects_hero', 'image', '«Проекты»: верх страницы' ),
		array( 'styles_hero', 'image', '«Мотоциклы»: верх страницы' ),
		array( 'process_hero', 'image', '«Процесс»: верх страницы' ),
		array( 'workshop', 'gallery', '«Процесс»: фото из мастерской' ),
		array( 'tiles', 'projects', '«Услуги»: плитка проектов' ),
	);
}

/** Video rows. */
function bbc_video_columns() {
	return array(
		'title'    => array( 'Подпись', 'text' ),
		'duration' => array( 'Длительность', 'text' ),
		'post'     => array( 'Пост в Telegram', 'url' ),
		'video'    => array( 'Видео', 'video' ),
		'poster'   => array( 'Обложка', 'image' ),
	);
}

add_action(
	'admin_menu',
	static function () {
		add_menu_page( 'Brobobber', 'Brobobber', 'manage_options', 'brobobber', 'bbc_settings_page', 'dashicons-admin-generic', 20 );
		foreach ( bbc_tabs() as $tab => $label ) {
			add_submenu_page( 'brobobber', $label, $label, 'manage_options', 'contacts' === $tab ? 'brobobber' : 'brobobber&tab=' . $tab, 'contacts' === $tab ? 'bbc_settings_page' : '__return_null' );
		}
	}
);

/** Prints the settings screen. */
function bbc_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$tabs = bbc_tabs();
	$tab  = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'contacts'; // phpcs:ignore WordPress.Security.NonceVerification
	$tab  = isset( $tabs[ $tab ] ) ? $tab : 'contacts';
	echo '<div class="wrap bbc-settings"><h1>Brobobber</h1>';
	if ( isset( $_GET['saved'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		echo '<div class="notice notice-success is-dismissible"><p>Сохранено.</p></div>';
	}
	echo '<nav class="nav-tab-wrapper">';
	foreach ( $tabs as $key => $label ) {
		echo '<a class="nav-tab' . ( $key === $tab ? ' nav-tab-active' : '' ) . '" href="' . esc_url( admin_url( 'admin.php?page=brobobber&tab=' . $key ) ) . '">' . esc_html( $label ) . '</a>';
	}
	echo '</nav>';
	if ( 'import' === $tab ) {
		bbc_import_screen();
		echo '</div>';
		return;
	}
	echo '<form method="post" action="' . esc_url( admin_url( 'admin-post.php' ) ) . '" class="bbc-box">';
	echo '<input type="hidden" name="action" value="bbc_save_settings"><input type="hidden" name="tab" value="' . esc_attr( $tab ) . '">';
	wp_nonce_field( 'bbc_save_settings' );
	if ( 'contacts' === $tab ) {
		$contacts = bbc_contacts();
		foreach ( bbc_contact_fields() as $field ) {
			bbc_render_field( $field, $contacts[ $field[0] ] ?? '', 'bbc' );
		}
	} elseif ( 'texts' === $tab ) {
		$saved = (array) get_option( 'bbc_texts', array() );
		foreach ( bbc_text_catalogue() as $group => $items ) {
			echo '<h2>' . esc_html( $group ) . '</h2>';
			foreach ( $items as $key => $item ) {
				$type = empty( $item[2] ) ? 'text' : 'textarea';
				bbc_render_field( array( $key, $type, $item[0] ), $saved[ $key ] ?? $item[1], 'bbc' );
			}
		}
	} elseif ( 'lists' === $tab ) {
		foreach ( bbc_list_fields() as $field ) {
			bbc_render_field( $field, bbc_list( $field[0] ), 'bbc' );
		}
	} elseif ( 'images' === $tab ) {
		foreach ( bbc_image_fields() as $field ) {
			bbc_render_field( $field, bbc_image( $field[0] ), 'bbc' );
		}
	} elseif ( 'videos' === $tab ) {
		bbc_render_field( array( 'videos', 'rows', 'Ролики в блоке «Жизнь мастерской»', bbc_video_columns() ), get_option( 'bbc_videos', array() ), 'bbc' );
	}
	submit_button( 'Сохранить' );
	echo '</form></div>';
}

add_action(
	'admin_post_bbc_save_settings',
	static function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( 'Недостаточно прав.', '', array( 'response' => 403 ) );
		}
		check_admin_referer( 'bbc_save_settings' );
		$tab   = isset( $_POST['tab'] ) ? sanitize_key( $_POST['tab'] ) : 'contacts';
		$input = isset( $_POST['bbc'] ) ? wp_unslash( $_POST['bbc'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- cleaned per field below.
		$clean = static function ( $fields ) use ( $input ) {
			$out = array();
			foreach ( $fields as $field ) {
				$out[ $field[0] ] = bbc_clean_field( $field[1], $input[ $field[0] ] ?? '', $field[3] ?? null );
			}
			return $out;
		};
		if ( 'contacts' === $tab ) {
			update_option( 'bbc_contacts', $clean( bbc_contact_fields() ) );
		} elseif ( 'texts' === $tab ) {
			$texts = array();
			foreach ( bbc_text_catalogue() as $items ) {
				foreach ( $items as $key => $item ) {
					$texts[ $key ] = bbc_clean_field( empty( $item[2] ) ? 'text' : 'textarea', $input[ $key ] ?? '' );
				}
			}
			update_option( 'bbc_texts', $texts );
		} elseif ( 'lists' === $tab ) {
			update_option( 'bbc_lists', $clean( bbc_list_fields() ) );
		} elseif ( 'images' === $tab ) {
			update_option( 'bbc_images', $clean( bbc_image_fields() ) );
		} elseif ( 'videos' === $tab ) {
			update_option( 'bbc_videos', bbc_clean_field( 'rows', $input['videos'] ?? array(), bbc_video_columns() ) );
		}
		wp_safe_redirect( admin_url( 'admin.php?page=brobobber&tab=' . $tab . '&saved=1' ) );
		exit;
	}
);
