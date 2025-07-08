import Dialog from '@mui/material/Dialog';
import React, { useState } from 'react';
import Popoup from '../Popup/Popup';
import Modulepopup from '../Popup/ModulePopup';
import { useModules } from '../../contexts/ModuleContext';
import './quoteRequests.scss';
// import '../AdminLibrary/CustomTable/table.scss';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function QuotesList() {
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
                        className="admin-font adminLib-cross stock-manager-popup-cross"
                        onClick={() => {
                            setOpenDialog(false);
                        }}
                    ></span>
                    <Popoup />
                </Dialog>
                <div
                    className="quote-img"
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                ></div>
            </>
        );
    }

    if (!modules.includes('quote')) {
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
                        className="admin-font adminLib-cross stock-manager-popup-cross"
                        onClick={() => {
                            setOpenDialog(false);
                        }}
                    ></span>
                    <Modulepopup name="Quote" />
                </Dialog>
                <div
                    className="quote-img"
                    onClick={() => {
                        setOpenDialog(true);
                    }}
                ></div>
            </>
        );
    }

    return (
        <>
            <div>
                <div
                    className="admin-subscriber-list"
                    id="quote-list-table"
                ></div>
            </div>
        </>
    );
}
