<?php
/**
 * Regular page, such as the privacy policy.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

$GLOBALS['bb_page_class'] = 'pl';
get_header();
the_post();
?>
<section class="pl-policy">
	<div class="wrap">
		<h1 class="h2"><?php the_title(); ?></h1>
		<div class="pl-text"><?php the_content(); ?></div>
	</div>
</section>
<?php
get_footer();
