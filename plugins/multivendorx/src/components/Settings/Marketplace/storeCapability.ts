import { __ } from '@wordpress/i18n';

const capabilityOptions = appLocalizer?.capabilities
    ? Object.entries(appLocalizer.capabilities).map(([key, group]) => {
          return {
              key,
              type: 'checkbox',
              label: group.label,
              desc: group.desc,
              options: Object.entries(group.capability || {}).map(([capKey, capLabel]) => {
                  const proData = appLocalizer.capability_pro?.[capKey] || {};
                  return {
                      key: capKey,
                      label: capLabel,
                      value: capKey,
                      proSetting: proData.prosetting === true,
                      moduleEnabled: proData.module || null,
                  };
              }),
              selectDeselect: true,
          };
      })
    : [];

const staticOptions = [
    {
        key: 'section',
        type: 'section',
        hint: __('Store profile editing permissions', 'multivendorx'),
    },
    {
        key: 'edit_store_info_activation',
        type: 'checkbox',
        label: __('Post-activation edit controls', 'multivendorx'),
        desc: __('Control which store information fields can be modified after a store has been activated.', 'multivendorx'),
        options: [
            {
                key: 'edit_business_details',
                label: __('Edit business details', 'multivendorx'),
                value: 'edit_business_details',
            },
            {
                key: 'upload_store_branding',
                label: __('Update store branding', 'multivendorx'),
                value: 'upload_store_branding',
            },
            {
                key: 'modify_store_address',
                label: __('Modify store address', 'multivendorx'),
                value: 'modify_store_address',
            },
        ],
        selectDeselect: true,
    },
];

const modalOptions = [...capabilityOptions, ...staticOptions];

export default {
    id: 'store-capability',
    priority: 2,
    name: __('Store Permissions', 'multivendorx'),
    desc: __('Control which features and actions are available to each store role.', 'multivendorx'),
    icon: 'adminlib-wholesale',
    submitUrl: 'settings',
    modal: modalOptions,
};
