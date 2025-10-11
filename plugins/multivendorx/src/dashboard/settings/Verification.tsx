import { useState } from 'react';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const Verification = () => {
    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-title">Identity Documents</div>


                    <div className="card-title">Required Information</div>


                    <div className="card-title">Social Profiles</div>

                    <div className="varification-wrapper">
                        <div className="left">
                            <i className="adminlib-linkedin yellow"></i>
                            <div className="name">Verify via Linkedin</div>
                        </div>
                        <div className="right">
                            <div className="admin-btn btn-purple">Verified</div>
                        </div>
                    </div>

                    <div className="varification-wrapper">
                        <div className="left">
                            <i className="adminlib-google yellow"></i>
                            <div className="name">Verify via Google</div>
                        </div>
                        <div className="right">
                            <div className="admin-btn btn-green">Verified successfully</div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Verification;
