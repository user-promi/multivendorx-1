import React, { useState } from 'react';
import { useModules } from '../../contexts/ModuleContext';

import './Rules.scss';
import Dialog from '@mui/material/Dialog';
import Popoup from '../Popup/Popup';
import Modulepopup from '../Popup/ModulePopup';
// import "../AdminLibrary/CustomTable/table.scss";

const Rules = () => {
    // Check pro is active and module is active or not.
    const { modules } = useModules();

    // State variable declearation
    const [ openDialog, setOpenDialog ] = useState( false );

    if ( ! appLocalizer.khali_dabba ) {
        return (
            <>
                <Dialog
                    className="admin-module-popup"
                    open={ openDialog }
                    onClose={ () => {
                        setOpenDialog( false );
                    } }
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross"
                        onClick={ () => {
                            setOpenDialog( false );
                        } }
                    ></span>
                    <Popoup />
                </Dialog>
                <div
                    className="dynamic-rule-img"
                    style={
                        {
                            '--url': `url(${ appLocalizer.dynamic_rules_bg })`,
                        } as any
                    }
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </>
        );
    }

    if ( ! modules.includes( 'rules' ) ) {
        return (
            <>
                <Dialog
                    className="admin-module-popup"
                    open={ openDialog }
                    onClose={ () => {
                        setOpenDialog( false );
                    } }
                    aria-labelledby="form-dialog-title"
                >
                    <span
                        className="admin-font adminlib-cross stock-manager-popup-cross"
                        onClick={ () => {
                            setOpenDialog( false );
                        } }
                    ></span>
                    <Modulepopup name="Rules" />
                </Dialog>
                <div
                    className="dynamic-rule-img"
                    style={
                        {
                            '--url': `url(${ appLocalizer.dynamic_rules_bg })`,
                        } as any
                    }
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </>
        );
    }

    return (
        <main
            className="catalog-rules-main-container"
            id="rules-list-table"
        ></main>
    );
};

export default Rules;
