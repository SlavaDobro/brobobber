<?php
/**
 * Site header, phone dashboard and full-screen menu.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$bb_contacts = bbc_contacts();
$bb_first    = $bb_contacts['phones'][0] ?? null;
$bb_nav      = bb_nav_items();
$bb_home     = home_url( '/' );
$bb_projects = get_post_type_archive_link( 'bb_project' );
$bb_services = get_post_type_archive_link( 'bb_service' );
$bb_is_path  = static function ( $url ) {
	$current = untrailingslashit( (string) wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH ) );
	$path    = untrailingslashit( (string) wp_parse_url( (string) $url, PHP_URL_PATH ) );
	return '' !== $path && ( $current === $path || 0 === strpos( $current . '/', $path . '/' ) );
};
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#1c1d1b">
	<link rel="icon" type="image/svg+xml" href="<?php echo esc_url( get_template_directory_uri() . '/assets/images/favicon.svg' ); ?>">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#content">Перейти к содержанию</a>

<header class="hd hd-header">
	<div class="hd-bar wrap">
		<a class="hd-logo" href="<?php echo esc_url( $bb_home ); ?>" aria-label="Brobobber, на главную">
			<?php echo bb_logo( 38 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
			<span class="hd-logo-place"><?php echo esc_html( $bb_contacts['address_short'] ); ?></span>
		</a>
		<nav class="hd-nav" aria-label="Разделы сайта">
			<?php foreach ( $bb_nav as $bb_item ) : ?>
				<?php if ( $bb_item['menu'] ) : ?>
					<?php $bb_children = 'bb_service' === $bb_item['menu'] ? bbc_services() : bbc_styles(); ?>
					<div class="hd-has-menu">
						<a href="<?php echo esc_url( $bb_item['url'] ); ?>" class="<?php echo $bb_item['active'] ? 'hd-active' : ''; ?>"><?php echo esc_html( $bb_item['label'] ); ?><?php echo bb_icon( 'chevron-down', 14 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
						<div class="hd-dropdown<?php echo 'bb_service' === $bb_item['menu'] ? ' hd-wide' : ''; ?>" hidden>
							<?php foreach ( $bb_children as $bb_child ) : ?>
								<a href="<?php echo esc_url( $bb_child['url'] ); ?>"><?php echo esc_html( $bb_child['name'] ); ?></a>
							<?php endforeach; ?>
						</div>
					</div>
				<?php else : ?>
					<a href="<?php echo esc_url( $bb_item['url'] ); ?>" class="<?php echo $bb_item['active'] ? 'hd-active' : ''; ?>"><?php echo esc_html( $bb_item['label'] ); ?></a>
				<?php endif; ?>
			<?php endforeach; ?>
		</nav>
		<div class="hd-actions">
			<div class="hd-reach">
				<?php if ( $bb_first ) : ?><a class="hd-phone" href="<?php echo esc_attr( $bb_first['href'] ); ?>"><?php echo bb_icon( 'phone', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_first['phone'] ); ?></a><?php endif; ?>
				<span class="hd-hours"><?php echo bb_icon( 'clock', 12 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_contacts['hours_short'] ); ?></span>
			</div>
			<a class="btn btn-signal hd-cta" href="#zayavka">Обсудить проект</a>
		</div>
	</div>
</header>

<nav class="hd hd-dash" aria-label="Быстрые действия">
	<a href="<?php echo esc_url( $bb_projects ); ?>" class="<?php echo $bb_is_path( $bb_projects ) ? 'hd-active' : ''; ?>"><?php echo bb_icon( 'layout-grid' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span>Проекты</span></a>
	<a href="<?php echo esc_url( $bb_services ); ?>" class="<?php echo $bb_is_path( $bb_services ) ? 'hd-active' : ''; ?>"><?php echo bb_icon( 'wrench' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span>Услуги</span></a>
	<button type="button" class="hd-call" aria-label="Позвонить или написать мастеру" aria-expanded="false"><span class="hd-call-ring"><?php echo bb_icon( 'phone', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span></button>
	<a href="#zayavka" data-close-sheets><?php echo bb_icon( 'send' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><span>Заявка</span></a>
	<button type="button" class="hd-menu-toggle" aria-label="Открыть меню" aria-expanded="false"><span class="bb-i-open"><?php echo bb_icon( 'menu' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span class="bb-i-close" hidden><?php echo bb_icon( 'x' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span>Меню</span></button>
</nav>

<div class="hd hd-call-sheet" role="dialog" aria-label="Связаться с мастером" hidden>
	<?php foreach ( $bb_contacts['phones'] as $bb_person ) : ?>
		<div class="hd-person">
			<strong><?php echo esc_html( $bb_person['name'] ); ?></strong>
			<a class="btn btn-signal" href="<?php echo esc_attr( $bb_person['href'] ); ?>"><?php echo bb_icon( 'phone', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_person['phone'] ); ?></a>
			<?php if ( $bb_person['telegram'] ) : ?><a class="btn btn-line" href="<?php echo esc_url( 'https://t.me/' . $bb_person['telegram'] ); ?>" target="_blank" rel="noopener"><?php echo bb_icon( 'send', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>Telegram</a><?php endif; ?>
		</div>
	<?php endforeach; ?>
	<p class="hd-hours"><?php echo bb_icon( 'clock', 13 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_contacts['hours'] ); ?></p>
</div>
<button type="button" class="hd hd-scrim" aria-label="Закрыть" hidden></button>

<div class="hd hd-sheet" role="dialog" aria-modal="true" aria-label="Меню" hidden>
	<div class="hd-sheet-top wrap">
		<?php echo bb_logo( 52, false ); // phpcs:ignore WordPress.Security.EscapeOutput ?>
		<p class="muted"><?php echo esc_html( $bb_contacts['address'] ); ?><br><?php echo esc_html( $bb_contacts['hours'] ); ?></p>
	</div>
	<nav class="hd-sheet-nav wrap" aria-label="Меню">
		<a href="<?php echo esc_url( $bb_home ); ?>" class="<?php echo is_front_page() ? 'hd-active' : ''; ?>" style="--i:0"><span>01</span>Главная</a>
		<?php foreach ( $bb_nav as $bb_i => $bb_item ) : ?>
			<a href="<?php echo esc_url( $bb_item['url'] ); ?>" class="<?php echo $bb_item['active'] ? 'hd-active' : ''; ?>" style="--i:<?php echo (int) ( $bb_i + 1 ); ?>"><span><?php echo esc_html( str_pad( (string) ( $bb_i + 2 ), 2, '0', STR_PAD_LEFT ) ); ?></span><?php echo esc_html( $bb_item['label'] ); ?></a>
		<?php endforeach; ?>
	</nav>
	<div class="hd-sheet-foot wrap">
		<a class="btn btn-signal" href="#zayavka" data-close-sheets>Обсудить проект</a>
		<a class="btn btn-line" href="<?php echo esc_url( $bb_contacts['channel_url'] ); ?>" target="_blank" rel="noopener"><?php echo bb_icon( 'send', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>Канал</a>
	</div>
</div>

<div class="sh sh-door" aria-hidden="true">
	<?php for ( $bb_s = 0; $bb_s < 9; $bb_s++ ) : ?><span class="sh-slat"></span><?php endfor; ?>
	<span class="sh-badge"><?php echo bb_logo( 96, false ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
	<span class="sh-handle"></span>
</div>

<main id="content" class="<?php echo esc_attr( $GLOBALS['bb_page_class'] ?? '' ); ?>">
