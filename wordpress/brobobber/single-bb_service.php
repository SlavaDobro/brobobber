<?php
/**
 * One service.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'us';
get_header();
the_post();

$bb_s      = bbc_service( get_the_ID() );
$bb_others = array_slice(
	array_values(
		array_filter(
			bbc_services(),
			static function ( $x ) use ( $bb_s ) {
				return $x['id'] !== $bb_s['id'];
			}
		)
	),
	0,
	6
);
$bb_related = array();
foreach ( $bb_s['projects'] as $bb_id ) {
	if ( 'publish' === get_post_status( $bb_id ) ) {
		$bb_related[] = bbc_project( $bb_id );
	}
}
$bb_clip       = $bb_s['video'] ? wp_get_attachment_url( $bb_s['video'] ) : '';
$bb_clip_title = (string) bbc_meta( $bb_s['id'], 'video_title' );
$bb_clip_post  = (string) bbc_meta( $bb_s['id'], 'video_post' );
$bb_estimate   = array_filter( array_map( 'trim', preg_split( '/\R/u', bbc_text( 'services.price_list' ) ) ), 'strlen' );

bb_page_hero(
	array(
		'title'   => $bb_s['name'],
		'lead'    => $bb_s['lead'],
		'photo'   => $bb_s['photo'],
		'alt'     => $bb_s['name'],
		'crumbs'  => array( array( home_url( '/' ), 'Главная' ), array( get_post_type_archive_link( 'bb_service' ), 'Услуги' ) ),
		'actions' => '<div class="us-actions"><a class="btn btn-signal" href="#zayavka">Оставить заявку</a></div>',
	)
);
?>
<section class="section">
	<div class="wrap us-two">
		<h2 class="h2">Что входит</h2>
		<ul class="us-points">
			<?php foreach ( $bb_s['points'] as $bb_point ) : ?>
				<li><?php echo bb_icon( 'check', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_point ); ?></li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>

<?php if ( $bb_s['gallery'] ) : ?>
	<section class="section">
		<div class="wrap">
			<h2 class="h2 us-gallery-title">Из мастерской</h2>
			<?php bb_photo_wall( $bb_s['gallery'], $bb_s['name'] ); ?>
		</div>
	</section>
<?php endif; ?>

<?php if ( $bb_clip ) : ?>
	<section class="section">
		<div class="wrap us-two us-clip">
			<div class="us-clip-copy">
				<h2 class="h2">Как это делаем</h2>
				<?php if ( $bb_clip_title ) : ?><p class="muted"><?php echo esc_html( $bb_clip_title ); ?>. Ролик из нашего Telegram-канала.</p><?php endif; ?>
				<?php if ( $bb_clip_post ) : ?><a class="link-brass" href="<?php echo esc_url( $bb_clip_post ); ?>" target="_blank" rel="noopener">Открыть пост</a><?php endif; ?>
			</div>
			<video class="us-clip-video" src="<?php echo esc_url( $bb_clip ); ?>#t=0.6" controls playsinline preload="metadata"></video>
		</div>
	</section>
<?php endif; ?>

<?php if ( $bb_related ) : ?>
	<section class="section">
		<div class="wrap">
			<div class="section-head"><h2 class="h2">Работы по этой услуге</h2><a class="link-brass" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Все проекты</a></div>
			<?php bb_project_list( $bb_related ); ?>
		</div>
	</section>
<?php endif; ?>

<section class="section">
	<div class="wrap us-two">
		<div class="us-estimate-copy">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'services.price_title' ) ); ?></h2>
			<p class="muted"><?php echo esc_html( bbc_text( 'services.price_lead' ) ); ?></p>
		</div>
		<ol class="us-estimate">
			<?php $bb_n = 0; foreach ( $bb_estimate as $bb_item ) : ?>
				<li><span><?php echo (int) ++$bb_n; ?></span><?php echo esc_html( $bb_item ); ?></li>
			<?php endforeach; ?>
			<li class="us-cta"><a class="btn btn-signal" href="#zayavka">Отправить для расчёта</a></li>
		</ol>
	</div>
</section>

<section class="section">
	<div class="wrap us-two">
		<h2 class="h2">Вопросы</h2>
		<?php bb_faq( 5 ); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 class="h3 us-others-title">Другие услуги</h2>
		<ul class="us-others">
			<?php foreach ( $bb_others as $bb_item ) : ?>
				<li><a href="<?php echo esc_url( $bb_item['url'] ); ?>"><?php echo esc_html( $bb_item['name'] ); ?></a></li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
<?php
get_footer();
