<?php
/**
 * Plugin Name:       Associated Links
 * Description:       Add associated links to your posts and pages.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Carl Ansell
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       associated-links
 *
 */

function register_associated_links_plugin()
{
    wp_register_script(
        'associated-links-js',
        plugin_dir_url(__FILE__) . '/build/index.js',
        array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n', 'wp-api-fetch'),
        1.0
    );

    wp_enqueue_style(
        'associated-links-css-editor',
        plugin_dir_url(__FILE__) . '/build/main.css',
        array('wp-edit-blocks'),
        1.0
    );

    wp_enqueue_style(
        'associated-links-css',
        plugin_dir_url(__FILE__) . '/build/style-main.css',
        array(),
        1.0
    );

    register_block_type('carlansell94/associated-links', array(
        'editor_script' => 'associated-links-js',
        'editor_style'  => 'associated-links-css-editor',
        'style' => 'associated-links-css',
        'render_callback' => 'render_associated_links_block'
    ));
}

add_action('init', 'register_associated_links_plugin');

function get_link_sources()
{
    $sources = file_get_contents(plugin_dir_path(__FILE__) . 'build/sources.json');

    if (!$sources) return;

    return json_decode($sources, true);
}

function render_associated_links_block($attributes)
{
    global $post;
    $urls = get_post_meta($post->ID, '_post_associated_links', true);

    if (!is_array($urls)) return;
    
    $selectedLinkId = isset($attributes['selectedLinkId']) ? $attributes['selectedLinkId'] : 0;
    $selectedLink = array_search($selectedLinkId, array_column($urls, 'id'));

    if ($selectedLink === false) return; 

    $sources = get_link_sources();
    $title = isset($attributes['title']) ? $attributes['title'] : '';
    $description = isset($attributes['description']) ? $attributes['description'] : '';
    $link = $urls[$selectedLink];

    if ($link['type'] === 'internal') {
        $icon = esc_url(wp_get_attachment_image_src(get_theme_mod('custom_logo'), 'full')[0]);
    } else {
        $icon = $sources[$link['type']]['icon'] ?? 'default.svg';
        $icon = plugin_dir_url(__FILE__) . 'build/assets/' . $icon;
    }

    $output = '
        <a href="' . $link['url'] . '" target="__blank">
        <div class="associated-link ' . $link['type'] . '">
            <img src="' .  $icon . '" />
            <div>
                <h4>' . $title . '</h4>
                <p>' . $description . '</p>
            </div>
            <div class="associated-link-arrow">&#x25BA;</div>
        </div>
        </a>';

    return $output;
}

/* Admin meta box */
function associated_links_meta_box()
{
    add_meta_box(
        'associated_links_meta_box',
        'Associated Content',
        'render_associated_links_meta_box',
        ['post', 'page'],
        'side',
        'default'
    );
}

function render_associated_links_meta_box($post)
{
    $sources = get_link_sources();

    $urls = get_post_meta($post->ID, '_post_associated_links', true);
    $urls = !empty($urls) ? json_encode($urls) : '[]'; ?>

    <div id="associated-links-meta-box">
        <p>Add links to associated content, to be displayed as part of the post meta.</p>
        <select id="url-type">
            <option value="internal" data-name="<?= get_bloginfo( 'name' ) ?>"><?= get_bloginfo( 'name' ) ?></option>
            <?php foreach ($sources as $source => $value) : ?>
                <option value="<?= $source ?>" data-name="<?= $value['name'] ?>"><?= $value['name'] ?></option>
            <?php endforeach; ?>
        </select>
        <div>
        	<input type="text" id="associated-url-new" name="associated_url" placeholder="Enter URL" />
        	<button type="button" id="associated-url-add">Add</button>
        </div>
        <ul id="associated-links-list"></ul>
    </div>
    <input type="hidden" id="post-associated-links" name="post_associated_links" value="<?= esc_js($urls) ?>" />
    <?php
}

add_action('add_meta_boxes', 'associated_links_meta_box');

function enqueue_associated_links_meta_box_script($hook)
{
    wp_enqueue_script(
        'associated-links-meta-box-script',
        plugin_dir_url(__FILE__) . 'build/editor.js',
        array(),
        '1.0',
        true
    );
}

add_action('enqueue_block_editor_assets', 'enqueue_associated_links_meta_box_script');

function save_associated_links($post_id)
{
    if (!isset($_POST['post_associated_links'])) return;

    $post_associated_links = json_decode(stripslashes($_POST['post_associated_links']), true);
    update_post_meta($post_id, '_post_associated_links', $post_associated_links);
}

add_action('save_post', 'save_associated_links');
