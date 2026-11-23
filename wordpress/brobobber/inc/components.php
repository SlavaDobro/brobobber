<?php
/**
 * Page blocks. Each function mirrors one component of the original site, with the same markup.
 *
 * @package Brobobber
 */

defined( 'ABSPATH' ) || exit;

/**
 * Inline icon.
 *
 * @param string $name  Icon name.
 * @param int    $size  Size in px.
 * @param string $class Extra class.
 * @param bool   $fill  Filled shape.
 */
function bb_icon( $name, $size = 20, $class = '', $fill = false ) {
	static $icons = null;
	if ( null === $icons ) {
		$icons = require get_template_directory() . '/inc/icons-data.php';
	}
	if ( empty( $icons[ $name ] ) ) {
		return '';
	}
	return '<svg xmlns="http://www.w3.org/2000/svg" width="' . (int) $size . '" height="' . (int) $size . '" viewBox="0 0 24 24" fill="' . ( $fill ? 'currentColor' : 'none' ) . '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' . ( $class ? ' class="' . esc_attr( $class ) . '"' : '' ) . ' aria-hidden="true">' . $icons[ $name ] . '</svg>'; // Icons come from the theme's own generated file.
}

/**
 * The club badge: crossed wrenches in a sprocket, locked by a hex nut.
 *
 * @param int  $size Size in px.
 * @param bool $word Show the name next to it.
 */
function bb_logo( $size = 40, $word = true ) {
	static $uid = 0;
	++$uid;
	$pt = static function ( $r, $deg ) {
		return array( round( $r * sin( deg2rad( $deg ) ), 2 ), round( -$r * cos( deg2rad( $deg ) ), 2 ) );
	};
	$teeth    = 30;
	$pitch    = 360 / $teeth;
	$sprocket = '';
	for ( $i = 0; $i < $teeth; $i++ ) {
		$a = $i * $pitch;
		foreach ( array( array( 54, -.5 ), array( 54.6, -.3 ), array( 59, -.17 ), array( 59, .17 ), array( 54.6, .3 ) ) as $j => $p ) {
			$xy        = $pt( $p[0], $a + $pitch * $p[1] );
			$sprocket .= ( 0 === $i && 0 === $j ? 'M' : 'L' ) . $xy[0] . ' ' . $xy[1];
		}
	}
	$sprocket .= 'Z';
	$c         = 31;
	$r         = 8.6;
	$h         = 3.1;
	$w         = 3.3;
	$a         = round( sqrt( $r * $r - $h * $h ), 2 );
	$b         = round( sqrt( $r * $r - $w * $w ), 2 );
	$wrench    = 'M' . ( -$c + $a ) . ' ' . ( -$h ) . ' L' . ( $c - $a ) . ' ' . ( -$h ) . " A$r $r 0 0 1 " . ( $c + $b ) . ' ' . ( -$w ) . " L$c " . ( -$w ) . " A$w $w 0 0 0 $c $w L" . ( $c + $b ) . " $w A$r $r 0 0 1 " . ( $c - $a ) . " $h L" . ( -$c + $a ) . " $h A$r $r 0 0 1 " . ( -$c - $b ) . " $w L" . ( -$c ) . " $w A$w $w 0 0 0 " . ( -$c ) . ' ' . ( -$w ) . ' L' . ( -$c - $b ) . ' ' . ( -$w ) . " A$r $r 0 0 1 " . ( -$c + $a ) . ' ' . ( -$h ) . ' Z';
	$nut       = array();
	for ( $i = 0; $i < 6; $i++ ) {
		$nut[] = implode( ' ', $pt( 13.4, 30 + $i * 60 ) );
	}
	$full = $size >= 80;
	ob_start();
	?>
	<span class="lg lg-logo-mark" role="img" aria-label="Brobobber Custom Club">
		<svg viewBox="-60 -60 120 120" width="<?php echo (int) $size; ?>" height="<?php echo (int) $size; ?>" aria-hidden="true">
			<g class="lg-spin" data-part="gear"><path d="<?php echo esc_attr( $sprocket ); ?>" class="lg-sprocket"/></g>
			<circle r="52.4" class="lg-band"/>
			<circle r="41.4" class="lg-field"/>
			<?php if ( $full ) : ?>
				<?php
				$t1 = $pt( 43.6, -112 );
				$t2 = $pt( 43.6, 112 );
				$b1 = $pt( 50, -128 );
				$b2 = $pt( 50, 128 );
				?>
				<path id="bb-logo-<?php echo (int) $uid; ?>-t" d="M<?php echo esc_attr( $t1[0] . ' ' . $t1[1] ); ?> A43.6 43.6 0 1 1 <?php echo esc_attr( $t2[0] . ' ' . $t2[1] ); ?>" fill="none"/>
				<path id="bb-logo-<?php echo (int) $uid; ?>-b" d="M<?php echo esc_attr( $b1[0] . ' ' . $b1[1] ); ?> A50 50 0 0 0 <?php echo esc_attr( $b2[0] . ' ' . $b2[1] ); ?>" fill="none"/>
				<text class="lg-ring-text"><textPath href="#bb-logo-<?php echo (int) $uid; ?>-t" startOffset="50%">BROBOBBER CUSTOM CLUB</textPath></text>
				<text class="lg-ring-text lg-city"><textPath href="#bb-logo-<?php echo (int) $uid; ?>-b" startOffset="50%">MOSCOW</textPath></text>
				<?php
				foreach ( array( -122, 122 ) as $deg ) {
					$s = $pt( 46.8, $deg );
					echo '<circle cx="' . esc_attr( $s[0] ) . '" cy="' . esc_attr( $s[1] ) . '" r="1.6" class="lg-star"/>';
				}
				?>
			<?php else : ?>
				<?php
				for ( $i = 0; $i < 12; $i++ ) {
					$s = $pt( 46.5, $i * 30 + 15 );
					echo '<circle cx="' . esc_attr( $s[0] ) . '" cy="' . esc_attr( $s[1] ) . '" r="2" class="lg-rivet"/>';
				}
				?>
			<?php endif; ?>
			<g class="lg-spin" data-part="tools">
				<?php foreach ( array( 45, -45 ) as $turn ) : ?>
					<g transform="rotate(<?php echo (int) $turn; ?>)">
						<path d="<?php echo esc_attr( $wrench ); ?>" class="lg-wrench"/>
						<path d="M<?php echo esc_attr( ( -$c + $r + 2 ) . ' 0 H' . ( $c - $r - 2 ) ); ?>" class="lg-groove"/>
					</g>
				<?php endforeach; ?>
			</g>
			<g class="lg-spin" data-part="bolt">
				<polygon points="<?php echo esc_attr( implode( ' ', $nut ) ); ?>" class="lg-nut"/>
				<circle r="10.2" class="lg-chamfer"/>
			</g>
			<text class="lg-mono" y="4.1">BB</text>
		</svg>
		<?php if ( $word ) : ?><span class="lg-word">Brobobber</span><?php endif; ?>
	</span>
	<?php
	return ob_get_clean();
}

/**
 * Responsive photo. The site script fits it to its frame without cropping the motorcycle.
 *
 * @param int    $id    Attachment id.
 * @param string $alt   Alternative text; null keeps the one from the library.
 * @param bool   $eager First-screen photo.
 * @param bool   $cover Always fill the frame.
 */
function bb_photo( $id, $alt = null, $eager = false, $cover = false ) {
	if ( ! $id ) {
		return '';
	}
	$blur = wp_get_attachment_image_src( $id, 'bb-blur' );
	$attr = array(
		'class'       => 'photo',
		'loading'     => $eager ? 'eager' : 'lazy',
		'decoding'    => $eager ? 'sync' : 'async',
		'sizes'       => '(max-width: 800px) 100vw, 50vw',
		'data-aspect' => bbc_aspect( $id ),
		'data-blur'   => $blur ? $blur[0] : '',
	);
	if ( $eager ) {
		$attr['fetchpriority'] = 'high';
	}
	if ( $cover ) {
		$attr['data-cover'] = '1';
	}
	if ( null !== $alt ) {
		$attr['alt'] = $alt;
	}
	return wp_get_attachment_image( $id, 'full', false, $attr );
}

/**
 * Project card.
 *
 * @param array $p Project data.
 */
function bb_project_card( $p ) {
	$count = count( $p['works'] );
	$first = $count ? $count . ' ' . bbc_plural( $count, array( 'работа', 'работы', 'работ' ) ) : ( $p['year'] ? $p['year'] . ' год' : '' );
	$tags  = implode( ', ', array_filter( array( $first, mb_strtolower( $p['style_name'] ) ) ) );
	return '<a class="pc pc-card" href="' . esc_url( $p['url'] ) . '"><span class="pc-frame">' . bb_photo( $p['cover'], $p['name'] ) . '</span><span class="pc-meta"><span class="pc-name">' . esc_html( $p['name'] ) . '</span><span class="pc-tags">' . esc_html( $tags ) . '</span></span></a>';
}

/**
 * Justified list of project cards.
 *
 * @param array $projects Projects.
 */
function bb_project_list( $projects ) {
	echo '<ul class="justified fill">';
	foreach ( $projects as $p ) {
		echo '<li style="--a:' . esc_attr( $p['aspect'] ) . '">' . bb_project_card( $p ) . '</li>'; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in bb_project_card.
	}
	echo '</ul>';
}

/**
 * Endless drifting carousel of the projects.
 *
 * @param string $title Heading.
 */
function bb_project_rail( $title ) {
	$projects = bbc_projects();
	?>
	<section class="rl rl-rail" aria-roledescription="карусель" aria-label="Проекты мастерской">
		<div class="wrap rl-head">
			<div class="section-head"><h2 class="h2"><?php echo esc_html( $title ); ?></h2><a class="link-brass" href="<?php echo esc_url( get_post_type_archive_link( 'bb_project' ) ); ?>">Все проекты</a></div>
		</div>
		<div class="rl-viewport">
			<ul class="rl-track">
				<?php
				foreach ( array( false, true ) as $copy ) {
					foreach ( $projects as $p ) {
						echo '<li style="--a:' . esc_attr( $p['aspect'] ) . '"' . ( $copy ? ' aria-hidden="true" inert' : '' ) . '>' . bb_project_card( $p ) . '</li>'; // phpcs:ignore WordPress.Security.EscapeOutput -- escaped in bb_project_card.
					}
				}
				?>
			</ul>
		</div>
	</section>
	<?php
}

/** Services as points on the motorcycle. */
function bb_service_bike() {
	$services = bbc_services();
	$spotted  = array_values( array_filter( $services, static function ( $s ) { return (bool) $s['spot']; } ) );
	$rest     = array_values( array_filter( $services, static function ( $s ) { return ! $s['spot']; } ) );
	$icons    = array( 'kursy' => 'graduation-cap', 'dopolnitelnye' => 'package-plus', 'motoevakuator' => 'truck' );
	$img      = get_template_directory_uri() . '/assets/images/';
	$first    = $spotted[0] ?? null;
	?>
	<div class="sb sb-bike-map">
		<ol class="sb-list" aria-label="Услуги на мотоцикле">
			<?php foreach ( $spotted as $i => $s ) : ?>
				<li><a href="<?php echo esc_url( $s['url'] ); ?>" class="<?php echo 0 === $i ? 'sb-active' : ''; ?>" data-spot="<?php echo (int) $i; ?>"><span class="sb-num"><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span><?php echo esc_html( $s['name'] ); ?></a></li>
			<?php endforeach; ?>
		</ol>
		<div class="sb-drawing">
			<img src="<?php echo esc_url( $img . 'right-site.webp' ); ?>" srcset="<?php echo esc_url( $img . 'right-site-800.webp' ); ?> 800w, <?php echo esc_url( $img . 'right-site.webp' ); ?> 1536w" sizes="(max-width: 960px) 100vw, 70vw" alt="Мотоцикл с отмеченными узлами, к которым относятся услуги" width="1536" height="1024" loading="lazy" decoding="async">
			<?php foreach ( $spotted as $i => $s ) : ?>
				<button type="button" class="sb-spot<?php echo 0 === $i ? ' sb-active' : ''; ?>" style="left:<?php echo esc_attr( $s['spot'][0] ); ?>%;top:<?php echo esc_attr( $s['spot'][1] ); ?>%" aria-label="<?php echo esc_attr( $s['name'] ); ?>" data-spot="<?php echo (int) $i; ?>" data-name="<?php echo esc_attr( $s['name'] ); ?>" data-short="<?php echo esc_attr( $s['short'] ); ?>" data-url="<?php echo esc_url( $s['url'] ); ?>" data-x="<?php echo esc_attr( $s['spot'][0] ); ?>" data-y="<?php echo esc_attr( $s['spot'][1] ); ?>"><span><?php echo (int) ( $i + 1 ); ?></span></button>
			<?php endforeach; ?>
			<?php if ( $first ) : ?>
				<div class="sb-callout<?php echo $first['spot'][1] > 45 ? ' sb-up' : ''; ?><?php echo $first['spot'][0] > 60 ? ' sb-left-side' : ''; ?>" style="left:<?php echo esc_attr( $first['spot'][0] ); ?>%;top:<?php echo esc_attr( $first['spot'][1] ); ?>%">
					<span class="sb-leader"></span>
					<div class="sb-card"><strong><?php echo esc_html( $first['name'] ); ?></strong><p><?php echo esc_html( $first['short'] ); ?></p><a class="link-brass" href="<?php echo esc_url( $first['url'] ); ?>">Подробнее об услуге</a></div>
				</div>
			<?php endif; ?>
		</div>
		<?php if ( $first ) : ?>
			<div class="sb-tap-card" aria-live="polite">
				<span class="sb-tap-num">01</span>
				<div><strong><?php echo esc_html( $first['name'] ); ?></strong><p><?php echo esc_html( $first['short'] ); ?></p></div>
				<a class="btn btn-line" href="<?php echo esc_url( $first['url'] ); ?>">Подробнее</a>
			</div>
		<?php endif; ?>
		<?php if ( $rest ) : ?>
			<ul class="sb-extra" aria-label="Другие услуги">
				<?php foreach ( $rest as $s ) : ?>
					<li><a href="<?php echo esc_url( $s['url'] ); ?>"><span class="sb-extra-icon"><?php echo bb_icon( $icons[ $s['slug'] ] ?? 'arrow-right', 21 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span><span class="sb-extra-text"><strong><?php echo esc_html( $s['name'] ); ?></strong><small><?php echo esc_html( $s['short'] ); ?></small></span><?php echo bb_icon( 'arrow-right', 18, 'extra-arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></a></li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>
	<?php
}

/** All services as a numbered work order. */
function bb_service_index() {
	$services = bbc_services();
	$rows     = max( 1, (int) ceil( ( count( $services ) + 1 ) / 2 ) );
	echo '<ol class="si si-index" style="grid-template-rows:repeat(' . (int) $rows . ',auto)">';
	foreach ( $services as $i => $s ) {
		echo '<li><a href="' . esc_url( $s['url'] ) . '"><span class="si-n">' . esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ) . '</span><span class="si-text"><strong>' . esc_html( $s['name'] ) . '</strong><small>' . esc_html( $s['short'] ) . '</small></span>' . bb_icon( 'arrow-right', 18 ) . '</a></li>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '<li class="si-all"><a href="' . esc_url( get_post_type_archive_link( 'bb_service' ) ) . '"><span class="si-text"><strong>Все услуги мастерской</strong></span>' . bb_icon( 'arrow-right', 20 ) . '</a></li></ol>'; // phpcs:ignore WordPress.Security.EscapeOutput
}

/**
 * The process as a road with an odometer.
 *
 * @param bool $compact Tighter list.
 */
function bb_process_road( $compact = false ) {
	$steps = bbc_list( 'process' );
	if ( ! $steps ) {
		return;
	}
	$drum = '';
	for ( $d = 0; $d < 10; $d++ ) {
		$drum .= '<span>' . $d . '</span>';
	}
	?>
	<div class="pr pr-road<?php echo $compact ? ' pr-compact' : ''; ?>">
		<aside class="pr-odo" aria-hidden="true">
			<div class="pr-counter">
				<span class="pr-drum"><span class="pr-strip" style="--to:0;--delay:0ms"><?php echo $drum; // phpcs:ignore WordPress.Security.EscapeOutput ?></span></span>
				<span class="pr-drum"><span class="pr-strip" style="--to:1;--delay:60ms"><?php echo $drum; // phpcs:ignore WordPress.Security.EscapeOutput ?></span></span>
				<span class="pr-of">/ <?php echo esc_html( str_pad( (string) count( $steps ), 2, '0', STR_PAD_LEFT ) ); ?></span>
			</div>
			<p class="pr-now"><?php echo esc_html( $steps[0]['title'] ); ?></p>
		</aside>
		<div class="pr-track">
			<svg class="pr-line" viewBox="0 0 24 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M12 0 V1000" class="pr-base"/><path d="M12 0 V1000" class="pr-laid" pathLength="1" style="stroke-dashoffset:1"/></svg>
			<ol>
				<?php foreach ( $steps as $i => $step ) : ?>
					<li class="<?php echo 0 === $i ? 'pr-passed' : ''; ?>" data-title="<?php echo esc_attr( $step['title'] ); ?>">
						<span class="pr-dot"></span>
						<h3 class="h3"><span class="pr-n"><?php echo esc_html( str_pad( (string) ( $i + 1 ), 2, '0', STR_PAD_LEFT ) ); ?></span><?php echo esc_html( $step['title'] ); ?></h3>
						<p><?php echo esc_html( $step['text'] ); ?></p>
					</li>
				<?php endforeach; ?>
			</ol>
		</div>
	</div>
	<?php
}

/** Reviews row. */
function bb_reviews() {
	$reviews = bbc_list( 'reviews' );
	if ( ! $reviews ) {
		return;
	}
	?>
	<div class="rv rv-reviews">
		<ul class="rv-row shelf">
			<?php foreach ( $reviews as $r ) : ?>
				<li><blockquote><p><?php echo esc_html( $r['text'] ); ?></p><footer><?php echo esc_html( $r['author'] ); ?></footer></blockquote></li>
			<?php endforeach; ?>
		</ul>
		<div class="rv-controls">
			<button type="button" aria-label="Предыдущие отзывы" data-dir="-1"><?php echo bb_icon( 'chevron-left' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
			<button type="button" aria-label="Следующие отзывы" data-dir="1"><?php echo bb_icon( 'chevron-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
		</div>
	</div>
	<?php
}

/** Reel of vertical videos: nothing but the poster loads until play is pressed. */
function bb_video_reel() {
	$videos = bbc_videos();
	if ( ! $videos ) {
		return;
	}
	?>
	<div class="vr">
		<ul class="vr-reel shelf">
			<?php foreach ( $videos as $v ) : ?>
				<?php
				$src    = wp_get_attachment_url( (int) $v['video'] );
				$poster = ! empty( $v['poster'] ) ? wp_get_attachment_url( (int) $v['poster'] ) : '';
				if ( ! $src ) {
					continue;
				}
				?>
				<li>
					<figure>
						<button type="button" class="vr-poster" aria-label="<?php echo esc_attr( 'Смотреть видео: ' . $v['title'] ); ?>" data-src="<?php echo esc_url( $src ); ?>" data-poster="<?php echo esc_url( (string) $poster ); ?>" style="background-image:url('<?php echo esc_url( (string) $poster ); ?>')">
							<video src="<?php echo esc_url( $src ); ?>#t=0.6" muted playsinline preload="metadata" tabindex="-1" aria-hidden="true"></video>
							<span class="vr-play"><?php echo bb_icon( 'play', 22, '', true ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
							<span class="vr-duration"><?php echo esc_html( $v['duration'] ); ?></span>
						</button>
						<figcaption><?php echo esc_html( $v['title'] ); ?></figcaption>
					</figure>
				</li>
			<?php endforeach; ?>
		</ul>
		<div class="vr-controls">
			<button type="button" aria-label="Предыдущие ролики" data-dir="-1" disabled><?php echo bb_icon( 'chevron-left' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
			<button type="button" aria-label="Следующие ролики" data-dir="1"><?php echo bb_icon( 'chevron-right' ); // phpcs:ignore WordPress.Security.EscapeOutput ?></button>
		</div>
	</div>
	<?php
}

/**
 * Questions and answers.
 *
 * @param int $limit How many to show; 0 for all.
 */
function bb_faq( $limit = 0 ) {
	$items = bbc_list( 'faq' );
	if ( $limit ) {
		$items = array_slice( $items, 0, $limit );
	}
	echo '<div class="fq fq-faq">';
	foreach ( $items as $item ) {
		echo '<details><summary><span>' . esc_html( $item['q'] ) . '</span>' . bb_icon( 'plus', 20, 'icon' ) . '</summary><p>' . esc_html( $item['a'] ) . '</p></details>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</div>';
}

/**
 * Mechanical counter.
 *
 * @param string $value Number.
 * @param string $unit  Unit.
 * @param string $label Caption.
 */
function bb_odometer( $value, $unit = '', $label = '' ) {
	$digits = '';
	for ( $d = 0; $d < 10; $d++ ) {
		$digits .= '<span>' . $d . '</span>';
	}
	echo '<div class="od od-odometer"><span class="od-value" aria-label="' . esc_attr( trim( $value . ' ' . $unit ) ) . '">';
	foreach ( preg_split( '//u', $value, -1, PREG_SPLIT_NO_EMPTY ) as $i => $char ) {
		if ( ctype_digit( $char ) ) {
			echo '<span class="od-drum" aria-hidden="true"><span class="od-strip" data-to="' . (int) $char . '" style="--to:0;--delay:' . (int) ( $i * 90 ) . 'ms">' . $digits . '</span></span>'; // phpcs:ignore WordPress.Security.EscapeOutput
		} else {
			echo '<span class="od-sep" aria-hidden="true">' . esc_html( $char ) . '</span>';
		}
	}
	if ( $unit ) {
		echo '<span class="od-unit" aria-hidden="true">' . esc_html( $unit ) . '</span>';
	}
	echo '</span>';
	if ( $label ) {
		echo '<span class="od-label">' . esc_html( $label ) . '</span>';
	}
	echo '</div>';
}

/**
 * Opening of an inner page.
 *
 * @param array $args title, lead, photo, alt, crumbs [[url, label]], actions (HTML).
 */
function bb_page_hero( $args ) {
	$photo  = (int) ( $args['photo'] ?? 0 );
	$crumbs = $args['crumbs'] ?? array( array( home_url( '/' ), 'Главная' ) );
	?>
	<section class="ph ph-page-hero">
		<div class="wrap ph-grid<?php echo $photo ? '' : ' ph-no-photo'; ?>">
			<div class="ph-copy">
				<nav class="ph-crumbs" aria-label="Вы здесь">
					<?php foreach ( $crumbs as $crumb ) : ?>
						<a href="<?php echo esc_url( $crumb[0] ); ?>"><?php echo esc_html( $crumb[1] ); ?></a><span aria-hidden="true">/</span>
					<?php endforeach; ?>
				</nav>
				<h1 class="h1"><?php echo esc_html( $args['title'] ); ?></h1>
				<?php if ( ! empty( $args['lead'] ) ) : ?><p class="lead"><?php echo esc_html( $args['lead'] ); ?></p><?php endif; ?>
				<?php echo $args['actions'] ?? ''; // phpcs:ignore WordPress.Security.EscapeOutput -- built by the templates from escaped parts. ?>
			</div>
			<?php if ( $photo ) : ?>
				<div class="ph-picture" style="--a:<?php echo esc_attr( bbc_aspect( $photo ) ); ?>"><?php echo bb_photo( $photo, $args['alt'] ?? null, true ); // phpcs:ignore WordPress.Security.EscapeOutput ?></div>
			<?php endif; ?>
		</div>
	</section>
	<?php
}

/**
 * Justified wall of photos.
 *
 * @param int[]  $ids Attachments.
 * @param string $alt Alternative text.
 */
function bb_photo_wall( $ids, $alt = '' ) {
	echo '<ul class="pw pw-wall">';
	foreach ( $ids as $id ) {
		echo '<li style="--a:' . esc_attr( bbc_aspect( $id ) ) . '">' . bb_photo( $id, $alt ) . '</li>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</ul>';
}

/** Slides with whole motorcycles on the home page. */
function bb_photo_slides() {
	$slides = array();
	foreach ( (array) bbc_image( 'showcase' ) as $slide ) {
		if ( ! empty( $slide['photo'] ) && ! empty( $slide['project'] ) && 'publish' === get_post_status( $slide['project'] ) ) {
			$slides[] = $slide;
		}
	}
	if ( ! $slides ) {
		return;
	}
	echo '<div class="ps ps-slides">';
	foreach ( $slides as $i => $slide ) {
		$name = get_the_title( $slide['project'] );
		echo '<a class="ps-slide" href="' . esc_url( get_permalink( $slide['project'] ) ) . '" aria-label="' . esc_attr( 'Проект: ' . $name ) . '"' . ( $i ? ' hidden' : '' ) . '>' . bb_photo( (int) $slide['photo'], $name, false, true ) . '<span class="ps-name">' . esc_html( $name ) . '</span></a>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</div>';
}

/** Tiles of chosen projects. */
function bb_project_tiles() {
	echo '<ul class="pt pt-tiles">';
	foreach ( (array) bbc_image( 'tiles' ) as $id ) {
		if ( 'publish' !== get_post_status( $id ) ) {
			continue;
		}
		$p = bbc_project( $id );
		echo '<li style="--a:' . esc_attr( $p['aspect'] ) . '"><a href="' . esc_url( $p['url'] ) . '">' . bb_photo( $p['cover'], $p['name'] ) . '<span>' . esc_html( $p['name'] ) . '</span></a></li>'; // phpcs:ignore WordPress.Security.EscapeOutput
	}
	echo '</ul>';
}

/**
 * Author and licence of an open-licence photo.
 *
 * @param array $credit Credit data.
 */
function bb_photo_credit( $credit ) {
	return '<p class="cr cr-credit">Пример стиля. Фото: <a href="' . esc_url( $credit['page'] ) . '" target="_blank" rel="noopener">' . esc_html( $credit['author'] ) . '</a>, <a href="' . esc_url( $credit['license_url'] ) . '" target="_blank" rel="noopener">' . esc_html( $credit['license'] ) . '</a></p>';
}

/** Address and route; the map loads only when asked for. */
function bb_map_block() {
	$c = bbc_contacts();
	?>
	<section class="mp mp-map" aria-labelledby="map-title">
		<div class="wrap mp-grid">
			<div class="mp-info">
				<h2 class="h3" id="map-title">Как доехать</h2>
				<p class="mp-address"><?php echo bb_icon( 'map-pin', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $c['address'] ); ?></p>
				<p class="mp-address mp-hours"><?php echo bb_icon( 'clock', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $c['hours'] ); ?></p>
				<p class="muted"><?php echo esc_html( bbc_text( 'map.note' ) ); ?></p>
				<div class="mp-links">
					<a class="btn btn-line" href="<?php echo esc_url( $c['maps']['yandex'] ); ?>" target="_blank" rel="noopener"><?php echo bb_icon( 'navigation', 17 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>Яндекс Карты</a>
					<a class="btn btn-line" href="<?php echo esc_url( $c['maps']['google'] ); ?>" target="_blank" rel="noopener">Google Maps</a>
				</div>
				<p class="mp-channel">Новые проекты и мотоциклы в наличии — в <a class="link-brass" href="<?php echo esc_url( $c['channel_url'] ); ?>" target="_blank" rel="noopener">Telegram-канале <?php echo esc_html( $c['channel_handle'] ); ?></a></p>
			</div>
			<div class="mp-frame" data-map="<?php echo esc_url( $c['maps']['widget'] ); ?>">
				<button type="button" class="mp-placeholder">
					<span class="mp-pin"><?php echo bb_icon( 'map-pin', 22 ); // phpcs:ignore WordPress.Security.EscapeOutput ?></span>
					<span>Показать карту</span>
					<small>Загрузится карта Яндекса</small>
				</button>
			</div>
		</div>
	</section>
	<?php
}

/** Title and preselected service of the request form on the current page. */
function bb_form_context() {
	$title = bbc_text( 'form.title' );
	$topic = '';
	if ( is_singular( 'bb_service' ) ) {
		$topic = get_the_title( get_queried_object_id() );
		$title = 'Обсудим: ' . mb_strtolower( $topic );
	} elseif ( is_singular( 'bb_project' ) ) {
		$topic = 'Кастомизация';
		$title = 'Хотите похожий проект?';
	} elseif ( is_singular( 'bb_style' ) ) {
		$topic = 'Кастомизация';
		$title = 'Хотите ' . mb_strtolower( get_the_title( get_queried_object_id() ) ) . '? Обсудим';
	}
	return array( $title, $topic );
}

/** Request form: saved in the admin and sent to the workshop by e-mail. */
function bb_request_form() {
	$c = bbc_contacts();
	list( $title, $topic ) = bb_form_context();
	$state = isset( $_GET['request'] ) ? sanitize_key( $_GET['request'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification
	$first = $c['phones'][0] ?? null;
	?>
	<section class="rq rq-request" id="zayavka" aria-labelledby="request-title">
		<div class="wrap rq-grid">
			<div class="rq-intro">
				<h2 class="h2" id="request-title"><?php echo esc_html( $title ); ?></h2>
				<p class="muted"><?php echo esc_html( bbc_text( 'form.lead' ) ); ?></p>
				<ul class="rq-people">
					<?php foreach ( $c['phones'] as $person ) : ?>
						<li><a href="<?php echo esc_attr( $person['href'] ); ?>"><?php echo esc_html( $person['phone'] ); ?></a><span><?php echo esc_html( $person['name'] ); ?><?php if ( $person['telegram'] ) : ?>, <a class="link-brass" href="<?php echo esc_url( 'https://t.me/' . $person['telegram'] ); ?>" target="_blank" rel="noopener">Telegram</a><?php endif; ?></span></li>
					<?php endforeach; ?>
				</ul>
			</div>
			<form class="rq-form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"<?php echo 'sent' === $state ? ' hidden' : ''; ?> novalidate>
				<input type="hidden" name="action" value="bbc_request">
				<input type="hidden" name="started" value="">
				<input type="hidden" name="page" value="<?php echo esc_url( get_permalink() ? get_permalink() : home_url( '/' ) ); ?>">
				<div class="bb-trap" aria-hidden="true"><label>Сайт <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
				<label><span>Имя</span><input name="name" autocomplete="name" maxlength="120"></label>
				<label><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40"></label>
				<label><span>Мотоцикл</span><input name="bike" placeholder="Марка, модель, год" maxlength="160"></label>
				<label><span>Услуга</span>
					<select name="service">
						<option value="">Пока не знаю</option>
						<?php foreach ( bbc_services() as $s ) : ?>
							<option value="<?php echo esc_attr( $s['name'] ); ?>"<?php selected( $topic, $s['name'] ); ?>><?php echo esc_html( $s['name'] ); ?></option>
						<?php endforeach; ?>
					</select>
				</label>
				<label class="rq-full"><span>Что хотите сделать</span><textarea name="message" rows="3" maxlength="3000"></textarea></label>
				<label class="rq-consent rq-full"><input type="checkbox" name="consent" value="1" required><span>Согласен на обработку персональных данных по <a class="link-brass" href="<?php echo esc_url( get_privacy_policy_url() ? get_privacy_policy_url() : home_url( '/politika/' ) ); ?>">политике конфиденциальности</a></span></label>
				<p class="rq-error rq-full" role="alert"<?php echo 'error' === $state ? '' : ' hidden'; ?>><?php echo 'error' === $state ? 'Заявка не отправлена: проверьте телефон и согласие.' : ''; ?></p>
				<button class="btn btn-signal rq-full" type="submit">Отправить заявку</button>
			</form>
			<div class="rq-form rq-done" role="status"<?php echo 'sent' === $state ? '' : ' hidden'; ?>>
				<p class="h3"><?php echo esc_html( bbc_text( 'form.done' ) ); ?></p>
				<div class="rq-send">
					<?php if ( $first ) : ?><a class="btn btn-signal" href="<?php echo esc_attr( $first['href'] ); ?>"><?php echo bb_icon( 'phone', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?><?php echo esc_html( $first['phone'] ); ?></a><?php endif; ?>
					<?php if ( $first && $first['telegram'] ) : ?><a class="btn btn-line" href="<?php echo esc_url( 'https://t.me/' . $first['telegram'] ); ?>" target="_blank" rel="noopener"><?php echo bb_icon( 'send', 18 ); // phpcs:ignore WordPress.Security.EscapeOutput ?>Написать в Telegram</a><?php endif; ?>
				</div>
			</div>
		</div>
	</section>
	<?php
}

/**
 * Address of the page that uses a template.
 *
 * @param string $template Template file.
 */
function bb_template_url( $template ) {
	$pages = get_posts( array( 'post_type' => 'page', 'post_status' => 'publish', 'numberposts' => 1, 'fields' => 'ids', 'meta_key' => '_wp_page_template', 'meta_value' => $template ) ); // phpcs:ignore WordPress.DB.SlowDBQuery
	return $pages ? get_permalink( $pages[0] ) : home_url( '/' );
}

/** Navigation of the header: from the "Главное меню" location, or the site structure. */
function bb_nav_items() {
	$locations = get_nav_menu_locations();
	$items     = array();
	if ( ! empty( $locations['primary'] ) ) {
		foreach ( (array) wp_get_nav_menu_items( $locations['primary'] ) as $item ) {
			if ( ! $item->menu_item_parent ) {
				$items[] = array(
					'label' => $item->title,
					'url'   => $item->url,
					'menu'  => 'post_type_archive' === $item->type && 'bb_service' === $item->object ? 'bb_service' : ( 'post_type_archive' === $item->type && 'bb_style' === $item->object ? 'bb_style' : '' ),
				);
			}
		}
	}
	if ( ! $items ) {
		foreach ( array( array( 'bb_service', 'Услуги' ), array( 'bb_style', 'Мотоциклы' ), array( 'bb_project', 'Наши проекты' ) ) as $a ) {
			$items[] = array( 'label' => $a[1], 'url' => (string) get_post_type_archive_link( $a[0] ), 'menu' => 'bb_project' === $a[0] ? '' : $a[0] );
		}
	}
	$current = untrailingslashit( (string) wp_parse_url( home_url( add_query_arg( array() ) ), PHP_URL_PATH ) );
	foreach ( $items as &$entry ) {
		$path            = untrailingslashit( (string) wp_parse_url( $entry['url'], PHP_URL_PATH ) );
		$entry['active'] = '' !== $path && ( $current === $path || 0 === strpos( $current . '/', $path . '/' ) );
	}
	unset( $entry );
	return $items;
}
