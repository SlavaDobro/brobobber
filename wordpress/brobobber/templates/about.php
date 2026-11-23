<?php
/**
 * Template Name: О нас
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'on';
get_header();
$bb_c          = bbc_contacts();
$bb_people     = (int) bbc_image( 'about' );
$bb_philosophy = (int) bbc_image( 'philosophy' );

bb_page_hero(
	array(
		'title' => bbc_text( 'about.hero_title' ),
		'lead'  => bbc_text( 'about.hero_lead' ),
		'photo' => (int) bbc_image( 'about_hero' ),
		'alt'   => 'Мастерская Brobobber изнутри',
	)
);
?>
<section class="section">
	<div class="wrap on-duo">
		<?php if ( $bb_people ) : ?>
			<div class="on-pic" style="--a:<?php echo esc_attr( bbc_aspect( $bb_people ) ); ?>"><?php echo bb_photo( $bb_people, 'Мастера Brobobber' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<?php endif; ?>
		<div class="on-copy">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'about.who_title' ) ); ?></h2>
			<p class="lead"><?php echo esc_html( bbc_text( 'about.who_lead' ) ); ?></p>
			<ul class="on-people">
				<?php foreach ( $bb_c['phones'] as $bb_person ) : ?>
					<li><strong><?php echo esc_html( $bb_person['name'] ); ?></strong><a href="<?php echo esc_attr( $bb_person['href'] ); ?>"><?php echo esc_html( $bb_person['phone'] ); ?></a><?php if ( $bb_person['telegram'] ) : ?><a class="link-brass" href="<?php echo esc_url( 'https://t.me/' . $bb_person['telegram'] ); ?>" target="_blank" rel="noopener">Написать в Telegram</a><?php endif; ?></li>
				<?php endforeach; ?>
			</ul>
		</div>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head"><h2 class="h2"><?php echo esc_html( bbc_text( 'about.services_title' ) ); ?></h2><p><?php echo esc_html( bbc_text( 'about.services_lead' ) ); ?></p></div>
		<?php bb_service_index(); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 class="h2 on-head"><?php echo esc_html( bbc_text( 'about.why_title' ) ); ?></h2>
		<ol class="on-usp">
			<?php foreach ( bbc_list( 'advantages' ) as $bb_i => $bb_item ) : ?>
				<li><span class="on-n"><?php echo esc_html( str_pad( (string) ( $bb_i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span><h3 class="h3"><?php echo esc_html( $bb_item['title'] ); ?></h3><p class="muted"><?php echo esc_html( $bb_item['text'] ); ?></p></li>
			<?php endforeach; ?>
		</ol>
	</div>
</section>

<section class="section">
	<div class="wrap on-duo on-reverse">
		<?php if ( $bb_philosophy ) : ?>
			<div class="on-pic" style="--a:<?php echo esc_attr( bbc_aspect( $bb_philosophy ) ); ?>"><?php echo bb_photo( $bb_philosophy, 'Гравированная накладка на бак' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
		<?php endif; ?>
		<div class="on-copy">
			<h2 class="h2"><?php echo esc_html( bbc_text( 'about.philosophy_title' ) ); ?></h2>
			<p class="lead"><?php echo esc_html( bbc_text( 'about.philosophy_lead' ) ); ?></p>
			<p class="muted"><?php echo esc_html( bbc_text( 'about.philosophy_note' ) ); ?></p>
		</div>
	</div>
</section>

<?php bb_project_rail( bbc_text( 'about.built_title' ) ); ?>

<section class="section tight">
	<div class="wrap">
		<h2 class="h2 on-head"><?php echo esc_html( bbc_text( 'about.process_title' ) ); ?></h2>
		<?php bb_process_road( true ); ?>
	</div>
</section>

<section class="section tight">
	<div class="wrap"><h2 class="h2 on-head"><?php echo esc_html( bbc_text( 'about.reviews_title' ) ); ?></h2><?php bb_reviews(); ?></div>
</section>
<?php
get_footer();
