import { useEffect, useState } from 'react';
import axios from 'axios';
import { TextArea, getApiLink, SuccessNotice } from 'zyra';
import { Skeleton } from '@mui/material';
import { jsPDF } from "jspdf";


const StoreRegistration = ({ id }: { id: string | null }) => {
	const [formData, setFormData] = useState<{ [key: string]: string }>({});
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [previousNotes, setPreviousNotes] = useState<{ note: string; date: string }[]>([]);


	const handleDownloadPDF = () => {
		const doc = new jsPDF();
		doc.setFontSize(16);
		doc.text("Registration Data", 10, 15);
		doc.setFontSize(12);

		const registrationData = formData.registration_data || {};

		if (Object.keys(registrationData).length === 0) {
			doc.text("Store submitted application without filling out registration form.", 10, 30);
		} else {
			let y = 30;
			Object.entries(registrationData).forEach(([label, value]) => {
				doc.text(`${label}: ${value || "[Not Provided]"}`, 10, y);
				y += 10;
			});
		}

		doc.save("registration-data.pdf");
	};

	const fetchStoreData = () => {
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce, "registrations": 'registrations' },
		})
			.then((res) => {
				const data = res.data || {};
				if (Array.isArray(data.store_application_note)) {
					setPreviousNotes(data.store_application_note);
					delete data.store_application_note;
				}
				setFormData(data);
			});
	};

	useEffect(() => {
		if (id) fetchStoreData();
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
				window.location.reload();
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
								<div className="card-header">
									<div className="left">
										<div className="title">
											Store details
										</div>
									</div>
								</div>
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
						<div className="card-header">
							<div className="left">
								<div className="title">
									{formData.core_data?.status === 'pending' || formData.core_data?.status === 'rejected' ? 'Registration form details' : 'Archive data'}

								</div>
							</div>
							<div className="right">
								{formData.registration_data && Object.keys(formData.registration_data).length > 0 && (
									<div
										onClick={() => {
											handleDownloadPDF()
										}}
										className="admin-btn btn-purple"
									>
										<i className="adminlib-import"></i> Download
									</div>
								)}
							</div>

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
							<div className="no-data">Store submitted application without filling out registration form.</div>
						)}
					</div>
				</div>


				{(formData.core_data?.status == 'pending' ||
					formData.core_data?.status == 'rejected' ||
					formData.core_data?.status == 'permanently_rejected'
				) && (
						<div className="card-wrapper w-35">
							<div className="card-content">

								<div className="card-header">
									<div className="left">
										<div className="title">
											Submited by
										</div>
									</div>
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
											{formData.primary_owner_info?.data?.user_email ?? <Skeleton variant="text" width={150} />}
										</li>
									</ul>
								</div>
							</div>

							{/* {( formData.core_data?.status === 'permanently_rejected' ) && ( */}
							<>
								{previousNotes.length > 0 && (
									<div className="card-content">
										<div className="card-header">
											<div className="left">
												<div className="title">
													Previous Notes
												</div>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group">
												<ul>
													{previousNotes.map((item, idx) => (
														<li key={idx}>
															<strong>{item.date}:</strong> {item.note}
														</li>
													))}
												</ul>

											</div>
										</div>
									</div>
								)}

								{formData.core_data?.status != 'permanently_rejected' && (
									<div className="card-content">
										<div className="card-header">
											<div className="left">
												<div className="title">
													Note
												</div>
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group">
												<TextArea name="store_application_note" wrapperClass="setting-from-textarea"
													placeholder='Optional note for approval or rejection'
													inputClass="textarea-input"
													descClass="settings-metabox-description"
													value={formData.store_application_note || ''}
													onChange={handleChange} />
											</div>
										</div>
										<div className="form-group-wrapper">
											<div className="form-group">
												<label className="checkbox-label">
													<input
														type="checkbox"
														name="store_permanent_reject"
														checked={formData.store_permanent_reject}
														onChange={handleChange}
													/>
													Reject store permanently
												</label>
											</div>
										</div>

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
									</div>
								)}
							</>

						</div>
					)}
			</div>
		</>
	);
};

export default StoreRegistration;