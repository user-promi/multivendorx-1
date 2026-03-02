// /* global appLocalizer */
import Brand from '../../assets/images/multivendorx-logo.png';
import React, { useEffect, JSX } from 'react';
import { __ } from '@wordpress/i18n';
// Context
import { SettingProvider, useSetting } from '../../contexts/SettingContext';
// Services
import { getTemplateData } from '../../services/templateService';
// Utils
import {
	getAvailableSettings,
	getSettingById,
	useModules,
	SettingsNavigator,
	RenderComponent,
} from 'zyra';
import ShowProPopup from '../Popup/Popup';
import { useLocation, Link } from 'react-router-dom';

// Types
type SettingItem = Record<string, any>;

interface SettingsProps {
	id: string;
}

const StatusAndTools: React.FC<SettingsProps> = () => {
	const settingsArray: SettingItem[] = getAvailableSettings(
		getTemplateData('tools'),
		[]
	);
	const location = new URLSearchParams(useLocation().hash.substring(1));

	// Render the dynamic form
	const GetForm = (currentTab: string | null): JSX.Element | null => {
		// get the setting context
		const { setting, settingName, setSetting, updateSetting } =
			useSetting();
		const { modules } = useModules();

		if (!currentTab) {
			return null;
		}
		const settingModal = getSettingById(settingsArray as any, currentTab);
		const [storeTabSetting, setStoreTabSetting] = React.useState<any>(null);

		// Ensure settings context is initialized
		if (settingName !== currentTab) {
			setSetting(
				currentTab,
				appLocalizer.settings_databases_value[currentTab] || {}
			);
		}

		// eslint-disable-next-line react-hooks/rules-of-hooks
		useEffect(() => {
			if (settingName === currentTab) {
				appLocalizer.settings_databases_value[settingName] = setting;
			}

			const storeCapability =
				appLocalizer.settings_databases_value['store-permissions'];

			if (storeCapability) {
				setStoreTabSetting(storeCapability);
				const userCapability =
					appLocalizer.settings_databases_value['user-permissions'] ||
					{};

				// all capability arrays into one
				const storeOwnerCaps: string[] = [];
				Object.values(storeCapability).forEach((caps) => {
					if (Array.isArray(caps)) {
						storeOwnerCaps.push(...caps);
					}
				});

				const result = { store_owner: storeOwnerCaps };

				Object.entries(userCapability).forEach(([role, caps]) => {
					if (role !== 'store_owner' && Array.isArray(caps)) {
						userCapability[role] = caps.filter((cap) =>
							storeOwnerCaps.includes(cap)
						);
					}
				});

				appLocalizer.settings_databases_value['user-permissions'] = {
					...userCapability,
					...result,
				};
			}
		}, [setting, settingName, currentTab]);

		return (
			<>
				{settingName === currentTab ? (
					<RenderComponent
						settings={settingModal}
						proSetting={appLocalizer.pro_settings_list}
						setting={setting}
						updateSetting={updateSetting}
						appLocalizer={appLocalizer}
						modules={modules}
						Popup={ShowProPopup}
						storeTabSetting={storeTabSetting}
					/>
				) : (
					<>Loading...</>
				)}
			</>
		);
	};

	return (
		<SettingProvider>
			<SettingsNavigator
				settingContent={settingsArray as any}
				currentSetting={location.get('subtab') as string}
				getForm={GetForm}
				prepareUrl={(subTab: string) =>
					`?page=multivendorx#&tab=status-tools&subtab=${subTab}`
				}
				appLocalizer={appLocalizer}
				Link={Link}
				settingName={'Status & Tools'}
			/>
		</SettingProvider>
	);
};

export default StatusAndTools;
