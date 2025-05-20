(globalThis as any).appLocalizer = {
  pro_url: "https://example.com/pro-upgrade"
};


import Popup from "../components/Popup/Popup";
import "zyra/build/index.css";

export default {
    title: 'Notifima/Components/Popup',
    component: Popup,
};

export const TestPopup = ()=>{
    return <Popup/>;
} 
    