/**
 * WordPress dependencies
 */
import { SelectControl, Spinner } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

function Selector( { label, value, onChange } ) {
	const [ productAttributes, setProductAttributes ] = useState( [] );
	const [ isResolving, setIsResolving ] = useState( false );

	useEffect( () => {
		const controller =
			typeof window.AbortController === 'undefined'
				? undefined
				: new window.AbortController();

		setIsResolving( true );
		apiFetch( {
			path: 'wc/v3/products/attributes',
			signal: controller?.signal,
		} ).then( ( res ) => {
			setProductAttributes( res );
			setIsResolving( false );
		} );

		return () => controller?.abort();
	}, [] );

	if ( undefined === productAttributes || isResolving ) {
		return <Spinner />;
	}

	const selectOptions = [
		{
			label: __(
				'Select an attribute',
				'woocommerce-product-attributes'
			),
			value: 0,
		},
		...productAttributes.map( ( item ) => {
			return { label: item.name, value: item.id };
		} ),
	];

	return (
		<SelectControl
			label={
				undefined !== label
					? label
					: __( 'Attributes', 'woocommerce-product-attributes' )
			}
			value={ value }
			options={ selectOptions }
			onChange={ ( newValue ) => onChange( Number( newValue ) ) }
		/>
	);
}

export default Selector;
