<?php
/**
 * Home page.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'hm';
get_header();
$bb_c         = bbc_contacts();
$bb_statement = str_replace( array( '{', '}' ), array( '<span class="hm-brass">', '</span>' ), esc_html( bbc_text( 'home.statement' ) ) );
$bb_about     = (int) bbc_image( 'about' );
?>
<section class="hr hr-hero">
	<div class="hr-door">
		<div class="hr-word-box" aria-hidden="true">
			<p class="hr-word"><?php foreach ( str_split( 'BROBOBBER', 3 ) as $bb_l => $bb_line ) : ?><span class="hr-line"><?php foreach ( str_split( $bb_line ) as $bb_i => $bb_letter ) : ?><span class="hr-letter" style="--i:<?php echo (int) ( $bb_l * 3 + $bb_i ); ?>"><?php echo esc_html( $bb_letter ); ?></span><?php endforeach; ?></span><?php endforeach; ?></p>
		</div>
		<span class="hr-seams" aria-hidden="true"></span>
		<div class="hr-copy">
			<div class="hero-copy hm-hero-copy">
				<h1 class="hero-title hm-hero-title"><?php echo esc_html( bbc_text( 'home.hero_title' ) ); ?></h1>
				<p class="lead"><?php echo esc_html( bbc_text( 'home.hero_lead' ) ); ?></p>
				<div class="hero-actions hm-hero-actions">
					<a class="btn btn-signal" href="#zayavka">Обсудить проект</a>
					<a class="btn btn-line" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Смотреть проекты</a>
				</div>
			</div>
		</div>
		<span class="hr-hint" aria-hidden="true">Прокрутите вниз</span>
	</div>
</section>

<section class="section hm-manifesto">
	<div class="wrap">
		<div class="hm-manifesto-top">
			<p class="hm-statement"><?php echo $bb_statement; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped above. ?></p>
			<?php bb_photo_slides(); ?>
		</div>
		<ul class="hm-advantages">
			<?php foreach ( bbc_list( 'advantages' ) as $bb_item ) : ?>
				<li><h2 class="h3"><?php echo esc_html( $bb_item['title'] ); ?></h2><p class="muted"><?php echo esc_html( $bb_item['text'] ); ?></p></li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>

<?php bb_project_rail( bbc_text( 'home.projects_title' ) ); ?>

<section class="section hm-about">
	<div class="wrap hm-grid">
		<?php if ( $bb_about ) : ?>
			<div class="hm-about-photo" style="--a:<?php echo esc_attr( bbc_aspect( $bb_about ) ); ?>"><?php echo bb_photo( $bb_about, 'Мастера Brobobber в мастерской' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<?php endif; ?>
		<div class="hm-about-copy">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'home.about_title' ) ); ?></h2>
			<p class="lead"><?php echo esc_html( bbc_text( 'home.about_lead' ) ); ?></p>
			<p class="muted"><?php echo esc_html( bbc_text( 'home.about_note' ) ); ?></p>
			<a class="btn btn-line" href="<?php echo esc_url( bb_template_url( 'templates/about.php' ) ); ?>">О мастерской</a>
		</div>
	</div>
</section>

<section class="section hm-services">
	<div class="wrap">
		<div class="section-head">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'home.services_title' ) ); ?></h2>
			<p><?php echo esc_html( bbc_text( 'home.services_lead' ) ); ?></p>
		</div>
		<?php bb_service_bike(); ?>
	</div>
</section>

<section class="section tight">
	<div class="wrap">
		<div class="section-head">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'home.process_title' ) ); ?></h2>
			<a class="link-brass" href="<?php echo esc_url( bb_template_url( 'templates/process.php' ) ); ?>">Подробнее о процессе</a>
		</div>
		<?php bb_process_road(); ?>
	</div>
</section>

<section class="section tight">
	<div class="wrap">
		<div class="section-head">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'home.reviews_title' ) ); ?></h2>
			<p><?php echo esc_html( bbc_text( 'home.reviews_lead' ) ); ?></p>
		</div>
		<?php bb_reviews(); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'home.life_title' ) ); ?></h2>
			<p><?php echo esc_html( bbc_text( 'home.life_lead' ) ); ?></p>
			<a class="link-brass" href="<?php echo esc_url( $bb_c['channel_url'] ); ?>" target="_blank" rel="noopener">Канал <?php echo esc_html( $bb_c['channel_handle'] ); ?></a>
		</div>
		<?php bb_video_reel(); ?>
	</div>
</section>

<section class="section hm-sale">
	<div class="wrap hm-sale-grid">
		<div>
			<h2 class="h2"><?php echo esc_html( bbc_text( 'home.sale_title' ) ); ?></h2>
			<p class="lead"><?php echo esc_html( bbc_text( 'home.sale_lead' ) ); ?></p>
		</div>
		<div class="hm-sale-actions">
			<p class="muted"><?php echo esc_html( bbc_text( 'home.sale_note' ) ); ?></p>
			<a class="btn btn-signal" href="<?php echo esc_url( $bb_c['channel_url'] ); ?>" target="_blank" rel="noopener">Открыть канал <?php echo esc_html( $bb_c['channel_handle'] ); ?></a>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap hm-faq-grid">
		<h2 class="h2"><?php echo esc_html( bbc_text( 'home.faq_title' ) ); ?></h2>
		<?php bb_faq(); ?>
	</div>
</section>
<?php
get_footer();
