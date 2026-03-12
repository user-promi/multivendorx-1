import { __ } from '@wordpress/i18n';

const mapType = appLocalizer.settings_databases_value.geolocation.choose_map_api;

export default {
	id: 'business-address',
	priority: 4,
	headerTitle: __('Business Address', 'multivendorx'),
    headerDescription: __(
        'Provide your business address, city, zip code, country, state, and timezone to ensure accurate order and location settings.',
        'multivendorx'
    ),
    headerIcon: 'location',
	submitUrl: `store/${appLocalizer.store_id}`,
	modal: [
		{
            type: 'text',
            key: 'address',
            label: __('Address *', 'multivendorx'),
            required: true,
            placeholder: __('Enter your street address', 'multivendorx')
        },
        {
            type: 'text',
            key: 'city',
            label: __('City', 'multivendorx'),
            placeholder: __('Enter city name', 'multivendorx')
        },
        {
            type: 'number',
            key: 'zip',
            label: __('Zip code', 'multivendorx'),
            placeholder: __('Enter zip/postal code', 'multivendorx')
        },
		{
            type: 'select',
            key: 'country',
            label: __('Country', 'multivendorx'),
            options: appLocalizer.country_list,
        },
        {
            type: 'select',
            key: 'state',
            label: __('State', 'multivendorx'),
            options: appLocalizer.state_list, // This will be populated dynamically based on selected country
            dependent: {
				key: 'country',
				set: true,
			},
        },
        //map component load 
        {
            type: mapType,
            key: 'location',
            apiKey: appLocalizer.settings_databases_value.geolocation[`${mapType}_api_key`],
            label: __('Set Location on Map', 'multivendorx'),
            description: __('Drag the marker to set your business location accurately.', 'multivendorx'),
            required: true,
        }
	],
};
