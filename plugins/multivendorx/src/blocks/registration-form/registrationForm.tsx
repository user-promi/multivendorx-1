/* global registrationForm, */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FormViewer, getApiLink, ChoiceToggle } from 'zyra';
import axios from 'axios';
import { __ } from '@wordpress/i18n';
type StoreOption = {
	label: string;
	value: string | number;
};

type RegistrationResponse = {
	id: string | number;
	name?: string;
	description?: string;
	slug?: string;
	[key: string]: string | number | boolean | null | undefined;
};

type StoreNote = {
	note: string;
};

type StoreData = {
	id: string | number;
	note?: StoreNote[];
};

const RegistrationForm = () => {
	const [responseMessage, setResponseMessage] = useState<{
		type: 'success' | 'error';
		message: string;
	} | null>(null);
	const [responseData, setResponseData] = useState<RegistrationResponse[]>(
		[]
	);
	const [stores, setStores] = useState<StoreOption[]>([]);
	const [selectedStore, setSelectedStore] = useState<StoreOption | null>(
		null
	);
	const [inputs, setInputs] = useState<
		RegistrationResponse | Record<string, string | number | boolean>
	>({});
	const [allStoreData, setAllStoreData] = useState<StoreData[]>([]);
	const [storeData, setStoreData] = useState<StoreData | null>(null);
	const formData = registrationForm;

	useEffect(() => {
		axios({
			method: 'GET',
			url: getApiLink(registrationForm, `store`),
			headers: { 'X-WP-Nonce': registrationForm.nonce },
			params: { store_registration: true },
		}).then((res) => {
			const data = res.data || {};
			const storeList = data.all_stores || [];
			const regData = data.response || [];
			const returnedStoreData = data.store_data || [];

			setAllStoreData(returnedStoreData);
			//Prevent unnecessary re-renders
			setStores((prev) => {
				if (JSON.stringify(prev) !== JSON.stringify(storeList)) {
					return storeList;
				}
				return prev;
			});

			setResponseData((prev) => {
				if (JSON.stringify(prev) !== JSON.stringify(regData)) {
					return regData;
				}
				return prev;
			});

			if (storeList.length > 0 && regData.length > 0) {
				const match = storeList.find((store) =>
					regData.some(
						(item) => String(item.id) === String(store.value)
					)
				);

				if (match) {
					setSelectedStore(match);

					const matchData = regData.find(
						(item) => String(item.id) === String(match.value)
					);

					if (matchData) {
						setInputs(matchData);
					}

					const dataMatch = returnedStoreData.find(
						(item) => String(item.id) === String(match.value)
					);
					if (dataMatch) {
						setStoreData(dataMatch);
					}
				}
			}
		});
	}, []);

	const handleStoreChange = (val: string) => {
		const store = stores.find((s) => s.value === val);
		setSelectedStore(store);

		const match = responseData.find(
			(item) => String(item.id) === String(val)
		);
		setInputs(match || {});

		const dataMatch = allStoreData.find(
			(item) => String(item.id) === String(val)
		);
		setStoreData(dataMatch || {});
	};

	useEffect(() => {
		const backup = sessionStorage.getItem('multivendorxRegistrationForm');

		if (backup) {
			try {
				const parsed = JSON.parse(backup);
				setInputs(parsed); // restore into FormViewer
			} catch (e) {
				console.error('Invalid backup data');
			}
		}
	}, []);

	const onSubmit = useCallback(
		(submittedFormData: Record<string, string | number | boolean>) => {
			sessionStorage.setItem(
				'multivendorxRegistrationForm',
				JSON.stringify(submittedFormData)
			);
			setInputs(submittedFormData);

			const mappedData: Record<string, string | number | boolean> = {};

			if (submittedFormData['name']) {
				mappedData['name'] = submittedFormData['name'];
			}
			if (submittedFormData['description']) {
				mappedData['description'] = submittedFormData['description'];
			}
			if (submittedFormData['slug']) {
				mappedData['slug'] = submittedFormData['slug'];
			}

			Object.keys(submittedFormData).forEach((key) => {
				if (!['name', 'description', 'slug'].includes(key)) {
					mappedData[key] = submittedFormData[key];
				}
			});

			axios({
				method: 'POST',
				url: getApiLink(registrationForm, 'store'),
				headers: {
					'Content-Type': 'multipart/form-data',
					'X-WP-Nonce': registrationForm.nonce,
					registrations: 'registrations',
				},
				data: { formData: mappedData },
			})
				.then((response) => {
					setResponseMessage({
						type: 'success',
						message: __(
							'Store created successfully',
							'multivendorx'
						),
					});

					sessionStorage.removeItem('multivendorxRegistrationForm');
					if (response.data.redirect !== '') {
						window.open(response.data.redirect, '_self');
					}
				})
				.catch(() => {
					setResponseMessage({
						type: 'error',
						message: __('Error creating store', 'multivendorx'),
					});
				});
		},
		[]
	);

	const memoizedCountryList = useMemo(
		() => registrationForm.country_list,
		[]
	);
	const memoizedStateList = useMemo(() => registrationForm.state_list, []);

	return (
		<div className="woocommerce">
			{stores.length > 0 && (
				<>
					<div className="store-selector">
						<ChoiceToggle
							options={stores}
							value={selectedStore?.value || ''}
							onChange={(val) => handleStoreChange(val)}
						/>
					</div>

					{storeData?.note?.[0]?.note && (
						<div>
							<h4>{__('Store Note', 'multivendorx')}</h4>

							<div className="store-note">
								<strong>{__('Note', 'multivendorx')}:</strong>{' '}
								{storeData.note[0].note}
							</div>
						</div>
					)}
				</>
			)}

			<div
				dangerouslySetInnerHTML={{
					__html: registrationForm.content_before_form,
				}}
			/>
			<FormViewer
				formFields={formData.settings}
				response={inputs}
				onSubmit={onSubmit}
				countryList={memoizedCountryList}
				stateList={memoizedStateList}
			/>
			<div
				dangerouslySetInnerHTML={{
					__html: registrationForm.content_after_form,
				}}
			/>
			{responseMessage && (
				<div className="woocommerce-notices-wrapper">
					<ul
						className={
							responseMessage.type === 'success'
								? 'woocommerce-message'
								: 'woocommerce-error'
						}
						role="alert"
					>
						<li>{responseMessage.message}</li>
					</ul>
				</div>
			)}
		</div>
	);
};

export default RegistrationForm;
