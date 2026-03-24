/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	useModules,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup,
	Card,
	SelectInputUI,
	NoticeManager,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

// Define proper interfaces
interface StoreOwner {
	label: string;
	value: string;
	[key: string]: unknown;
}

interface StoreSquadFormData {
	store_owners?: string[];
	primary_owner?: string;
	state?: string;
	[key: string]: string | string[] | undefined;
}

interface StoreSquadProps {
	id: string | null;
}

// Type for the filter callback
type FilterCallback = (
	content: null,
	formData: StoreSquadFormData,
	setFormData: React.Dispatch<React.SetStateAction<StoreSquadFormData>>,
	autoSave: (data: StoreSquadFormData) => void
) => React.ReactElement | null;

const StoreSquad: React.FC<StoreSquadProps> = ({ id }) => {
	const { modules } = useModules();
	const [formData, setFormData] = useState<StoreSquadFormData>({});

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			params: { fetch_user: true },
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

	const autoSave = (updatedData: StoreSquadFormData) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				...updatedData,
				user: 'true',
			},
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Great!', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};
	console.log()
	return (
		<>
			<Container>
				<Column grid={8}>
					<Card title={__('Store owners', 'multivendorx')}>
						<FormGroupWrapper>
							<SelectInputUI
								name="store_owners"
								options={appLocalizer.store_owners || []}
								type="multi-select"
								value={formData.store_owners || []}
								size="20rem"
								onChange={(store_owners: string | string[]) => {
									const ownersArray = Array.isArray(store_owners)
										? store_owners
										: store_owners
											? [store_owners]
											: [];

									const updated = {
										...formData,
										store_owners: ownersArray,
										state: '',
									};

									setFormData(updated);
									autoSave(updated);
								}}
							/>
						</FormGroupWrapper>

						{modules.includes('staff-manager') &&
							(applyFilters(
								'additional_staff_manager_fields',
								null,
								formData,
								setFormData,
								autoSave
							) as ReturnType<FilterCallback>)}

						{modules.includes('facilitator') &&
							(applyFilters(
								'additional_facilitator_fields',
								null,
								formData,
								setFormData,
								autoSave
							) as ReturnType<FilterCallback>)}
					</Card>
				</Column>

				<Column grid={4}>
					<Card
						id="primary-owner"
						title={__('Primary owner', 'multivendorx')}
					>
						<FormGroupWrapper>
							<FormGroup
								label={__(
									'Select primary owner',
									'multivendorx'
								)}
							>
								<SelectInputUI
									name="primary_owner"
									options={appLocalizer?.store_owners || []}
									value={formData.primary_owner}
									onChange={(primary_owner: string | string[]) => {
										if (Array.isArray(primary_owner)) return;

										const updated = {
											...formData,
											primary_owner: primary_owner || '',
										};

										setFormData(updated);
										autoSave(updated);
									}}
								/>
							</FormGroup>
						</FormGroupWrapper>
					</Card>
				</Column>
			</Container>
		</>
	);
};

export default StoreSquad;
