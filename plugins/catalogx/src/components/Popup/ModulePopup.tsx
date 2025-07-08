import { sprintf } from '@wordpress/i18n';
import { ProPopup } from 'zyra';

interface PopupProps {
    name: string;
}

const ModulePopup: React.FC<PopupProps> = (props) => {
    const proPopupContent = {
        moduleName: props.name,
        message: sprintf(
            'To activate please enable the %s module first',
            props.name
        ),
        moduleButton: 'Enable Now',
        modulePageUrl:
            typeof appLocalizer !== 'undefined'
                ? appLocalizer.module_page_url
                : '#',
    };

    return <ProPopup {...proPopupContent} />;
};

export default ModulePopup;
