<?php
/**
 * Vite asset loading — dev/prod auto-detection
 *
 * dev:  dist/hot が存在 → Vite dev server から HMR 付きで読み込み
 * prod: dist/hot が不在 → dist/ のビルド済みアセットを読み込み
 */

function mytheme_vite_enqueue(): void {
	$hot_file = get_theme_file_path( 'dist/hot' );

	if ( file_exists( $hot_file ) ) {
		mytheme_vite_enqueue_dev( trim( file_get_contents( $hot_file ) ) );
	} else {
		mytheme_vite_enqueue_prod();
	}
}
add_action( 'wp_enqueue_scripts', 'mytheme_vite_enqueue' );

/**
 * Dev mode: Vite dev server からアセットを読み込む
 */
function mytheme_vite_enqueue_dev( string $dev_server_url ): void {
	wp_enqueue_script( 'vite-client', $dev_server_url . '/@vite/client', array(), null, false );
	wp_enqueue_script( 'mytheme-style-dev', $dev_server_url . '/src/scss/style.scss', array(), null, false );
	wp_enqueue_script( 'mytheme-main', $dev_server_url . '/src/ts/main.ts', array(), null, true );

	add_filter( 'script_loader_tag', 'mytheme_vite_module_attr', 10, 2 );
}

/**
 * Prod mode: dist/ のビルド済みアセットを読み込む
 */
function mytheme_vite_enqueue_prod(): void {
	$dist_css = get_theme_file_path( 'dist/style.css' );
	$dist_js  = get_theme_file_path( 'dist/main.js' );

	if ( file_exists( $dist_css ) ) {
		wp_enqueue_style(
			'mytheme-style',
			get_theme_file_uri( 'dist/style.css' ),
			array(),
			filemtime( $dist_css )
		);
	}

	if ( file_exists( $dist_js ) ) {
		wp_enqueue_script(
			'mytheme-main',
			get_theme_file_uri( 'dist/main.js' ),
			array(),
			filemtime( $dist_js ),
			true
		);
		add_filter( 'script_loader_tag', 'mytheme_vite_module_attr', 10, 2 );
	}
}

/**
 * script タグに type="module" を付与する
 */
function mytheme_vite_module_attr( string $tag, string $handle ): string {
	$module_handles = array( 'vite-client', 'mytheme-style-dev', 'mytheme-main' );

	if ( in_array( $handle, $module_handles, true ) ) {
		$tag = str_replace( ' src=', ' type="module" src=', $tag );
	}

	return $tag;
}
