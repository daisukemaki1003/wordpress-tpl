<?php

function mytheme_enqueue_assets(): void {
    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();
    $assets    = '/assets';

    $css_file = $theme_dir . $assets . '/style.css';
    if (file_exists($css_file)) {
        wp_enqueue_style(
            'mytheme-style',
            $theme_uri . $assets . '/style.css',
            [],
            filemtime($css_file)
        );
    }

    $js_file = $theme_dir . $assets . '/main.js';
    if (file_exists($js_file)) {
        wp_enqueue_script(
            'mytheme-main',
            $theme_uri . $assets . '/main.js',
            [],
            filemtime($js_file),
            true
        );
    }
}
add_action('wp_enqueue_scripts', 'mytheme_enqueue_assets');
