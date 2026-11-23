<?php
/**
 * Requests from the site form: stored in the admin and sent by e-mail.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

/** Private type that holds the requests. */
function bbc_register_request_type() {
	register_post_type(
		'bb_request',
		array(
			'labels'          => array(
				'name'          => 'Заявки',
				'singular_name' => 'Заявка',
				'menu_name'     => 'Заявки',
				'edit_item'     => 'Заявка',
				'all_items'     => 'Все заявки',
				'not_found'     => 'Заявок пока нет',
				'search_items'  => 'Найти заявку',
			),
			'public'          => false,
			'show_ui'         => true,
			'menu_icon'       => 'dashicons-email-alt',
			'menu_position'   => 20,
			'supports'        => array( 'title' ),
			'capability_type' => 'post',
			'capabilities'    => array( 'create_posts' => 'do_not_allow' ),
			'map_meta_cap'    => true,
		)
	);
}
add_action( 'init', 'bbc_register_request_type' );

/**
 * Validates, stores and e-mails a request.
 *
 * @param array $raw Submitted fields.
 * @return true|WP_Error
 */
function bbc_handle_request( $raw ) {
	// Bots fill the hidden field and submit within a moment of loading the page.
	if ( ! empty( $raw['website'] ) ) {
		return true;
	}
	$started = isset( $raw['started'] ) ? (int) $raw['started'] : 0;
	if ( $started && time() - $started < 2 ) {
		return true;
	}
	$data = array(
		'name'    => sanitize_text_field( $raw['name'] ?? '' ),
		'phone'   => sanitize_text_field( $raw['phone'] ?? '' ),
		'bike'    => sanitize_text_field( $raw['bike'] ?? '' ),
		'service' => sanitize_text_field( $raw['service'] ?? '' ),
		'message' => sanitize_textarea_field( $raw['message'] ?? '' ),
		'page'    => esc_url_raw( $raw['page'] ?? '' ),
	);
	foreach ( array( 'name' => 120, 'phone' => 40, 'bike' => 160, 'service' => 160, 'message' => 3000 ) as $key => $limit ) {
		$data[ $key ] = mb_substr( $data[ $key ], 0, $limit );
	}
	if ( strlen( preg_replace( '/\D/', '', $data['phone'] ) ) < 6 ) {
		return new WP_Error( 'phone', 'Укажите телефон: по нему мастер перезвонит.', array( 'status' => 422 ) );
	}
	if ( empty( $raw['consent'] ) ) {
		return new WP_Error( 'consent', 'Отметьте согласие на обработку данных.', array( 'status' => 422 ) );
	}
	$ip     = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	$bucket = 'bbc_rate_' . md5( $ip . wp_salt( 'nonce' ) );
	$count  = (int) get_transient( $bucket );
	if ( $count >= 5 ) {
		return new WP_Error( 'rate', 'Слишком много заявок подряд. Позвоните нам или попробуйте позже.', array( 'status' => 429 ) );
	}
	set_transient( $bucket, $count + 1, 10 * MINUTE_IN_SECONDS );

	$title = trim( $data['phone'] . ( $data['name'] ? ' — ' . $data['name'] : '' ) );
	$id    = wp_insert_post(
		array(
			'post_type'   => 'bb_request',
			'post_status' => 'private',
			'post_title'  => $title,
		),
		true
	);
	if ( is_wp_error( $id ) ) {
		return new WP_Error( 'save', 'Не получилось отправить заявку. Позвоните нам.', array( 'status' => 500 ) );
	}
	foreach ( $data as $key => $value ) {
		update_post_meta( $id, '_bb_' . $key, $value );
	}

	$labels = bbc_request_labels();
	$lines  = array();
	foreach ( $labels as $key => $label ) {
		if ( '' !== $data[ $key ] ) {
			$lines[] = $label . ': ' . $data[ $key ];
		}
	}
	$contacts = bbc_contacts();
	$to       = $contacts['requests_email'] ? $contacts['requests_email'] : get_option( 'admin_email' );
	$subject  = 'Заявка с сайта: ' . ( $data['service'] ? $data['service'] : 'обсудить проект' );
	$sent     = wp_mail( $to, $subject, implode( "\n", $lines ) . "\n\nЗаявка в админке: " . admin_url( 'post.php?post=' . $id . '&action=edit' ) );
	update_post_meta( $id, '_bb_mailed', $sent ? 1 : 0 );
	return true;
}

/** Field names in the admin and in the e-mail. */
function bbc_request_labels() {
	return array(
		'name'    => 'Имя',
		'phone'   => 'Телефон',
		'bike'    => 'Мотоцикл',
		'service' => 'Услуга',
		'message' => 'Задача',
		'page'    => 'Страница',
	);
}

add_action(
	'rest_api_init',
	static function () {
		register_rest_route(
			'brobobber/v1',
			'/request',
			array(
				'methods'             => 'POST',
				'permission_callback' => '__return_true', // Public form: protected by a honeypot, timing and a rate limit.
				'callback'            => static function ( WP_REST_Request $request ) {
					$result = bbc_handle_request( $request->get_params() );
					return is_wp_error( $result ) ? $result : array( 'ok' => true );
				},
			)
		);
	}
);

// Without JavaScript the form posts here and returns to the same page.
$bbc_form_fallback = static function () {
	$result = bbc_handle_request( wp_unslash( $_POST ) ); // phpcs:ignore WordPress.Security.NonceVerification,WordPress.Security.ValidatedSanitizedInput -- public form, cleaned in the handler.
	$back   = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$back   = add_query_arg( 'request', is_wp_error( $result ) ? 'error' : 'sent', remove_query_arg( 'request', $back ) );
	wp_safe_redirect( $back . '#zayavka' );
	exit;
};
add_action( 'admin_post_nopriv_bbc_request', $bbc_form_fallback );
add_action( 'admin_post_bbc_request', $bbc_form_fallback );

add_filter(
	'manage_bb_request_posts_columns',
	static function () {
		return array(
			'cb'      => '<input type="checkbox">',
			'title'   => 'Телефон и имя',
			'bike'    => 'Мотоцикл',
			'service' => 'Услуга',
			'message' => 'Задача',
			'mailed'  => 'Письмо',
			'date'    => 'Дата',
		);
	}
);

add_action(
	'manage_bb_request_posts_custom_column',
	static function ( $column, $id ) {
		if ( 'mailed' === $column ) {
			echo get_post_meta( $id, '_bb_mailed', true ) ? 'отправлено' : '<span style="color:#b32d2e">не отправлено</span>';
			return;
		}
		echo esc_html( wp_trim_words( (string) get_post_meta( $id, '_bb_' . $column, true ), 14 ) );
	},
	10,
	2
);

add_action(
	'add_meta_boxes_bb_request',
	static function () {
		add_meta_box(
			'bbc_request',
			'Заявка',
			static function ( $post ) {
				echo '<table class="form-table">';
				foreach ( bbc_request_labels() as $key => $label ) {
					$value = (string) get_post_meta( $post->ID, '_bb_' . $key, true );
					if ( 'phone' === $key ) {
						$value = '<a href="tel:' . esc_attr( preg_replace( '/[^\d+]/', '', $value ) ) . '">' . esc_html( $value ) . '</a>';
					} else {
						$value = nl2br( esc_html( $value ) );
					}
					echo '<tr><th>' . esc_html( $label ) . '</th><td>' . wp_kses_post( $value ) . '</td></tr>';
				}
				echo '</table>';
			},
			'bb_request',
			'normal',
			'high'
		);
	}
);
