<?php
/**
 * Edit screens of projects, services and styles.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Fields of each content type.
 *
 * @return array<string, array>
 */
function bbc_post_fields() {
	return array(
		'bb_project' => array(
			array( 'gallery', 'gallery', 'Фотографии (первая — обложка)' ),
			array( 'brand', 'text', 'Марка' ),
			array( 'style', 'style', 'Стиль' ),
			array( 'year', 'text', 'Год' ),
			array( 'works', 'lines', 'Что сделали (каждая работа с новой строки)' ),
			array(
				'specs',
				'rows',
				'Цифры проекта',
				array(
					'value' => array( 'Значение', 'text' ),
					'unit'  => array( 'Единица', 'text' ),
					'label' => array( 'Подпись', 'text' ),
				),
			),
			array( 'post', 'url', 'Ссылка на пост в Telegram' ),
			array( 'video', 'video', 'Ролик о проекте' ),
		),
		'bb_service' => array(
			array( 'short', 'text', 'Коротко (в списках и на схеме)' ),
			array( 'lead', 'textarea', 'Описание вверху страницы' ),
			array( 'points', 'lines', 'Что входит (каждый пункт с новой строки)' ),
			array( 'gallery', 'gallery', 'Галерея «Из мастерской»' ),
			array( 'video', 'video', 'Ролик «Как это делаем»' ),
			array( 'video_title', 'text', 'Подпись к ролику' ),
			array( 'video_post', 'url', 'Ссылка на пост с роликом' ),
			array( 'projects', 'projects', 'Работы по этой услуге' ),
			array( 'spot_x', 'number', 'Отметка на схеме мотоцикла: слева, % (пусто — услуга станет кнопкой под схемой)' ),
			array( 'spot_y', 'number', 'Отметка на схеме мотоцикла: сверху, %' ),
		),
		'bb_style'   => array(
			array( 'lead', 'textarea', 'Описание стиля' ),
			array(
				'traits',
				'rows',
				'Особенности стиля',
				array(
					'term'  => array( 'Параметр', 'text' ),
					'value' => array( 'Значение', 'text' ),
				),
			),
			array( 'credit_author', 'text', 'Автор фото (если фото не ваше)' ),
			array( 'credit_page', 'url', 'Ссылка на источник фото' ),
			array( 'credit_license', 'text', 'Лицензия фото' ),
			array( 'credit_url', 'url', 'Ссылка на лицензию' ),
		),
	);
}

add_action(
	'add_meta_boxes',
	static function () {
		foreach ( bbc_post_fields() as $type => $fields ) {
			add_meta_box(
				'bbc_fields',
				'Данные',
				static function ( $post ) use ( $fields ) {
					wp_nonce_field( 'bbc_save_post', 'bbc_post_nonce' );
					echo '<div class="bbc-box">';
					foreach ( $fields as $field ) {
						bbc_render_field( $field, get_post_meta( $post->ID, '_bb_' . $field[0], true ), 'bbc' );
					}
					echo '</div>';
				},
				$type,
				'normal',
				'high'
			);
		}
	}
);

// The text editor of a project holds its story.
add_action(
	'edit_form_after_title',
	static function ( $post ) {
		if ( 'bb_project' === $post->post_type ) {
			echo '<h2 style="padding:14px 0 4px;font-size:15px;font-weight:600">История проекта</h2>';
		}
	}
);

add_action(
	'save_post',
	static function ( $post_id, $post ) {
		$all = bbc_post_fields();
		if ( ! isset( $all[ $post->post_type ], $_POST['bbc_post_nonce'] ) || wp_is_post_revision( $post_id ) || ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) ) {
			return;
		}
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bbc_post_nonce'] ) ), 'bbc_save_post' ) || ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
		$input = isset( $_POST['bbc'] ) ? wp_unslash( $_POST['bbc'] ) : array(); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- cleaned per field below.
		foreach ( $all[ $post->post_type ] as $field ) {
			$value = bbc_clean_field( $field[1], $input[ $field[0] ] ?? '', $field[3] ?? null );
			if ( array() === $value || '' === $value || 0 === $value ) {
				delete_post_meta( $post_id, '_bb_' . $field[0] );
			} else {
				update_post_meta( $post_id, '_bb_' . $field[0], $value );
			}
		}
		// The first gallery photo of a project is its cover everywhere on the site.
		if ( 'bb_project' === $post->post_type ) {
			$gallery = (array) get_post_meta( $post_id, '_bb_gallery', true );
			if ( ! empty( $gallery[0] ) ) {
				set_post_thumbnail( $post_id, (int) $gallery[0] );
			}
		}
	},
	10,
	2
);
