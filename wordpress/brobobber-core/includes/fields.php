<?php
/**
 * Field rendering and cleaning shared by the meta boxes and the settings screens.
 *
 * A field is [name, type, label, extra]. Types: text, url, email, number, textarea, lines,
 * rows (extra = columns), image, video, gallery, style, projects.
 *
 * @package Brobobber_Core
 */

defined( 'ABSPATH' ) || exit;

/**
 * Prints one field.
 *
 * @param array  $field Field definition.
 * @param mixed  $value Current value.
 * @param string $base  Form name prefix.
 */
function bbc_render_field( $field, $value, $base ) {
	list( $name, $type, $label ) = $field;
	$extra   = $field[3] ?? null;
	$control = $base . '[' . $name . ']';
	echo '<div class="bbc-field bbc-' . esc_attr( $type ) . '"><label class="bbc-label">' . esc_html( $label ) . '</label>';
	bbc_render_control( $type, $control, $value, $extra );
	echo '</div>';
}

/**
 * Prints the input of a field.
 *
 * @param string $type    Field type.
 * @param string $control Input name.
 * @param mixed  $value   Current value.
 * @param mixed  $extra   Type options.
 */
function bbc_render_control( $type, $control, $value, $extra = null ) {
	switch ( $type ) {
		case 'textarea':
			echo '<textarea name="' . esc_attr( $control ) . '" rows="3">' . esc_textarea( (string) $value ) . '</textarea>';
			break;
		case 'lines':
			echo '<textarea name="' . esc_attr( $control ) . '" rows="7" placeholder="Каждый пункт с новой строки">' . esc_textarea( implode( "\n", (array) $value ) ) . '</textarea>';
			break;
		case 'number':
			echo '<input type="number" step="any" name="' . esc_attr( $control ) . '" value="' . esc_attr( (string) $value ) . '">';
			break;
		case 'url':
		case 'email':
			echo '<input type="' . esc_attr( $type ) . '" name="' . esc_attr( $control ) . '" value="' . esc_attr( (string) $value ) . '">';
			break;
		case 'image':
		case 'video':
			bbc_render_media( $type, $control, (int) $value );
			break;
		case 'gallery':
			bbc_render_gallery( $control, (array) $value );
			break;
		case 'style':
			echo '<select name="' . esc_attr( $control ) . '"><option value="0">— без стиля —</option>';
			foreach ( get_posts( array( 'post_type' => 'bb_style', 'numberposts' => -1, 'orderby' => 'menu_order', 'order' => 'ASC' ) ) as $style ) {
				echo '<option value="' . (int) $style->ID . '"' . selected( (int) $value, $style->ID, false ) . '>' . esc_html( $style->post_title ) . '</option>';
			}
			echo '</select>';
			break;
		case 'project':
			echo '<select name="' . esc_attr( $control ) . '"><option value="0">— выберите проект —</option>';
			foreach ( get_posts( array( 'post_type' => 'bb_project', 'numberposts' => -1, 'orderby' => 'menu_order', 'order' => 'ASC' ) ) as $project ) {
				echo '<option value="' . (int) $project->ID . '"' . selected( (int) $value, $project->ID, false ) . '>' . esc_html( $project->post_title ) . '</option>';
			}
			echo '</select>';
			break;
		case 'projects':
			$chosen = array_map( 'absint', (array) $value );
			echo '<div class="bbc-checks"><input type="hidden" name="' . esc_attr( $control ) . '[]" value="0">';
			foreach ( get_posts( array( 'post_type' => 'bb_project', 'numberposts' => -1, 'orderby' => 'menu_order', 'order' => 'ASC' ) ) as $project ) {
				echo '<label><input type="checkbox" name="' . esc_attr( $control ) . '[]" value="' . (int) $project->ID . '"' . checked( in_array( $project->ID, $chosen, true ), true, false ) . '> ' . esc_html( $project->post_title ) . '</label>';
			}
			echo '</div>';
			break;
		case 'rows':
			bbc_render_rows( $control, (array) $value, $extra );
			break;
		default:
			echo '<input type="text" name="' . esc_attr( $control ) . '" value="' . esc_attr( (string) $value ) . '">';
	}
}

/**
 * Single image or video picker.
 *
 * @param string $type    image or video.
 * @param string $control Input name.
 * @param int    $id      Attachment id.
 */
function bbc_render_media( $type, $control, $id ) {
	$preview = '';
	if ( $id ) {
		$preview = 'image' === $type ? wp_get_attachment_image( $id, 'thumbnail' ) : '<span class="bbc-file">' . esc_html( basename( (string) get_attached_file( $id ) ) ) . '</span>';
	}
	echo '<div class="bbc-media" data-kind="' . esc_attr( $type ) . '"><input type="hidden" name="' . esc_attr( $control ) . '" value="' . (int) $id . '">';
	echo '<div class="bbc-preview">' . wp_kses_post( $preview ) . '</div>';
	echo '<button type="button" class="button bbc-pick">Выбрать</button> <button type="button" class="button-link-delete bbc-clear">Убрать</button></div>';
}

/**
 * Sortable set of images.
 *
 * @param string $control Input name.
 * @param int[]  $ids     Attachment ids.
 */
function bbc_render_gallery( $control, $ids ) {
	echo '<div class="bbc-gallery" data-name="' . esc_attr( $control ) . '[]"><input type="hidden" name="' . esc_attr( $control ) . '[]" value="0"><ul class="bbc-thumbs">';
	foreach ( array_filter( array_map( 'absint', $ids ) ) as $id ) {
		echo '<li><input type="hidden" name="' . esc_attr( $control ) . '[]" value="' . (int) $id . '">' . wp_get_attachment_image( $id, 'thumbnail' ) . '<button type="button" class="bbc-remove" aria-label="Убрать">×</button></li>';
	}
	echo '</ul><button type="button" class="button bbc-add-photos">Добавить фото</button> <span class="description">Перетаскивайте, чтобы менять порядок.</span></div>';
}

/**
 * Repeating rows.
 *
 * @param string $control Input name.
 * @param array  $rows    Current rows.
 * @param array  $columns key => [label, type].
 */
function bbc_render_rows( $control, $rows, $columns ) {
	echo '<div class="bbc-rows" data-name="' . esc_attr( $control ) . '"><div class="bbc-rows-list">';
	foreach ( array_values( $rows ) as $i => $row ) {
		bbc_render_row( $control . '[' . $i . ']', (array) $row, $columns );
	}
	echo '</div><template>';
	bbc_render_row( $control . '[__i__]', array(), $columns );
	echo '</template><button type="button" class="button bbc-add-row">Добавить</button></div>';
}

/**
 * One repeating row.
 *
 * @param string $base    Input name prefix.
 * @param array  $row     Values.
 * @param array  $columns Columns.
 */
function bbc_render_row( $base, $row, $columns ) {
	echo '<div class="bbc-row"><span class="bbc-handle" title="Перетащить">⋮⋮</span>';
	foreach ( $columns as $key => $column ) {
		echo '<label class="bbc-cell bbc-cell-' . esc_attr( $column[1] ) . '"><span>' . esc_html( $column[0] ) . '</span>';
		bbc_render_control( $column[1], $base . '[' . $key . ']', $row[ $key ] ?? '' );
		echo '</label>';
	}
	echo '<button type="button" class="bbc-remove-row" aria-label="Удалить">×</button></div>';
}

/**
 * Cleans a submitted value.
 *
 * @param string $type  Field type.
 * @param mixed  $raw   Submitted value (already unslashed).
 * @param mixed  $extra Type options.
 * @return mixed
 */
function bbc_clean_field( $type, $raw, $extra = null ) {
	switch ( $type ) {
		case 'textarea':
			return sanitize_textarea_field( (string) $raw );
		case 'lines':
			return array_values( array_filter( array_map( 'trim', preg_split( '/\R/u', sanitize_textarea_field( (string) $raw ) ) ), 'strlen' ) );
		case 'url':
			return esc_url_raw( (string) $raw );
		case 'email':
			return sanitize_email( (string) $raw );
		case 'number':
			return is_numeric( $raw ) ? (string) (float) $raw : '';
		case 'image':
		case 'video':
		case 'style':
		case 'project':
			return absint( $raw );
		case 'gallery':
		case 'projects':
			return array_values( array_unique( array_filter( array_map( 'absint', (array) $raw ) ) ) );
		case 'rows':
			$rows = array();
			foreach ( (array) $raw as $i => $row ) {
				if ( '__i__' === (string) $i || ! is_array( $row ) ) {
					continue;
				}
				$clean = array();
				$empty = true;
				foreach ( $extra as $key => $column ) {
					$clean[ $key ] = bbc_clean_field( $column[1], $row[ $key ] ?? '' );
					if ( ! empty( $clean[ $key ] ) ) {
						$empty = false;
					}
				}
				if ( ! $empty ) {
					$rows[] = $clean;
				}
			}
			return $rows;
		default:
			return sanitize_text_field( (string) $raw );
	}
}

add_action(
	'admin_enqueue_scripts',
	static function ( $hook ) {
		$screen = get_current_screen();
		$ours   = $screen && ( in_array( $screen->post_type, array( 'bb_project', 'bb_service', 'bb_style' ), true ) || false !== strpos( (string) $hook, 'brobobber' ) );
		if ( ! $ours ) {
			return;
		}
		wp_enqueue_media();
		wp_enqueue_style( 'bbc-admin', BBC_URL . 'assets/admin.css', array(), BBC_VERSION );
		wp_enqueue_script( 'bbc-admin', BBC_URL . 'assets/admin.js', array( 'jquery', 'jquery-ui-sortable' ), BBC_VERSION, true );
		wp_localize_script(
			'bbc-admin',
			'bbcAdmin',
			array(
				'ajax'  => admin_url( 'admin-ajax.php' ),
				'nonce' => wp_create_nonce( 'bbc_import' ),
			)
		);
	}
);
