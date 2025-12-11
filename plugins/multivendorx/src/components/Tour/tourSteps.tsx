export const getTourSteps = (appLocalizer: any) => [
	{
		selector: '[data-tour="appointment-showcase-tour"]',
		placement: 'right',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Store Commissions test from zyra</h3>
				<h4>Manage your store commission settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-commissions`,
								1
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},

	{
		selector: '.general-wrapper .menu-item.active-current-tab',
		placement: 'auto',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Disbursement</h3>
				<h4>View and configure your disbursement settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=payment-integration`,
								2
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},

	{
		selector: undefined,
		placement: 'auto',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Payment Integration</h3>
				<h4>Set up your payment integration settings here.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=settings&subtab=store-registration-form`,
								3
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},

	{
		selector: undefined,
		placement: 'auto',
		content: ({ navigateTo, finishTour }: any) => (
			<div className="tour-box">
				<h3>Store Registration Form</h3>
				<h4>Manage the registration form for new stores.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={() =>
							navigateTo(
								`${appLocalizer.site_url}/wp-admin/admin.php?page=multivendorx#&tab=modules`,
								4
							)
						}
					>
						Next
					</button>

					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						End Tour
					</button>
				</div>
			</div>
		),
	},

	{
		selector: undefined,
		placement: 'auto',
		content: ({ finishTour }: any) => (
			<div className="tour-box">
				<h3>Modules</h3>
				<h4>Here you can enable or disable marketplace modules.</h4>

				<div className="tour-footer">
					<button
						className="admin-btn btn-purple"
						onClick={finishTour}
					>
						Finish Tour
					</button>
				</div>
			</div>
		),
	},
];
