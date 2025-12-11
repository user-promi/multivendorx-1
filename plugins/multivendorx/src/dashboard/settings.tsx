import { useEffect, useState } from 'react';
import axios from 'axios';
import {
	BasicInput,
	TextArea,
	FileInput,
	SelectInput,
	useModules,
	getApiLink,
	Tabs,
} from 'zyra';
import GeneralSettings from './settings/general';
import Appearance from './settings/Appearance';
import SocialMedia from './settings/SocialMedia';
import ContactInformation from './settings/ContactInformation';
import BusinessAddress from './settings/BusinessAddress';
import Withdrawl from './settings/withdrawl';
import Privacy from './settings/Privacy';
import Verification from './settings/Verification';
import ShippingDelivery from './settings/ShippingDelivery';
import LiveChat from './settings/LiveChat';

const settings = () => {
	const id = appLocalizer.store_id;
	const [ formData, setFormData ] = useState< { [ key: string ]: string } >(
		{}
	);
	const [ successMsg, setSuccessMsg ] = useState< string | null >( null );
	const [ stateOptions, setStateOptions ] = useState<
		{ label: string; value: string }[]
	>( [] );
	const { modules } = useModules();

	useEffect( () => {
		if ( ! id ) return;

		axios( {
			method: 'GET',
			url: getApiLink( appLocalizer, `store/${ id }` ),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		} ).then( ( res ) => {
			const data = res.data || {};
			setFormData( ( prev ) => ( { ...prev, ...data } ) );
		} );
	}, [ id ] );

	useEffect( () => {
		if ( successMsg ) {
			const timer = setTimeout( () => setSuccessMsg( null ), 3000 );
			return () => clearTimeout( timer );
		}
	}, [ successMsg ] );
	useEffect( () => {
		if ( formData.country ) {
			fetchStatesByCountry( formData.country );
		}
	}, [ formData.country ] );

	const fetchStatesByCountry = ( countryCode: string ) => {
		axios( {
			method: 'GET',
			url: getApiLink( appLocalizer, `states/${ countryCode }` ),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		} ).then( ( res ) => {
			setStateOptions( res.data || [] );
		} );
	};

	const handleChange = (
		e: React.ChangeEvent< HTMLInputElement | HTMLTextAreaElement >
	) => {
		const { name, value } = e.target;
		const updated = { ...formData, [ name ]: value };
		setFormData( updated );
		autoSave( updated );
	};

	const autoSave = ( updatedData: { [ key: string ]: string } ) => {
		axios( {
			method: 'PUT',
			url: getApiLink( appLocalizer, `store/${ id }` ),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: updatedData,
		} ).then( ( res ) => {
			if ( res.data.success ) {
				setSuccessMsg( 'Store saved successfully!' );
			}
		} );
	};

	const SimpleLink = ( { to, children, onClick, className }: any ) => (
		<a href={ to } onClick={ onClick } className={ className }>
			{ children }
		</a>
	);

	const getCurrentTabFromUrl = () => {
		const hash = window.location.hash.replace( /^#/, '' );
		const hashParams = new URLSearchParams( hash );
		return hashParams.get( 'subtab' ) || 'general';
	};

	const [ currentTab, setCurrentTab ] = useState( getCurrentTabFromUrl() );

	useEffect( () => {
		const handleHashChange = () => setCurrentTab( getCurrentTabFromUrl() );
		window.addEventListener( 'hashchange', handleHashChange );
		return () =>
			window.removeEventListener( 'hashchange', handleHashChange );
	}, [] );

	// Build hash URL for a given tab
	const prepareUrl = ( tabId: string ) => `#subtab=${ tabId }`;

	const tabData = [
		{
			type: 'file',
			content: {
				id: 'general',
				name: 'General',
				desc: 'Update your store’s core information - name, slug, description, and buyer message',
				icon: 'tools',
			},
		},
		{
			type: 'file',
			content: {
				id: 'appearance',
				name: 'Appearance',
				desc: 'Manage your store’s profile image, banner, and video.',
				icon: 'appearance',
			},
		},
		{
			type: 'file',
			content: {
				id: 'business-address',
				name: 'Business Address',
				desc: 'Provide your business address, city, zip code, country, state, and timezone to ensure accurate order and location settings.',
				icon: 'form-address',
			},
		},
		{
			type: 'file',
			content: {
				id: 'contact-information',
				name: 'Contact Information',
				desc: 'Add your store’s contact details so customers can reach you easily through phone, email.',
				icon: 'form-phone',
			},
		},
		{
			type: 'file',
			content: {
				id: 'social-media',
				name: 'Social Media',
				desc: 'Add your store’s social media links to help buyers connect with you across platforms.',
				icon: 'cohort',
			},
		},
		{
			type: 'file',
			content: {
				id: 'payout',
				name: 'Payout',
				desc: 'Enter your payment information and select the method you’d like to use for receiving store payouts.',
				icon: 'wallet-open',
			},
		},
		...( modules.includes( 'store-policy' )
			? [
					{
						type: 'file',
						content: {
							id: 'privacy',
							name: 'Privacy',
							desc: 'Define your store’s policies so customers clearly understand your shipping, refund, and return terms.',
							// hideTabHeader: true,
							icon: 'privacy',
						},
					},
			  ]
			: [] ),
		...( modules.includes( 'store-shipping' )
			? [
					{
						type: 'file',
						content: {
							id: 'shipping',
							name: 'Shipping',
							desc: 'Manage your store’s shipping method, pricing rules, and location-based rates.',
							// hideTabHeader: true,
							icon: 'shipping',
						},
					},
			  ]
			: [] ),
		...( modules.includes( 'marketplace-compliance' )
			? [
					{
						type: 'file',
						content: {
							id: 'verification',
							name: 'Verification',
							desc: 'verification',
							// hideTabHeader: true,
							icon: 'verification5',
						},
					},
			  ]
			: [] ),
		...( modules.includes( 'live-chat' )
			? [
					{
						type: 'file',
						content: {
							id: 'livechat',
							name: 'Livechat',
							desc: 'Connect your store with live chat platforms so customers can reach you instantly for support or inquiries.',
							// hideTabHeader: true,
							icon: 'live-chat',
						},
					},
			  ]
			: [] ),
	];

	const getForm = ( tabId: string ) => {
		switch ( tabId ) {
			case 'general':
				return <GeneralSettings />;
			case 'appearance':
				return <Appearance />;
			case 'business-address':
				return <BusinessAddress />;
			case 'contact-information':
				return <ContactInformation />;
			case 'social-media':
				return <SocialMedia />;
			case 'payout':
				return <Withdrawl />;
			case 'privacy':
				return <Privacy />;
			case 'shipping':
				return <ShippingDelivery />;
			case 'verification':
				return <Verification />;
			case 'livechat':
				return <LiveChat />;
			default:
				return <div></div>;
		}
	};
	return (
		<>
			<div className="horizontal-tabs">
				<Tabs
					tabData={ tabData }
					currentTab={ currentTab }
					getForm={ getForm }
					prepareUrl={ prepareUrl }
					appLocalizer={ appLocalizer }
					settingName="Settings"
					supprot={ [] }
					Link={ SimpleLink }
					submenuRender={ true }
					menuIcon={ true }
				/>
			</div>
		</>
	);
};

export default settings;
