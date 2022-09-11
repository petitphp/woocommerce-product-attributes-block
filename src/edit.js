import { isEmpty } from 'lodash';

import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

import Selector from './Selector';
import './editor.scss';

export default function Edit( {
	attributes: { productAttributeId, prefix, separator },
	context: { postId, postType: postTypeSlug },
	setAttributes,
} ) {
	const [ attribute, setAttribute ] = useState( {} );
	const [ isResolving, setIsResolving ] = useState( false );

	useEffect( () => {
		const controller =
			typeof window.AbortController === 'undefined'
				? undefined
				: new window.AbortController();

		setIsResolving( true );
		apiFetch( {
			path: `wc/v3/products/${ postId }`,
			signal: controller?.signal,
		} ).then( ( res ) => {
			let attribute = {};
			if ( res.attributes ) {
				attribute = res.attributes
					.filter(
						( attribute ) => attribute.id === productAttributeId
					)
					.at( 0 );
			}
			setIsResolving( false );
			setAttribute( attribute );
		} );

		return () => controller?.abort();
	}, [ productAttributeId ] );

	const getEditRender = () => {
		if ( 'product' !== postTypeSlug ) {
			return (
				<p>
					{ __(
						'This block is only usable when displaying products.',
						'woocommerce-product-attributes'
					) }
				</p>
			);
		}

		if ( productAttributeId < 1 ) {
			return (
				<p>
					{ __(
						'Please choose a product attribute to display.',
						'woocommerce-product-attributes'
					) }
				</p>
			);
		}

		if ( isResolving ) {
			return (
				<p>
					<Spinner />
				</p>
			);
		}

		if ( ! isEmpty( attribute ) ) {
			return <p>{ `${ prefix }${ attribute.options.join( separator ) }` }</p>;
		}
	};

	return (
		<>
			<InspectorControls>
				<PanelBody>
					<Selector
						label={ __(
							'Product attribute',
							'woocommerce-product-attributes'
						) }
						value={ productAttributeId }
						onChange={ ( newValue ) =>
							setAttributes( { productAttributeId: newValue } )
						}
					/>
					<TextControl
						label={ __(
							'Prefix',
							'woocommerce-product-attributes'
						) }
						value={ prefix }
						onChange={ ( newValue ) =>
							setAttributes( { prefix: newValue } )
						}
					/>
					<TextControl
						label={ __(
							'Separator',
							'woocommerce-product-attributes'
						) }
						value={ separator }
						onChange={ ( newValue ) =>
							setAttributes( { separator: newValue } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<div { ...useBlockProps() }>{ getEditRender() }</div>
		</>
	);
}
