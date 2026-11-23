<?php
/**
 * One project.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'pj';
get_header();
the_post();

$bb_p   = bbc_project( get_the_ID() );
$bb_all = bbc_projects();
$bb_ids = array_column( $bb_all, 'id' );
$bb_pos = array_search( $bb_p['id'], $bb_ids, true );
$bb_next = $bb_all[ ( (int) $bb_pos + 1 ) % max( 1, count( $bb_all ) ) ] ?? null;
$bb_more = array_values(
	array_filter(
		$bb_all,
		static function ( $x ) use ( $bb_p ) {
			return $x['id'] !== $bb_p['id'] && ( $x['brand'] === $bb_p['brand'] || $x['style'] === $bb_p['style'] );
		}
	)
);
if ( ! $bb_more ) {
	$bb_more = array_values(
		array_filter(
			$bb_all,
			static function ( $x ) use ( $bb_p ) {
				return $x['id'] !== $bb_p['id'];
			}
		)
	);
}
$bb_more = array_slice( $bb_more, 0, 3 );

// The opening row: as many photos as it takes to fill the width, each one whole.
$bb_row = array();
$bb_sum = 0;
foreach ( $bb_p['gallery'] as $bb_id ) {
	$bb_row[] = $bb_id;
	$bb_sum  += bbc_aspect( $bb_id );
	if ( $bb_sum >= 2.1 || 3 === count( $bb_row ) ) {
		break;
	}
}
$bb_start = count( $bb_row );
$bb_rest  = array_slice( $bb_p['gallery'], $bb_start );
$bb_total = count( $bb_p['gallery'] );

$bb_works = count( $bb_p['works'] );
$bb_meta  = implode(
	'. ',
	array_filter(
		array(
			$bb_p['brand'] . ( $bb_p['style_name'] ? ', ' . mb_strtolower( $bb_p['style_name'] ) : '' ),
			$bb_works ? $bb_works . ' ' . bbc_plural( $bb_works, array( 'работа', 'работы', 'работ' ) ) . ' по проекту' : '',
			$bb_p['year'] ? $bb_p['year'] . ' год' : '',
		)
	)
) . '.';
$bb_story = trim( (string) get_the_content() );
$bb_clip  = $bb_p['video'] ? wp_get_attachment_url( $bb_p['video'] ) : '';
?>
<section class="pj-project-hero">
	<div class="wrap pj-top">
		<nav class="pj-crumbs" aria-label="Вы здесь"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Главная</a><span>/</span><a href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Проекты</a><span>/</span></nav>
		<h1 class="h1"><?php echo esc_html( $bb_p['name'] ); ?></h1>
		<p class="pj-meta"><?php echo esc_html( $bb_meta ); ?></p>
	</div>
	<?php if ( $bb_row ) : ?>
		<div class="pj-cover-row" style="--sum:<?php echo esc_attr( $bb_sum ); ?>">
			<?php foreach ( $bb_row as $bb_i => $bb_id ) : ?>
				<button type="button" style="--a:<?php echo esc_attr( bbc_aspect( $bb_id ) ); ?>" data-open="<?php echo (int) $bb_i; ?>" aria-label="<?php echo esc_attr( 'Фото ' . ( $bb_i + 1 ) . ' на весь экран' ); ?>"><?php echo bb_photo( $bb_id, 0 === $bb_i ? $bb_p['name'] : '', true ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>
</section>

<?php if ( $bb_p['specs'] ) : ?>
	<section class="section pj-specs">
		<div class="wrap pj-grid3">
			<?php
			foreach ( $bb_p['specs'] as $bb_spec ) {
				bb_odometer( (string) ( $bb_spec['value'] ?? '' ), (string) ( $bb_spec['unit'] ?? '' ), (string) ( $bb_spec['label'] ?? '' ) );
			}
			?>
		</div>
	</section>
<?php endif; ?>

<?php if ( '' !== $bb_story ) : ?>
	<section class="section">
		<div class="wrap pj-two">
			<h2 class="h2">История проекта</h2>
			<div class="pj-story">
				<?php the_content(); ?>
				<?php if ( $bb_p['post'] ) : ?><a class="link-brass" href="<?php echo esc_url( $bb_p['post'] ); ?>" target="_blank" rel="noopener">Пост о проекте в Telegram-канале</a><?php endif; ?>
				<?php if ( $bb_clip ) : ?><video class="pj-clip" src="<?php echo esc_url( $bb_clip ); ?>#t=0.6" controls playsinline preload="metadata"></video><?php endif; ?>
			</div>
		</div>
	</section>
<?php endif; ?>

<?php if ( $bb_works ) : ?>
	<section class="section">
		<div class="wrap pj-two">
			<div class="pj-sticky">
				<h2 class="h2">Что сделали</h2>
				<p class="muted">Полный список работ по мотоциклу — так, как его записали мастера.</p>
				<a class="btn btn-signal" href="#zayavka">Обсудить похожий проект</a>
			</div>
			<ol class="pj-works">
				<?php foreach ( $bb_p['works'] as $bb_i => $bb_work ) : ?>
					<li><span class="pj-n"><?php echo esc_html( str_pad( (string) ( $bb_i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span><span><?php echo esc_html( $bb_work ); ?></span><?php echo bb_icon( 'check', 16 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></li>
				<?php endforeach; ?>
			</ol>
		</div>
	</section>
<?php endif; ?>

<?php if ( $bb_rest ) : ?>
	<section class="section">
		<div class="wrap">
			<h2 class="h2 pj-head">Фотографии</h2>
			<ul class="pj-gallery">
				<?php foreach ( $bb_rest as $bb_i => $bb_id ) : ?>
					<?php $bb_n = $bb_i + $bb_start; ?>
					<li><button type="button" data-open="<?php echo (int) $bb_n; ?>" aria-label="<?php echo esc_attr( 'Фото ' . ( $bb_n + 1 ) . ' из ' . $bb_total ); ?>"><?php echo bb_photo( $bb_id, $bb_p['name'] . ', фото ' . ( $bb_n + 1 ) ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</section>
<?php endif; ?>

<section class="section">
	<div class="wrap">
		<div class="section-head">
			<h2 class="h2">Ещё проекты</h2>
			<?php if ( $bb_next ) : ?><a class="pj-next" href="<?php echo esc_url( $bb_next['url'] ); ?>">Следующий: <?php echo esc_html( $bb_next['name'] ); ?><?php echo bb_icon( 'arrow-right', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a><?php endif; ?>
		</div>
		<?php bb_project_list( $bb_more ); ?>
	</div>
</section>

<?php
$bb_full = array_map(
	static function ( $id ) {
		return wp_get_attachment_url( $id );
	},
	$bb_p['gallery']
);
?>
<dialog class="pj-viewer" aria-label="Просмотр фото" data-name="<?php echo esc_attr( $bb_p['name'] ); ?>" data-photos="<?php echo esc_attr( (string) wp_json_encode( $bb_full ) ); ?>">
	<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" alt="">
	<p class="pj-counter"></p>
	<button type="button" class="pj-close" aria-label="Закрыть"><?php echo bb_icon( 'x', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	<button type="button" class="pj-prev" aria-label="Предыдущее фото"><?php echo bb_icon( 'chevron-left', 26 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
	<button type="button" class="pj-nextb" aria-label="Следующее фото"><?php echo bb_icon( 'chevron-right', 26 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
</dialog>
<?php
get_footer();
