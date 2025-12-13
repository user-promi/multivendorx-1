import { __ } from '@wordpress/i18n';

const Financial = ({ id }: { id: string | null }) => {
	return (
		<>
			<div className="container-wrapper">
				<div className="card-wrapper w-65">
					<div className="card-content">
						<div className="card-header">
							<div className="left">
								<div className="title">
									{__('Recent Payouts', 'multivendorx')}
								</div>
							</div>
						</div>

						<div className="card-body">
							<div className="store-owner-details">
								<div className="profile">
									<div className="avater">
										<span className="adminlib-calendar"></span>
									</div>
									<div className="details">
										<div className="name">$5,420</div>
										<div className="des">Oct 15, 2024</div>
									</div>
								</div>
								<div className="right-details">
									<div className="admin-badge green">
										{__('Completed', 'multivendorx')}
									</div>
								</div>
							</div>

							<div className="store-owner-details">
								<div className="profile">
									<div className="avater">
										<span className="adminlib-calendar"></span>
									</div>
									<div className="details">
										<div className="name">$5,420</div>
										<div className="des">Oct 15, 2024</div>
									</div>
								</div>
								<div className="right-details">
									<div className="admin-badge green">
										{__('Completed', 'multivendorx')}
									</div>
								</div>
							</div>

							<div className="store-owner-details">
								<div className="profile">
									<div className="avater">
										<span className="adminlib-calendar"></span>
									</div>
									<div className="details">
										<div className="name">$5,420</div>
										<div className="des">Oct 15, 2024</div>
									</div>
								</div>
								<div className="right-details">
									<div className="admin-badge green">
										{__('Completed', 'multivendorx')}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="card-wrapper w-35"></div>
			</div>
		</>
	);
};

export default Financial;
