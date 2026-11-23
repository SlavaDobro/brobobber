<?php
/**
 * Fallback for anything without its own template (blog posts, search).
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'pl';
get_header();
?>
<section class="pl-policy">
	<div class="wrap">
		<?php if ( is_singular() && have_posts() ) : ?>
			<?php the_post(); ?>
			<h1 class="h2"><?php the_title(); ?></h1>
			<div class="pl-text"><?php the_content(); ?></div>
		<?php elseif ( have_posts() ) : ?>
			<h1 class="h2"><?php echo esc_html( wp_strip_all_tags( get_the_archive_title() ) ); ?></h1>
			<div class="pl-text">
				<?php while ( have_posts() ) : ?>
					<?php the_post(); ?>
					<h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
					<p><?php echo esc_html( get_the_excerpt() ); ?></p>
				<?php endwhile; ?>
				<?php the_posts_pagination(); ?>
			</div>
		<?php else : ?>
			<h1 class="h2">Ничего не найдено</h1>
		<?php endif; ?>
	</div>
</section>
<?php
get_footer();
