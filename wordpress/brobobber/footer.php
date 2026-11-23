<?php
/**
 * Request form, map and site footer.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$bb_contacts = bbc_contacts();
?>
</main>

<?php
bb_request_form();
if ( ! is_page_template( 'templates/contacts.php' ) ) {
	bb_map_block();
}
?>

<footer class="ft ft-footer">
	<div class="wrap ft-top">
		<div class="ft-brand">
			<a class="ft-badge" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="Brobobber, на главную"><?php echo bb_logo( 132, false ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a>
			<a class="ft-word" href="<?php echo esc_url( home_url( '/' ) ); ?>">Brobobber</a>
			<p class="muted"><?php echo esc_html( bbc_text( 'footer.tagline' ) ); ?></p>
		</div>
		<nav aria-label="Разделы">
			<h2>Разделы</h2>
			<ul>
				<?php foreach ( bb_nav_items() as $bb_item ) : ?>
					<li><a href="<?php echo esc_url( $bb_item['url'] ); ?>"><?php echo esc_html( $bb_item['label'] ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</nav>
		<nav aria-label="Популярные услуги">
			<h2>Услуги</h2>
			<ul>
				<?php foreach ( array_slice( bbc_services(), 0, 6 ) as $bb_service ) : ?>
					<li><a href="<?php echo esc_url( $bb_service['url'] ); ?>"><?php echo esc_html( $bb_service['name'] ); ?></a></li>
				<?php endforeach; ?>
			</ul>
		</nav>
		<div class="ft-contact">
			<h2>Связаться</h2>
			<ul>
				<?php foreach ( $bb_contacts['phones'] as $bb_person ) : ?>
					<li><a href="<?php echo esc_attr( $bb_person['href'] ); ?>"><?php echo esc_html( $bb_person['phone'] ); ?></a> <span class="muted"><?php echo esc_html( $bb_person['name'] ); ?></span></li>
				<?php endforeach; ?>
				<li><a href="<?php echo esc_attr( 'mailto:' . $bb_contacts['email'] ); ?>"><?php echo esc_html( $bb_contacts['email'] ); ?></a></li>
				<li><a href="<?php echo esc_url( $bb_contacts['channel_url'] ); ?>" target="_blank" rel="noopener">Telegram <?php echo esc_html( $bb_contacts['channel_handle'] ); ?></a></li>
			</ul>
		</div>
	</div>
	<div class="wrap ft-bottom">
		<span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> Brobobber</span>
		<a href="<?php echo esc_url( get_privacy_policy_url() ? get_privacy_policy_url() : home_url( '/politika/' ) ); ?>">Политика конфиденциальности</a>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
