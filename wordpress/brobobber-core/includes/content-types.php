<?php
/**
 * Projects, services and motorcycle styles.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

/** Registers the public content types; their addresses match the original site. */
function bbc_register_content_types() {
	$types = array(
		'bb_project' => array( 'Проекты', 'Проект', 'proekty', 'dashicons-format-gallery', array( 'title', 'editor', 'thumbnail', 'page-attributes' ) ),
		'bb_service' => array( 'Услуги', 'Услуга', 'uslugi', 'dashicons-admin-tools', array( 'title', 'thumbnail', 'page-attributes' ) ),
		'bb_style'   => array( 'Стили мотоциклов', 'Стиль', 'motocikly', 'dashicons-star-filled', array( 'title', 'thumbnail', 'page-attributes' ) ),
	);
	$position = 21;
	foreach ( $types as $type => $t ) {
		register_post_type(
			$type,
			array(
				'labels'        => array(
					'name'               => $t[0],
					'singular_name'      => $t[1],
					'menu_name'          => $t[0],
					'add_new'            => 'Добавить',
					'add_new_item'       => 'Добавить: ' . mb_strtolower( $t[1] ),
					'edit_item'          => 'Редактировать: ' . mb_strtolower( $t[1] ),
					'new_item'           => $t[1],
					'view_item'          => 'Открыть на сайте',
					'search_items'       => 'Найти',
					'not_found'          => 'Ничего не найдено',
					'not_found_in_trash' => 'В корзине пусто',
					'all_items'          => 'Все',
					'featured_image'     => 'Главное фото',
					'set_featured_image' => 'Выбрать главное фото',
				),
				'public'        => true,
				'has_archive'   => $t[2],
				'rewrite'       => array( 'slug' => $t[2], 'with_front' => false ),
				'menu_icon'     => $t[3],
				'menu_position' => $position++,
				'supports'      => $t[4],
				'hierarchical'  => false,
			)
		);
	}
}
add_action( 'init', 'bbc_register_content_types' );

// The fields live in classic meta boxes, next to the text editor.
add_filter(
	'use_block_editor_for_post_type',
	static function ( $use, $type ) {
		return in_array( $type, array( 'bb_project', 'bb_service', 'bb_style' ), true ) ? false : $use;
	},
	10,
	2
);

// Lists follow the manual order set in the "Порядок" field.
add_action(
	'pre_get_posts',
	static function ( $query ) {
		if ( ! $query->is_main_query() ) {
			return;
		}
		$type = $query->get( 'post_type' );
		if ( in_array( $type, array( 'bb_project', 'bb_service', 'bb_style' ), true ) && ! $query->get( 'orderby' ) ) {
			$query->set( 'orderby', array( 'menu_order' => 'ASC', 'date' => 'DESC' ) );
			if ( ! is_admin() ) {
				$query->set( 'posts_per_page', -1 );
			}
		}
	}
);
