<?php
/**
 * All services.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'ua';
get_header();

bb_page_hero(
	array(
		'title' => bbc_text( 'services.hero_title' ),
		'lead'  => bbc_text( 'services.hero_lead' ),
		'photo' => (int) bbc_image( 'services_hero' ),
		'alt'   => 'Мотоцикл на подъёмнике в мастерской',
	)
);
?>
<section class="section">
	<div class="wrap"><?php bb_service_bike(); ?></div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head"><h2 class="h2"><?php echo esc_html( bbc_text( 'services.tiles_title' ) ); ?></h2><a class="link-brass" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Все проекты</a></div>
		<?php bb_project_tiles(); ?>
	</div>
</section>

<section class="section tight">
	<div class="wrap">
		<h2 class="h2 ua-head"><?php echo esc_html( bbc_text( 'services.process_title' ) ); ?></h2>
		<?php bb_process_road( true ); ?>
	</div>
</section>

<section class="section">
	<div class="wrap ua-faq">
		<h2 class="h2">Вопросы</h2>
		<?php bb_faq(); ?>
	</div>
</section>
<?php
get_footer();
