<?php
/**
 * Page not found.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'er';
get_header();
?>
<section class="er-error">
	<div class="wrap">
		<p class="er-code">404</p>
		<h1 class="h2">Такой страницы нет</h1>
		<p class="muted">Возможно, адрес устарел. Начните с главной или посмотрите проекты.</p>
		<div class="er-actions"><a class="btn btn-signal" href="<?php echo esc_url( home_url( '/' ) ); ?>">На главную</a><a class="btn btn-line" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Проекты</a></div>
	</div>
</section>
<?php
get_footer();
