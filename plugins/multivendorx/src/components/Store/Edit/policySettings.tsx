/* global appLocalizer */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, SuccessNotice, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';

const PolicySettings = ( { id, data }: { id: string | null; data: any } ) => {
	const [ formData, setFormData ] = useState< { [ key: string ]: string } >(
		{}
	);
	const [ successMsg, setSuccessMsg ] = useState< string | null >( null );

	useEffect( () => {
		if ( ! id ) return;
		if ( data ) {
			setFormData( data );
		}
	}, [ id ] );

	useEffect( () => {
		if ( successMsg ) {
			const timer = setTimeout( () => setSuccessMsg( null ), 3000 );
			return () => clearTimeout( timer );
		}
	}, [ successMsg ] );

	const handleChange = (
		e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement >
	) => {
		const { name, value } = e?.target;

		setFormData( ( prev ) => {
			const updated = {
				...( prev || {} ),
				[ name ]: value ?? '',
			};
			autoSave( updated );
			return updated;
		} );
	};

	const autoSave = ( updatedData: { [ key: string ]: string } ) => {
		axios( {
			method: 'PUT',
			url: getApiLink( appLocalizer, `store/${ id }` ),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		} ).then( ( res ) => {
			if ( res.data.success ) {
				setSuccessMsg(
					__( 'Store saved successfully!', 'multivendorx' )
				);
			}
		} );
	};

	return (
		<>
			<SuccessNotice message={ successMsg } />

			<div className="container-wrapper">
				<div className="card-wrapper w-65">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __( 'Shipping policy', 'multivendorx' ) }
								</div>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<TextArea
										name="shipping_policy"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
										value={ formData.shipping_policy }
										onChange={ handleChange }
										usePlainText={ false }
										tinymceApiKey={
											appLocalizer
												.settings_databases_value[
												'marketplace'
											][ 'tinymce_api_section' ] ?? ''
										}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __( 'Refund policy', 'multivendorx' ) }
								</div>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<TextArea
										name="refund_policy"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
										value={ formData.refund_policy }
										onChange={ handleChange }
										usePlainText={ false }
										tinymceApiKey={
											appLocalizer
												.settings_databases_value[
												'marketplace'
											][ 'tinymce_api_section' ] ?? ''
										}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __(
										'Cancellation / Return / Exchange policy',
										'multivendorx'
									) }
								</div>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<TextArea
										name="exchange_policy"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
										value={ formData.exchange_policy }
										onChange={ handleChange }
										usePlainText={ false }
										tinymceApiKey={
											appLocalizer
												.settings_databases_value[
												'marketplace'
											][ 'tinymce_api_section' ] ?? ''
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default PolicySettings;
