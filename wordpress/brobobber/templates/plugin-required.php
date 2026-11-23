<?php
/**
 * Shown while the content plugin is not active.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;
?><!doctype html>
<html <?php language_attributes(); ?>>
<head><meta charset="<?php bloginfo( 'charset' ); ?>"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Brobobber</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1c1d1b;color:#ece8df;font:18px/1.5 system-ui,sans-serif;text-align:center;padding:24px}</style></head>
<body><p>Сайт настраивается.<?php if ( current_user_can( 'activate_plugins' ) ) : ?><br>Активируйте плагин Brobobber Core в <a style="color:#c39a55" href="<?php echo esc_url( admin_url( 'plugins.php' ) ); ?>">разделе «Плагины»</a>.<?php endif; ?></p></body>
</html>
