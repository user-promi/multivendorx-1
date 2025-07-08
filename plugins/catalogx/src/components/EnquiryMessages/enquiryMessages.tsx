import React, { useState } from 'react';
import './enquiryMessages.scss';
import { useModules } from '../../contexts/ModuleContext';
import Dialog from '@mui/material/Dialog';
import Popoup from '../Popup/Popup';
import Modulepopup from '../Popup/ModulePopup';

const EnquiryMessages = () => {
    // Check pro is active and module is active or not.
    const { modules } = useModules();
    const [openDialog, setOpenDialog] = useState(false);

    if (!appLocalizer.khali_dabba) {
        return (
            <>
                <Dialog
                    className="admin-module-popup"
                    open={openDialog}
                    onClose={() => {
                        setOpenDialog(false);
                    }}
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross"
                        onClick={() => {
                            setOpenDialog(false);
                        }}
                    ></span>
                    <Popoup />
                </Dialog>
                <div
                    className="enquiry-img"
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                ></div>
            </>
        );
    }

    if (!modules.includes('enquiry')) {
        return (
            <>
                <Dialog
                    className="admin-module-popup"
                    open={openDialog}
                    onClose={() => {
                        setOpenDialog(false);
                    }}
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross stock-manager-popup-cross"
                        onClick={() => {
                            setOpenDialog(false);
                        }}
                    ></span>
                    <Modulepopup name="Enquiry" />
                </Dialog>
                <div
                    className="enquiry-img"
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                ></div>
            </>
        );
    }

    return <div className="container" id="enquiry-messages"></div>;
};

export default EnquiryMessages;
