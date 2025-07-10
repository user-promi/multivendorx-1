import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import Popoup from '../Popup/Popup';
import Modulepopup from '../Popup/ModulePopup';
import { useModules } from '../../contexts/ModuleContext';
import './wholesaleUser.scss';
// import '../AdminLibrary/CustomTable/table.scss';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file

const WholesaleUser = () => {
    // Check pro is active and module is active or not.
    const { modules } = useModules();
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
                    className="wholesale-user-image"
                    style={
                        {
                            '--url': `url(${ appLocalizer.wholesale_users_bg })`,
                        } as any
                    }
                    onClick={ () => {
                        setOpenDialog( true );
                    } }
                ></div>
            </>
        );
    }

    if ( ! modules.includes( 'wholesale' ) ) {
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
                    <Modulepopup name="Wholesale" />
                </Dialog>
                <div
                    className="wholesale-user-image"
                    style={
                        {
                            '--url': `url(${ appLocalizer.wholesale_users_bg })`,
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
        <div className="admin-wholesale-list" id="wholesale-list-table"></div>
    );
};
export default WholesaleUser;
