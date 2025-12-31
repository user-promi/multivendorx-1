import { __ } from '@wordpress/i18n';
import { Card } from 'zyra';

const Tools: React.FC = () => {
	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">{__('Tools', 'multivendorx')}</div>
					<div className="des">
						{__(
							'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Debitis, perferendis.',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<div className="card-wrapper">
				<Card
					title={__('Vendor Dashboard transients', 'multivendorx')}
					desc={__('Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, nesciunt?', 'multivendorx' )}
				>
					<div className="admin-btn btn-purple">
						<i className="adminlib-delete"></i>
						{__('Clear Transients', 'multivendorx')}
					</div>
				</Card>

			</div>
		</>
	);
};

export default Tools;
