import { Modules } from 'zyra';
import { useModules } from '../../contexts/ModuleContext';
// import context
import { getModuleData } from '../../services/templateService';
import './modules.scss';

const PluginModules = () => {
    const { modules } = useModules();

    const modulesArray = getModuleData();

    return (
        <Modules
            modules={ modules }
            modulesArray={ modulesArray }
            appLocalizer={ appLocalizer }
        />
    );
};

export default PluginModules;
