<?php
/**
 * Template Name: Контакты
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'kt';
get_header();
$bb_c = bbc_contacts();

bb_page_hero(
	array(
		'title' => bbc_text( 'contacts.hero_title' ),
		'lead'  => bbc_text( 'contacts.hero_lead' ),
	)
);
?>
<section class="section">
	<div class="wrap kt-cards">
		<?php foreach ( $bb_c['phones'] as $bb_person ) : ?>
			<article class="kt-card">
				<h2 class="h3"><?php echo esc_html( $bb_person['name'] ); ?></h2>
				<a class="kt-big" href="<?php echo esc_attr( $bb_person['href'] ); ?>"><?php echo bb_icon( 'phone' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_person['phone'] ); ?></a>
				<?php if ( $bb_person['telegram'] ) : ?><a class="link-brass" href="<?php echo esc_url( 'https://t.me/' . $bb_person['telegram'] ); ?>" target="_blank" rel="noopener"><?php echo bb_icon( 'send', 15 ); // phpcs:ignore WordPress.Security.EscapeOutput ?> Telegram @<?php echo esc_html( $bb_person['telegram'] ); ?></a><?php endif; ?>
			</article>
		<?php endforeach; ?>
		<article class="kt-card">
			<h2 class="h3">Почта</h2>
			<a class="kt-big" href="<?php echo esc_attr( 'mailto:' . $bb_c['email'] ); ?>"><?php echo bb_icon( 'mail' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_c['email'] ); ?></a>
			<p class="muted">Для заявок, фото мотоцикла и вопросов по проекту.</p>
		</article>
		<article class="kt-card kt-channel">
			<h2 class="h3">Telegram-канал Brobobber</h2>
			<a class="kt-big" href="<?php echo esc_url( $bb_c['channel_url'] ); ?>" target="_blank" rel="noopener"><?php echo bb_icon( 'send' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_c['channel_handle'] ); ?></a>
			<p class="muted">Новые проекты, ролики из мастерской и мотоциклы в наличии.</p>
		</article>
		<article class="kt-card">
			<h2 class="h3">Адрес</h2>
			<p class="kt-addr"><?php echo bb_icon( 'map-pin' ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_c['address'] ); ?></p>
			<p class="kt-hours"><?php echo bb_icon( 'clock', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $bb_c['hours'] ); ?></p>
			<p class="muted">Индекс <?php echo esc_html( $bb_c['postal'] ); ?></p>
		</article>
	</div>
</section>
<?php
bb_map_block();
get_footer();
