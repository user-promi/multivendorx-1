import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, getApiLink, SuccessNotice } from 'zyra';
import { Skeleton } from '@mui/material';

const StoreRegistration = ({ id }: { id: string | null }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	useEffect(() => {
		if (!id) return;

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce, "registrations": 'registrations' },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));
		});
	}, [id]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 3000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
	};

	const autoSave = (updatedData: { [key: string]: string }) => {
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg('Store saved successfully!');
			}
		});
	};

	const handleSubmit = (status: 'approve' | 'rejected') => {
		const updatedData = { ...formData, status };
		axios({
			method: 'PUT',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		}).then((res) => {
			if (res.data.success) {
				setSuccessMsg(
					status === 'approve'
						? 'Store approved successfully!'
						: 'Store rejected successfully!'
				);
				setFormData(updatedData); // update local state
			}
		});
	};
	return (
		<>
			<SuccessNotice message={successMsg} />

			<div className="container-wrapper">
				<div className="card-wrapper w-65">
					{(formData.core_data?.status == 'pending' || formData.core_data?.status == 'rejected') && (
						<>
							<div className="card-content">
								<div className="card-title">Store Details</div>

								{/* Core Data */}
								{formData.core_data &&
									Object.entries(formData.core_data).map(([label, value]) => (
										<div className="form-details" key={label}>
											<label className="label">{label} :</label>
											<div className="value">{value || "[Not Provided]"}</div>
										</div>
									))}

								{/* Registration Data */}
								{/* {formData.registration_data &&
									Object.entries(formData.registration_data).map(([label, value]) => (
										<div className="form-details" key={label}>
											<label className="label">{label} :</label>
											<div className="value">{value || "[Not Provided]"}</div>
										</div>
									))} */}
							</div>
						</>
					)}
					<div className="card-content">
						<div className="card-title">
							 {formData.core_data?.status === 'pending' || formData.core_data?.status === 'rejected' ? 'Registration Form Details' : 'Archive Data'}
						</div>

						{/* Core Data */}
						{/* {formData.core_data &&
							Object.entries(formData.core_data).map(([label, value]) => (
								<div className="form-details" key={label}>
									<label className="label">{label} :</label>
									<div className="value">{value || "[Not Provided]"}</div>
								</div>
							))} */}

						{/* Registration Data */}
						{formData.registration_data && Object.keys(formData.registration_data).length > 0 ? (
							Object.entries(formData.registration_data).map(([label, value]) => (
								<div className="form-details" key={label}>
									<label className="label">{label} :</label>
									<div className="value">{value || "[Not Provided]"}</div>
								</div>
							))
						) : (
							<div className="no-data">No registration data found</div>
						)}

					</div>
				</div>


				<div className="card-wrapper w-35">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									Submited by
								</div>
							</div>
							{/* <div className="right">
                                <i className="adminlib-external"
                                    onClick={() => { navigate(`?page=multivendorx#&tab=stores&edit/${id}/&subtab=staff`) }}
                                ></i>
                            </div> */}
						</div>

						<div className="store-owner-details owner">
							<div className="profile">
								<div className="avater">
									<span>JD</span>
								</div>
								<div className="details">
									<div className="name">
										{formData.primary_owner_info?.data?.display_name ?? <Skeleton variant="text" width={150} />}
									</div>
									{/* <div className="des">Owner</div> */}
								</div>
							</div>
							<ul className="contact-details">
								<li>
									<i className="adminlib-mail"></i>
									{formData.primary_owner_info?.data?.user_email  ?? <Skeleton variant="text" width={150} />}
								</li>
								<li>
									<i className="adminlib-form-phone"></i> +1 (555) 987-6543
								</li>
							</ul>
						</div>
					</div>

				{(
					formData.core_data?.status === 'pending' ||
					formData.core_data?.status === 'rejected' ||
					formData.core_data?.status === 'permanently_rejected'
				) && (
					<>
						<div className="card-content">
							<div className="card-title">
								Note
							</div>

							<div className="form-group-wrapper">
								<div className="form-group">
									<TextArea name="store_application_note" wrapperClass="setting-from-textarea"
										placeholder='Optional note for approval or rejection'
										inputClass="textarea-input"
										descClass="settings-metabox-description" value={formData.store_application_note} onChange={handleChange} />
								</div>
								{formData.core_data?.status != 'permanently_rejected' &&
									<>
									<div className="form-group">
										<label className="checkbox-label">
											<input
												type="checkbox"
												name="store_permanent_reject"
												checked={formData.store_permanent_reject}
												onChange={handleChange}
											/>
											Store Permanently Reject
										</label>
									</div>
									</>
								}
							</div>

							{formData.core_data?.status != 'permanently_rejected' && (
								<>
								<div className="buttons-wrapper" >
									<button
										className="admin-btn btn-green"
										onClick={() => handleSubmit('approve')}
									>
										Approve
									</button>

									<button
										className="admin-btn btn-red"
										onClick={() => handleSubmit('rejected')}
									>
										Reject
									</button>
								</div>
								</>
							)}
								
						</div>
					</>
				)}

				</div>
			</div>
		</>
	);
};

export default StoreRegistration;