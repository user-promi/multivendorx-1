import { BasicInput, TextArea } from 'zyra';

const Notifications = ({ id }: { id: string }) => {
	return (
		<>
			<div className="container-wrapper">
				<div className="card-wrapper">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">Membership Settings</div>
							</div>
						</div>
						<div className="card-body">
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										Reminder Days Before Expiration
									</label>
									<BasicInput
										name="name"
										postText="days before expiration"
										size="12rem"
										wrapperClass="setting-form-input"
										descClass="settings-metabox-description"
									/>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										Payment Due
									</label>
									<TextArea
										name="short_description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
									// value={product.short_description}
									// onChange={(e) =>
									//     handleChange(
									//         'short_description',
									//         e.target.value
									//     )
									// }
									/>
								</div>
								<div className="form-group">
									<label htmlFor="product-name">
										Renewal Reminder
									</label>
									<TextArea
										name="short_description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
									// value={product.short_description}
									// onChange={(e) =>
									//     handleChange(
									//         'short_description',
									//         e.target.value
									//     )
									// }
									/>
								</div>
							</div>
							<div className="form-group-wrapper">
								<div className="form-group">
									<label htmlFor="product-name">
										Grace Period
									</label>
									<TextArea
										name="short_description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
									// value={product.short_description}
									// onChange={(e) =>
									//     handleChange(
									//         'short_description',
									//         e.target.value
									//     )
									// }
									/>
								</div>
								<div className="form-group">
									<label htmlFor="product-name">
										Expiration Notice
									</label>
									<TextArea
										name="short_description"
										wrapperClass="setting-from-textarea"
										inputClass="textarea-input"
										descClass="settings-metabox-description"
									// value={product.short_description}
									// onChange={(e) =>
									//     handleChange(
									//         'short_description',
									//         e.target.value
									//     )
									// }
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

export default Notifications;
