<?php
/**
 * All projects with brand and style filters.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'pa';
get_header();
$bb_projects = bbc_projects();
$bb_brands   = array_values( array_unique( array_filter( array_column( $bb_projects, 'brand' ) ) ) );
$bb_used     = array_unique( array_filter( array_column( $bb_projects, 'style' ) ) );
$bb_styles   = array_filter(
	bbc_styles(),
	static function ( $s ) use ( $bb_used ) {
		return in_array( $s['id'], $bb_used, true );
	}
);

bb_page_hero(
	array(
		'title'   => bbc_text( 'projects.hero_title' ),
		'lead'    => bbc_text( 'projects.hero_lead' ),
		'photo'   => (int) bbc_image( 'projects_hero' ),
		'alt'     => 'Triumph Rocket 3R после кастомизации',
		'actions' => '<a class="btn btn-signal pa-cta" href="#zayavka">Обсудить проект</a>',
	)
);
?>
<section class="section pa-catalog">
	<div class="wrap">
		<div class="pa-filters" role="group" aria-label="Фильтры" data-total="<?php echo (int) count( $bb_projects ); ?>">
			<div class="pa-group" data-filter="brand">
				<span class="pa-label">Марка</span>
				<button type="button" class="pa-on" aria-pressed="true" data-value="">Все</button>
				<?php foreach ( $bb_brands as $bb_brand ) : ?>
					<button type="button" aria-pressed="false" data-value="<?php echo esc_attr( $bb_brand ); ?>"><?php echo esc_html( $bb_brand ); ?></button>
				<?php endforeach; ?>
			</div>
			<div class="pa-group" data-filter="style">
				<span class="pa-label">Стиль</span>
				<button type="button" class="pa-on" aria-pressed="true" data-value="">Все</button>
				<?php foreach ( $bb_styles as $bb_style ) : ?>
					<button type="button" aria-pressed="false" data-value="<?php echo (int) $bb_style['id']; ?>"><?php echo esc_html( $bb_style['name'] ); ?></button>
				<?php endforeach; ?>
			</div>
			<p class="pa-found" aria-live="polite">Показано: <?php echo (int) count( $bb_projects ); ?> из <?php echo (int) count( $bb_projects ); ?></p>
		</div>
		<ul class="justified pa-list">
			<?php foreach ( $bb_projects as $bb_p ) : ?>
				<li style="--a:<?php echo esc_attr( $bb_p['aspect'] ); ?>" data-brand="<?php echo esc_attr( $bb_p['brand'] ); ?>" data-style="<?php echo (int) $bb_p['style']; ?>"><?php echo bb_project_card( $bb_p ); // phpcs:ignore WordPress.Security.EscapeOutput ?></li>
			<?php endforeach; ?>
		</ul>
		<p class="pa-empty" hidden>В этом сочетании проектов нет. <button type="button" class="link-brass">Сбросить фильтры</button></p>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 class="h2 pa-head"><?php echo esc_html( bbc_text( 'projects.process_title' ) ); ?></h2>
		<?php bb_process_road( true ); ?>
	</div>
</section>

<section class="section">
	<div class="wrap pa-two"><h2 class="h2">Вопросы</h2><?php bb_faq(); ?></div>
</section>
<?php
get_footer();
