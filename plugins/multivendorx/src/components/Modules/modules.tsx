import { Modules } from 'zyra';
// import context
import { getModuleData } from '../../services/templateService';
import './modules.scss';
import proPopupContent from '../Popup/popup';

const PluginModules = () => {
    const modulesArray = getModuleData();

    return (
        <Modules
            modulesArray={ modulesArray }
            appLocalizer={ appLocalizer }
            apiLink="modules"
            proPopupContent={ proPopupContent }
            pluginName="multivendorx"
        />
    );
};

export default PluginModules;
