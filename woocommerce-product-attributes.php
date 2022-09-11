<?php
/**
 * Plugin Name:       Woocommerce Product Attributes
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       woocommerce-product-attributes
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_woocommerce_product_attributes_block_init() {
	register_block_type(
		__DIR__ . '/build',
		[
			'render_callback' => 'create_block_woocommerce_product_attributes_render_callback',
		]
	);
}

add_action( 'init', 'create_block_woocommerce_product_attributes_block_init' );

function create_block_woocommerce_product_attributes_render_callback( array $attributes, string $content, \WP_Block $block ) {
	$product_attribute_id = (int) ( $attributes['productAttributeId'] ?? 0 );
	$prefix               = $attributes['prefix'] ?? '';
	$separator            = $attributes['separator'] ?? ', ';
	$post_id              = $block->context['postId'] ?? 0;
	$post_type            = $block->context['postType'] ?? 'post';

	if ( 'product' !== $post_type || $post_id < 1 || $product_attribute_id < 1 ) {
		return '';
	}

	$product = wc_get_product( $post_id );
	if ( ! is_a( $product, \WC_Product::class ) ) {
		return '';
	}

	$attributes = array_filter( $product->get_attributes(), 'wc_attributes_array_filter_visible' );
	$attributes = array_filter(
		$attributes,
		function ( \WC_Product_Attribute $attribute ) use ( $product_attribute_id ) {
			return $attribute->get_id() === $product_attribute_id;
		}
	);

	if ( empty( $attributes ) ) {
		return '';
	}

	/** @var \WC_Product_Attribute $attribute */
	$attribute = reset( $attributes );
	$values    = [];
	if ( $attribute->is_taxonomy() ) {
		$attribute_values = wc_get_product_terms( $product->get_id(), $attribute->get_name(), [ 'fields' => 'all' ] );
		foreach ( $attribute_values as $attribute_value ) {
			$values[] = $attribute_value->name;
		}
	} else {
		$values = $attribute->get_options();
	}

	return sprintf(
		'<div %s>%s%s</div>',
		get_block_wrapper_attributes(),
		esc_html( $prefix ),
		esc_html( implode( $separator, $values ) )
	);
}
