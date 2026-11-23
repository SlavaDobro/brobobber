<?php
/**
 * One-time import of the site's content and media. Safe to repeat: what already exists is kept,
 * so edits made in the admin are never overwritten.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

const BBC_REMOTE_MEDIA = 'https://slavadobro.github.io/brobobber';

/** Folder with the unpacked media pack. */
function bbc_import_dir() {
	return trailingslashit( wp_get_upload_dir()['basedir'] ) . 'brobobber-import/';
}

/** Attachment ids by media pack path. */
function bbc_media_map() {
	return (array) get_option( 'bbc_media_map', array() );
}

/**
 * Address of a media file on the published static site.
 *
 * @param string $rel Media pack path.
 */
function bbc_remote_url( $rel ) {
	if ( 0 === strpos( $rel, 'photos/' ) ) {
		return BBC_REMOTE_MEDIA . '/images/' . preg_replace( '/\.webp$/', '-1600.webp', $rel );
	}
	return BBC_REMOTE_MEDIA . ( 0 === strpos( $rel, 'video/' ) ? '/' : '/images/' ) . $rel;
}

/**
 * Imports one media file into the Media Library.
 *
 * @param string $rel Media pack path.
 * @return int|WP_Error Attachment id.
 */
function bbc_import_file( $rel ) {
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	$local = bbc_import_dir() . $rel;
	if ( is_readable( $local ) ) {
		$tmp = wp_tempnam( basename( $rel ) );
		if ( ! $tmp || ! copy( $local, $tmp ) ) {
			return new WP_Error( 'copy', 'Не удалось прочитать ' . $rel );
		}
	} else {
		$tmp = download_url( bbc_remote_url( $rel ), 120 );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}
	}
	$file = array(
		'name'     => 'brobobber-' . str_replace( '/', '-', $rel ),
		'tmp_name' => $tmp,
	);
	$id = media_handle_sideload( $file, 0 );
	if ( is_wp_error( $id ) ) {
		wp_delete_file( $tmp );
		return $id;
	}
	update_post_meta( $id, '_bb_source', $rel );
	return $id;
}

/**
 * Imports media files for up to the given number of seconds.
 *
 * @param int $budget Seconds.
 * @return array Progress.
 */
function bbc_import_media_batch( $budget = 15 ) {
	$list   = bbc_seed()['media'] ?? array();
	$map    = bbc_media_map();
	$start  = microtime( true );
	$errors = array();
	foreach ( $list as $rel ) {
		if ( ! empty( $map[ $rel ] ) && get_post( $map[ $rel ] ) ) {
			continue;
		}
		$id = bbc_import_file( $rel );
		if ( is_wp_error( $id ) ) {
			$errors[] = $rel . ': ' . $id->get_error_message();
			break;
		}
		$map[ $rel ] = $id;
		update_option( 'bbc_media_map', $map, false );
		if ( microtime( true ) - $start > $budget ) {
			break;
		}
	}
	$done = count( array_intersect( $list, array_keys( $map ) ) );
	return array( 'done' => $done, 'total' => count( $list ), 'errors' => $errors );
}

/**
 * Finds a post by slug or creates it.
 *
 * @param string $type  Post type.
 * @param string $slug  Slug.
 * @param array  $args  Post fields.
 * @param array  $meta  Meta without the _bb_ prefix.
 * @param int    $thumb Featured image.
 * @return int Post id.
 */
function bbc_upsert( $type, $slug, $args, $meta = array(), $thumb = 0 ) {
	$found = get_posts( array( 'post_type' => $type, 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ) );
	if ( $found ) {
		return (int) $found[0];
	}
	$id = wp_insert_post( array_merge( array( 'post_type' => $type, 'post_name' => $slug, 'post_status' => 'publish' ), wp_slash( $args ) ) );
	if ( is_wp_error( $id ) || ! $id ) {
		return 0;
	}
	foreach ( $meta as $key => $value ) {
		if ( array() !== $value && '' !== $value && null !== $value && 0 !== $value ) {
			update_post_meta( $id, '_bb_' . $key, wp_slash( $value ) );
		}
	}
	if ( $thumb ) {
		set_post_thumbnail( $id, $thumb );
	}
	return (int) $id;
}

/** Creates pages, content, menu and settings once the media is in the library. */
function bbc_import_content() {
	$seed = bbc_seed();
	$map  = bbc_media_map();
	$img  = static function ( $rel ) use ( $map ) {
		return (int) ( $map[ $rel ] ?? 0 );
	};
	$imgs = static function ( $list ) use ( $img ) {
		return array_values( array_filter( array_map( $img, (array) $list ) ) );
	};

	// Set through the rewrite object: the new rules must apply within this same request.
	global $wp_rewrite;
	if ( ! get_option( 'permalink_structure' ) ) {
		$wp_rewrite->set_permalink_structure( '/%postname%/' );
	}

	$style_ids = array();
	foreach ( $seed['styles'] as $i => $s ) {
		$traits = array_map(
			static function ( $t ) {
				return array( 'term' => $t[0], 'value' => $t[1] );
			},
			$s['traits']
		);
		$credit = $s['credit'] ?? array();
		$style_ids[ $s['slug'] ] = bbc_upsert(
			'bb_style',
			$s['slug'],
			array( 'post_title' => $s['name'], 'menu_order' => $i ),
			array(
				'lead'           => $s['lead'],
				'traits'         => $traits,
				'credit_author'  => $credit['author'] ?? '',
				'credit_page'    => $credit['page'] ?? '',
				'credit_license' => $credit['license'] ?? '',
				'credit_url'     => $credit['licenseUrl'] ?? '',
			),
			$img( $s['image'] )
		);
	}

	$videos = array();
	foreach ( $seed['videos'] as $v ) {
		$videos[ $v['id'] ] = array(
			'title'    => $v['title'],
			'duration' => $v['duration'],
			'post'     => $v['post'],
			'video'    => $img( $v['src'] ),
			'poster'   => $img( $v['poster'] ),
		);
	}
	if ( false === get_option( 'bbc_videos', false ) ) {
		update_option( 'bbc_videos', array_values( $videos ) );
	}
	$video_by_post = array();
	foreach ( $videos as $v ) {
		$video_by_post[ $v['post'] ] = $v['video'];
	}

	$project_ids = array();
	foreach ( $seed['projects'] as $i => $p ) {
		$story = array_map(
			static function ( $paragraph ) {
				return '<p>' . esc_html( $paragraph ) . '</p>';
			},
			(array) ( $p['story'] ?? array() )
		);
		$specs = array_map(
			static function ( $s ) {
				return array( 'value' => $s[0], 'unit' => $s[1] ?? '', 'label' => $s[2] ?? '' );
			},
			(array) ( $p['specs'] ?? array() )
		);
		$gallery = $imgs( $p['gallery'] );
		$post    = $p['post'] ?? '';
		$project_ids[ $p['slug'] ] = bbc_upsert(
			'bb_project',
			$p['slug'],
			array( 'post_title' => $p['name'], 'post_content' => implode( "\n\n", $story ), 'menu_order' => $i ),
			array(
				'gallery' => $gallery,
				'brand'   => $p['brand'] ?? '',
				'style'   => $style_ids[ $p['style'] ?? '' ] ?? 0,
				'year'    => isset( $p['year'] ) ? (string) $p['year'] : '',
				'works'   => $p['works'] ?? array(),
				'specs'   => $specs,
				'post'    => $post,
				'video'   => $video_by_post[ $post ] ?? 0,
			),
			$gallery[0] ?? 0
		);
		foreach ( $gallery as $attachment ) {
			if ( ! get_post_meta( $attachment, '_wp_attachment_image_alt', true ) ) {
				update_post_meta( $attachment, '_wp_attachment_image_alt', wp_slash( $p['name'] ) );
			}
		}
	}

	foreach ( $seed['services'] as $i => $s ) {
		$linked = array_values( array_filter( array_map( static function ( $slug ) use ( $project_ids ) { return $project_ids[ $slug ] ?? 0; }, $s['projects'] ) ) );
		$video  = $s['video'] ? ( $videos[ $s['video'] ] ?? array() ) : array();
		bbc_upsert(
			'bb_service',
			$s['slug'],
			array( 'post_title' => $s['name'], 'menu_order' => $i ),
			array(
				'short'       => $s['short'],
				'lead'        => $s['lead'],
				'points'      => $s['points'],
				'gallery'     => $imgs( $s['gallery'] ),
				'video'       => $video['video'] ?? 0,
				'video_title' => $video['title'] ?? '',
				'video_post'  => $video['post'] ?? '',
				'projects'    => $linked,
				'spot_x'      => $s['spot'] ? (string) $s['spot'][0] : '',
				'spot_y'      => $s['spot'] ? (string) $s['spot'][1] : '',
			),
			$img( $s['photo'] )
		);
	}

	$policy = '';
	foreach ( $seed['policy']['body'] as $paragraph ) {
		$is_heading = preg_match( '/^\d+\.\s/', $paragraph ) && mb_strlen( $paragraph ) < 90;
		$policy    .= ( $is_heading ? '<h2>' . esc_html( $paragraph ) . '</h2>' : '<p>' . esc_html( $paragraph ) . '</p>' ) . "\n";
	}
	$pages = array(
		'glavnaya' => array( 'Главная', '', '' ),
		'o-nas'    => array( 'О нас', '', 'templates/about.php' ),
		'process'  => array( 'Процесс', '', 'templates/process.php' ),
		'kontakty' => array( 'Контакты', '', 'templates/contacts.php' ),
		'politika' => array( $seed['policy']['title'], $policy, '' ),
	);
	$page_ids = array();
	foreach ( $pages as $slug => $page ) {
		$page_ids[ $slug ] = bbc_upsert( 'page', $slug, array( 'post_title' => $page[0], 'post_content' => $page[1] ) );
		if ( $page[2] && $page_ids[ $slug ] ) {
			update_post_meta( $page_ids[ $slug ], '_wp_page_template', $page[2] );
		}
	}
	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $page_ids['glavnaya'] );
	update_option( 'wp_page_for_privacy_policy', $page_ids['politika'] );
	if ( 'Just another WordPress site' === get_option( 'blogdescription' ) || '' === get_option( 'blogdescription' ) ) {
		update_option( 'blogdescription', 'Кастом-ателье мотоциклов в Москве' );
	}

	if ( false === get_option( 'bbc_images', false ) ) {
		$i = $seed['images'];
		update_option(
			'bbc_images',
			array(
				'about'         => $img( $i['about'] ),
				'philosophy'    => $img( $i['philosophy'] ),
				'about_hero'    => $img( $i['about_hero'] ),
				'services_hero' => $img( $i['services_hero'] ),
				'projects_hero' => $img( $i['projects_hero'] ),
				'styles_hero'   => $img( $i['styles_hero'] ),
				'process_hero'  => $img( $i['process_hero'] ),
				'workshop'      => $imgs( $i['workshop'] ),
				'tiles'         => array_values( array_filter( array_map( static function ( $slug ) use ( $project_ids ) { return $project_ids[ $slug ] ?? 0; }, $i['tiles'] ) ) ),
				'showcase'      => array_map(
					static function ( $slide ) use ( $project_ids, $img ) {
						return array( 'project' => $project_ids[ $slide['slug'] ] ?? 0, 'photo' => $img( $slide['photo'] ) );
					},
					$i['showcase']
				),
			)
		);
	}

	bbc_import_menu( $page_ids );
	bbc_register_content_types();
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/misc.php';
	flush_rewrite_rules( true );
	update_option( 'bbc_import_done', time() );
}

/**
 * Creates the main menu when the site has none in that place.
 *
 * @param array $pages Page ids by slug.
 */
function bbc_import_menu( $pages ) {
	$locations = (array) get_theme_mod( 'nav_menu_locations', array() );
	if ( ! empty( $locations['primary'] ) ) {
		return;
	}
	$menu = wp_get_nav_menu_object( 'Главное меню' );
	if ( $menu ) {
		$id = (int) $menu->term_id;
	} else {
		$id    = wp_create_nav_menu( 'Главное меню' );
		$items = array(
			array( 'page', $pages['o-nas'], 'О нас' ),
			array( 'archive', 'bb_service', 'Услуги' ),
			array( 'archive', 'bb_style', 'Мотоциклы' ),
			array( 'archive', 'bb_project', 'Наши проекты' ),
			array( 'page', $pages['process'], 'Процесс' ),
			array( 'page', $pages['kontakty'], 'Контакты' ),
		);
		foreach ( $items as $n => $item ) {
			$args = array( 'menu-item-title' => $item[2], 'menu-item-status' => 'publish', 'menu-item-position' => $n + 1 );
			if ( 'page' === $item[0] ) {
				$args += array( 'menu-item-type' => 'post_type', 'menu-item-object' => 'page', 'menu-item-object-id' => $item[1] );
			} else {
				$args += array( 'menu-item-type' => 'post_type_archive', 'menu-item-object' => $item[1] );
			}
			wp_update_nav_menu_item( $id, 0, $args );
		}
	}
	$locations['primary'] = $id;
	set_theme_mod( 'nav_menu_locations', $locations );
}

// If the theme is activated after the import, it still gets the main menu.
add_action(
	'after_switch_theme',
	static function () {
		if ( ! get_option( 'bbc_import_done' ) ) {
			return;
		}
		$pages = array();
		foreach ( array( 'o-nas', 'process', 'kontakty' ) as $slug ) {
			$page           = get_page_by_path( $slug );
			$pages[ $slug ] = $page ? $page->ID : 0;
		}
		if ( array_filter( $pages ) === $pages ) {
			bbc_import_menu( $pages );
		}
	}
);

/** Prints the import tab. */
function bbc_import_screen() {
	$list  = bbc_seed()['media'] ?? array();
	$done  = count( array_intersect( $list, array_keys( bbc_media_map() ) ) );
	$local = is_dir( bbc_import_dir() );
	?>
	<div class="bbc-box bbc-import">
		<h2>Импорт материалов сайта</h2>
		<p>Добавит 23 проекта, 13 услуг, 8 стилей, тексты, ролики, меню и страницы, а <?php echo count( $list ) > 0 ? esc_html( count( $list ) . ' фото и видео' ) : 'медиафайлы'; ?> загрузит в медиабиблиотеку. Уже созданное и отредактированное не перезаписывается, импорт можно запускать повторно.</p>
		<p><strong>Источник файлов:</strong>
			<?php if ( $local ) : ?>
				папка <code>wp-content/uploads/brobobber-import</code>
			<?php else : ?>
				опубликованный сайт <code><?php echo esc_html( BBC_REMOTE_MEDIA ); ?></code>. Если хостинг не может его скачать, распакуйте <code>brobobber-media.zip</code> в <code>wp-content/uploads/brobobber-import</code>.
			<?php endif; ?>
		</p>
		<?php if ( get_option( 'bbc_import_done' ) ) : ?>
			<p class="bbc-ok">Импорт уже выполнен.</p>
		<?php endif; ?>
		<progress id="bbc-progress" max="<?php echo (int) count( $list ); ?>" value="<?php echo (int) $done; ?>"></progress>
		<p id="bbc-status"><?php echo esc_html( $done . ' из ' . count( $list ) . ' файлов' ); ?></p>
		<button type="button" class="button button-primary button-hero" id="bbc-run"><?php echo get_option( 'bbc_import_done' ) ? 'Запустить ещё раз' : 'Импортировать'; ?></button>
	</div>
	<?php
}

add_action(
	'wp_ajax_bbc_import',
	static function () {
		check_ajax_referer( 'bbc_import', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'Недостаточно прав.' ), 403 );
		}
		if ( function_exists( 'set_time_limit' ) ) {
			@set_time_limit( 120 ); // phpcs:ignore WordPress.PHP.NoSilencedErrors
		}
		$progress = bbc_import_media_batch();
		if ( $progress['errors'] ) {
			wp_send_json_error( array_merge( $progress, array( 'message' => $progress['errors'][0] ) ) );
		}
		if ( $progress['done'] >= $progress['total'] ) {
			bbc_import_content();
			$progress['finished'] = true;
		}
		wp_send_json_success( $progress );
	}
);

if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command(
		'brobobber import',
		static function () {
			do {
				$progress = bbc_import_media_batch( 30 );
				if ( $progress['errors'] ) {
					WP_CLI::error( $progress['errors'][0] );
				}
				WP_CLI::log( $progress['done'] . ' / ' . $progress['total'] );
			} while ( $progress['done'] < $progress['total'] );
			bbc_import_content();
			WP_CLI::success( 'Импорт завершён.' );
		}
	);
}
