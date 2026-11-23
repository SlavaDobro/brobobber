<?php
/**
 * Template Name: Процесс
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'pg';
get_header();

bb_page_hero(
	array(
		'title'   => bbc_text( 'process.hero_title' ),
		'lead'    => bbc_text( 'process.hero_lead' ),
		'photo'   => (int) bbc_image( 'process_hero' ),
		'alt'     => 'Мотоцикл в работе в мастерской',
		'actions' => '<a class="btn btn-signal pg-cta" href="#zayavka">Обсудить проект</a>',
	)
);
?>
<section class="section">
	<div class="wrap"><?php bb_process_road(); ?></div>
</section>

<section class="section">
	<div class="wrap">
		<h2 class="h2 pg-head"><?php echo esc_html( bbc_text( 'process.workshop_title' ) ); ?></h2>
		<?php bb_photo_wall( (array) bbc_image( 'workshop' ) ); ?>
		<h3 class="h3 pg-reel-title"><?php echo esc_html( bbc_text( 'process.reel_title' ) ); ?></h3>
		<?php bb_video_reel(); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head"><h2 class="h2"><?php echo esc_html( bbc_text( 'process.end_title' ) ); ?></h2><a class="link-brass" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Все проекты</a></div>
		<?php bb_project_list( array_slice( bbc_projects(), 0, 3 ) ); ?>
	</div>
</section>

<section class="section">
	<div class="wrap pg-two"><h2 class="h2">Вопросы</h2><?php bb_faq(); ?></div>
</section>
<?php
get_footer();
