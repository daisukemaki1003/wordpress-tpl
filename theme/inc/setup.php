<?php
/**
 * Theme setup — テーマサポート機能の有効化
 */

function mytheme_theme_setup(): void {
	add_theme_support( 'post-thumbnails' );
}
add_action( 'after_setup_theme', 'mytheme_theme_setup' );
