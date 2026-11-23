<?php
/**
 * Read-only data access used by the theme.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

/** The content shipped with the plugin. */
function bbc_seed() {
	static $seed = null;
	if ( null === $seed ) {
		$raw  = file_get_contents( BBC_DIR . 'data/seed.json' ); // phpcs:ignore WordPress.WP.AlternativeFunctions
		$seed = $raw ? json_decode( $raw, true ) : array();
	}
	return $seed;
}

/** Contacts of the workshop. */
function bbc_contacts() {
	static $contacts = null;
	if ( null !== $contacts ) {
		return $contacts;
	}
	$seed     = bbc_seed()['contacts'] ?? array();
	$defaults = array(
		'phones'         => array_map(
			static function ( $p ) {
				return array( 'name' => $p['name'], 'phone' => $p['phone'], 'telegram' => $p['telegram'] );
			},
			$seed['phones'] ?? array()
		),
		'email'          => $seed['email'] ?? '',
		'requests_email' => $seed['email'] ?? '',
		'channel_url'    => $seed['channel']['href'] ?? '',
		'channel_handle' => $seed['channel']['handle'] ?? '',
		'address'        => $seed['address'] ?? '',
		'address_short'  => $seed['address_short'] ?? '',
		'postal'         => $seed['postal'] ?? '',
		'hours'          => $seed['hours'] ?? '',
		'hours_short'    => $seed['hours_short'] ?? '',
	);
	$saved    = get_option( 'bbc_contacts', array() );
	$contacts = array_merge( $defaults, is_array( $saved ) ? $saved : array() );
	foreach ( $contacts['phones'] as &$person ) {
		$person['href'] = 'tel:' . preg_replace( '/[^\d+]/', '', $person['phone'] );
	}
	unset( $person );
	$query             = rawurlencode( trim( $contacts['postal'] . ', ' . $contacts['address'], ', ' ) );
	$contacts['maps']  = array(
		'yandex' => 'https://yandex.ru/maps/?text=' . $query,
		'google' => 'https://www.google.com/maps/search/?api=1&query=' . rawurlencode( $contacts['address'] ),
		'widget' => 'https://yandex.ru/map-widget/v1/?z=15&text=' . $query,
	);
	return $contacts;
}

/**
 * A text of the fixed pages.
 *
 * @param string $key Catalogue key.
 */
function bbc_text( $key ) {
	static $saved = null, $defaults = null;
	if ( null === $saved ) {
		$saved    = (array) get_option( 'bbc_texts', array() );
		$defaults = array();
		foreach ( bbc_text_catalogue() as $group ) {
			foreach ( $group as $k => $item ) {
				$defaults[ $k ] = $item[1];
			}
		}
	}
	$text = isset( $saved[ $key ] ) && '' !== $saved[ $key ] ? $saved[ $key ] : ( $defaults[ $key ] ?? '' );
	$name = bbc_contacts()['phones'][0]['name'] ?? '';
	return str_replace( '{name}', $name, $text );
}

/**
 * An editable list: process, advantages, faq or reviews.
 *
 * @param string $name List name.
 */
function bbc_list( $name ) {
	$lists = get_option( 'bbc_lists', array() );
	if ( isset( $lists[ $name ] ) && is_array( $lists[ $name ] ) ) {
		return $lists[ $name ];
	}
	return bbc_seed()[ $name ] ?? array();
}

/**
 * A photo chosen in the "Фото страниц" settings: an attachment id or a list.
 *
 * @param string $key Setting name.
 */
function bbc_image( $key ) {
	$images = get_option( 'bbc_images', array() );
	return $images[ $key ] ?? ( in_array( $key, array( 'workshop', 'showcase', 'tiles' ), true ) ? array() : 0 );
}

/**
 * Meta helper.
 *
 * @param int    $id   Post id.
 * @param string $name Field name.
 * @param mixed  $fallback Value when empty.
 */
function bbc_meta( $id, $name, $fallback = '' ) {
	$value = get_post_meta( $id, '_bb_' . $name, true );
	return '' === $value || null === $value ? $fallback : $value;
}

/**
 * Width / height of an attachment.
 *
 * @param int $id Attachment id.
 */
function bbc_aspect( $id ) {
	$meta = $id ? wp_get_attachment_metadata( $id ) : array();
	return ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ? round( $meta['width'] / $meta['height'], 3 ) : 0.75;
}

/**
 * Photos of a post, the main one first.
 *
 * @param int $id Post id.
 */
function bbc_gallery( $id ) {
	$gallery = array_values( array_filter( array_map( 'absint', (array) bbc_meta( $id, 'gallery', array() ) ), 'wp_attachment_is_image' ) );
	$thumb   = (int) get_post_thumbnail_id( $id );
	if ( $thumb && ! in_array( $thumb, $gallery, true ) ) {
		array_unshift( $gallery, $thumb );
	}
	return $gallery;
}

/**
 * All published posts of a type in manual order.
 *
 * @param string $type Post type.
 * @return WP_Post[]
 */
function bbc_posts( $type ) {
	static $cache = array();
	if ( ! isset( $cache[ $type ] ) ) {
		$cache[ $type ] = get_posts(
			array(
				'post_type'        => $type,
				'post_status'      => 'publish',
				'numberposts'      => -1,
				'orderby'          => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
				'suppress_filters' => false,
			)
		);
	}
	return $cache[ $type ];
}

/**
 * Project card data.
 *
 * @param int|WP_Post $post Project.
 */
function bbc_project( $post ) {
	$post    = get_post( $post );
	$gallery = bbc_gallery( $post->ID );
	$style   = (int) bbc_meta( $post->ID, 'style', 0 );
	$works   = (array) bbc_meta( $post->ID, 'works', array() );
	return array(
		'id'         => $post->ID,
		'slug'       => $post->post_name,
		'name'       => get_the_title( $post ),
		'url'        => get_permalink( $post ),
		'brand'      => (string) bbc_meta( $post->ID, 'brand' ),
		'style'      => $style,
		'style_name' => $style ? get_the_title( $style ) : '',
		'year'       => (string) bbc_meta( $post->ID, 'year' ),
		'specs'      => (array) bbc_meta( $post->ID, 'specs', array() ),
		'works'      => $works,
		'post'       => (string) bbc_meta( $post->ID, 'post' ),
		'video'      => (int) bbc_meta( $post->ID, 'video', 0 ),
		'gallery'    => $gallery,
		'cover'      => $gallery[0] ?? 0,
		'aspect'     => bbc_aspect( $gallery[0] ?? 0 ),
	);
}

/** All projects. */
function bbc_projects() {
	static $projects = null;
	if ( null === $projects ) {
		$projects = array_map( 'bbc_project', bbc_posts( 'bb_project' ) );
	}
	return $projects;
}

/**
 * Service data.
 *
 * @param int|WP_Post $post Service.
 */
function bbc_service( $post ) {
	$post = get_post( $post );
	$x    = bbc_meta( $post->ID, 'spot_x' );
	$y    = bbc_meta( $post->ID, 'spot_y' );
	return array(
		'id'       => $post->ID,
		'slug'     => $post->post_name,
		'name'     => get_the_title( $post ),
		'url'      => get_permalink( $post ),
		'short'    => (string) bbc_meta( $post->ID, 'short' ),
		'lead'     => (string) bbc_meta( $post->ID, 'lead' ),
		'points'   => (array) bbc_meta( $post->ID, 'points', array() ),
		'photo'    => (int) get_post_thumbnail_id( $post ),
		'gallery'  => array_values( array_filter( array_map( 'absint', (array) bbc_meta( $post->ID, 'gallery', array() ) ) ) ),
		'spot'     => '' !== $x && '' !== $y ? array( (float) $x, (float) $y ) : null,
		'projects' => array_map( 'absint', (array) bbc_meta( $post->ID, 'projects', array() ) ),
		'video'    => (int) bbc_meta( $post->ID, 'video', 0 ),
	);
}

/** All services. */
function bbc_services() {
	static $services = null;
	if ( null === $services ) {
		$services = array_map( 'bbc_service', bbc_posts( 'bb_service' ) );
	}
	return $services;
}

/**
 * Motorcycle style data.
 *
 * @param int|WP_Post $post Style.
 */
function bbc_style( $post ) {
	$post   = get_post( $post );
	$author = (string) bbc_meta( $post->ID, 'credit_author' );
	return array(
		'id'     => $post->ID,
		'slug'   => $post->post_name,
		'name'   => get_the_title( $post ),
		'url'    => get_permalink( $post ),
		'lead'   => (string) bbc_meta( $post->ID, 'lead' ),
		'traits' => (array) bbc_meta( $post->ID, 'traits', array() ),
		'photo'  => (int) get_post_thumbnail_id( $post ),
		'credit' => $author ? array(
			'author'      => $author,
			'page'        => (string) bbc_meta( $post->ID, 'credit_page' ),
			'license'     => (string) bbc_meta( $post->ID, 'credit_license' ),
			'license_url' => (string) bbc_meta( $post->ID, 'credit_url' ),
		) : null,
	);
}

/** All styles. */
function bbc_styles() {
	static $styles = null;
	if ( null === $styles ) {
		$styles = array_map( 'bbc_style', bbc_posts( 'bb_style' ) );
	}
	return $styles;
}

/** Workshop videos for the reel. */
function bbc_videos() {
	$videos = get_option( 'bbc_videos', array() );
	return is_array( $videos ) ? array_values(
		array_filter(
			$videos,
			static function ( $v ) {
				return ! empty( $v['video'] );
			}
		)
	) : array();
}

/**
 * Russian plural form.
 *
 * @param int      $n     Number.
 * @param string[] $forms One, few, many.
 */
function bbc_plural( $n, $forms ) {
	$a = abs( $n ) % 100;
	$b = $a % 10;
	if ( $a > 10 && $a < 20 ) {
		return $forms[2];
	}
	if ( 1 === $b ) {
		return $forms[0];
	}
	return $b >= 2 && $b <= 4 ? $forms[1] : $forms[2];
}
