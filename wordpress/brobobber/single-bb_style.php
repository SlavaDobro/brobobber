<?php
/**
 * One motorcycle style.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'ms';
get_header();
the_post();

$bb_s     = bbc_style( get_the_ID() );
$bb_all   = bbc_projects();
$bb_own   = array_values(
	array_filter(
		$bb_all,
		static function ( $p ) use ( $bb_s ) {
			return $p['style'] === $bb_s['id'];
		}
	)
);
$bb_shown = $bb_own ? $bb_own : array_slice( $bb_all, 0, 3 );
$bb_extra = '<a class="btn btn-signal ms-cta" href="#zayavka">Обсудить проект</a>' . ( $bb_s['credit'] ? bb_photo_credit( $bb_s['credit'] ) : '' );

bb_page_hero(
	array(
		'title'   => $bb_s['name'],
		'lead'    => $bb_s['lead'],
		'photo'   => $bb_s['photo'],
		'alt'     => 'Мотоцикл в стиле ' . mb_strtolower( $bb_s['name'] ),
		'crumbs'  => array( array( home_url( '/' ), 'Главная' ), array( get_post_type_archive_link( 'bb_style' ), 'Мотоциклы' ) ),
		'actions' => $bb_extra,
	)
);
?>
<section class="section">
	<div class="wrap">
		<h2 class="h2 ms-head">Особенности стиля</h2>
		<dl class="ms-traits">
			<?php foreach ( $bb_s['traits'] as $bb_trait ) : ?>
				<div><dt><?php echo esc_html( $bb_trait['term'] ?? '' ); ?></dt><dd><?php echo esc_html( $bb_trait['value'] ?? '' ); ?></dd></div>
			<?php endforeach; ?>
		</dl>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head">
			<h2 class="h2"><?php echo $bb_own ? 'Наши проекты в этом стиле' : 'Наши проекты'; ?></h2>
			<?php if ( ! $bb_own ) : ?><p>Проектов именно в этом стиле на сайте пока нет — вот что мы строили недавно.</p><?php endif; ?>
			<a class="link-brass" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Все проекты</a>
		</div>
		<?php bb_project_list( $bb_shown ); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<div class="section-head"><h2 class="h2">Что можно доработать</h2></div>
		<?php bb_service_bike(); ?>
	</div>
</section>

<section class="section">
	<div class="wrap ms-two">
		<h2 class="h2">Вопросы</h2>
		<?php bb_faq(); ?>
	</div>
</section>

<section class="section">
	<div class="wrap">
		<h2 class="h3 ms-others-title">Другие стили</h2>
		<ul class="ms-others">
			<?php foreach ( bbc_styles() as $bb_item ) : ?>
				<?php if ( $bb_item['id'] !== $bb_s['id'] ) : ?>
					<li><a href="<?php echo esc_url( $bb_item['url'] ); ?>"><?php echo esc_html( $bb_item['name'] ); ?></a></li>
				<?php endif; ?>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
<?php
get_footer();
