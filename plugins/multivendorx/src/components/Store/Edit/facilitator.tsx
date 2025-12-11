import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';
import { __ } from '@wordpress/i18n';

const Facilitator = ( { id, data }: { id: string | null; data: any } ) => {
	const [ formData, setFormData ] = useState< { [ key: string ]: any } >(
		{}
	);
	const [ successMsg, setSuccessMsg ] = useState< string | null >( null );

	useEffect( () => {
		if ( ! id ) return;
		if ( data ) {
			setFormData( data );
		}
	}, [ id ] );

	const handleChange = (
		e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement >
	) => {
		const { name, value } = e.target;
		setFormData( ( prev ) => {
			const updated = {
				...( prev || {} ),
				[ name ]: value ?? '',
			};
			autoSave( updated );
			return updated;
		} );
	};

	const autoSave = ( updatedData: { [ key: string ]: any } ) => {
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
						<div className="form-group-wrapper">
							<div className="form-group">
								<label>
									{ __( 'Facilitator', 'multivendorx' ) }
								</label>
								<SelectInput
									name="facilitator"
									options={
										appLocalizer?.facilitators_list || []
									}
									value={ formData.facilitator }
									type="single-select"
									onChange={ ( newValue: any ) => {
										if (
											! newValue ||
											Array.isArray( newValue )
										)
											return;

										const updated = {
											...formData,
											facilitator: newValue.value,
										};
										setFormData( updated );
										autoSave( updated );
									} }
								/>
							</div>
						</div>
					</div>
				</div>

				<div className="card-wrapper w-35">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{ __(
										'Facilitator payout share',
										'multivendorx'
									) }
								</div>
							</div>
						</div>
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">
									{ __( 'Fixed', 'multivendorx' ) }
								</label>
								<BasicInput
									preInsideText={ '$' }
									postText={ '+' }
									name="facilitator_fixed"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={ formData.facilitator_fixed }
									onChange={ handleChange }
								/>
							</div>

							<div className="form-group">
								<label htmlFor="product-name">
									{ __( 'Percentage', 'multivendorx' ) }
								</label>
								<BasicInput
									postInsideText={ '%' }
									name="facilitator_percentage"
									wrapperClass="setting-form-input"
									descClass="settings-metabox-description"
									value={ formData.facilitator_percentage }
									onChange={ handleChange }
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Facilitator;
