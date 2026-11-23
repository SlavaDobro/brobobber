<?php
/**
 * All motorcycle styles.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'ma';
get_header();
$bb_projects = bbc_projects();

bb_page_hero(
	array(
		'title' => bbc_text( 'styles.hero_title' ),
		'lead'  => bbc_text( 'styles.hero_lead' ),
		'photo' => (int) bbc_image( 'styles_hero' ),
		'alt'   => 'Yamaha V-Max 1700 из мастерской Brobobber',
	)
);
?>
<section class="section">
	<div class="wrap">
		<ul class="ma-styles justified fill">
			<?php foreach ( bbc_styles() as $bb_style ) : ?>
				<?php
				$bb_count = count(
					array_filter(
						$bb_projects,
						static function ( $p ) use ( $bb_style ) {
							return $p['style'] === $bb_style['id'];
						}
					)
				);
				?>
				<li style="--a:<?php echo esc_attr( bbc_aspect( $bb_style['photo'] ) ); ?>">
					<a class="ma-style" href="<?php echo esc_url( $bb_style['url'] ); ?>">
						<span class="ma-pic"><?php echo bb_photo( $bb_style['photo'], $bb_style['name'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
						<span class="ma-row"><span class="ma-name"><?php echo esc_html( $bb_style['name'] ); ?></span><span class="ma-count"><?php echo $bb_count ? (int) $bb_count : ''; ?></span></span>
						<span class="ma-lead-s"><?php echo esc_html( $bb_style['lead'] ); ?></span>
					</a>
					<?php if ( $bb_style['credit'] ) : ?><div class="ma-credit-line"><?php echo bb_photo_credit( $bb_style['credit'] ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div><?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head"><h2 class="h2"><?php echo esc_html( bbc_text( 'styles.work_title' ) ); ?></h2><p><?php echo esc_html( bbc_text( 'styles.work_lead' ) ); ?></p></div>
		<?php bb_service_bike(); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head"><h2 class="h2">Наши проекты</h2><a class="link-brass" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Все проекты</a></div>
		<?php bb_project_list( array_slice( $bb_projects, 0, 4 ) ); ?>
	</div>
</section>
<?php
get_footer();
