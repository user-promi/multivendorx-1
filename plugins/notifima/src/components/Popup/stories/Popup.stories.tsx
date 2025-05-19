import Popup from "../Popup";
import "zyra/build/index.css";

export default {
    title: 'Components/Popup',
    component: Popup,
    parameters: {
        appLocalizer : {
            apiUrl: "#",
            restUrl: "#",
            nonce: "#",
            subscriber_list: "",
            export_button: "",
            khali_dabba: true,
            tab_name: "",
            settings_databases_value: "",// Use a more specific type if possible
            pro_url: "string",
            is_double_optin_free: "string",
            is_double_optin_pro: "string",
            is_recaptcha_enable_free: "string",
            is_recaptcha_enable_pro: "string",
            pro_settings_list: "any",
        }
    }
};

export const TestPopup = ()=>{
    return <Popup/>;
} 
    