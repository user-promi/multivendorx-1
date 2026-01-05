/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import '../styles/web/Attachment.scss';

const Attachment: React.FC = () => {
    return (
        <div className="main-input-wrapper">
            <div className="attachment-section">
                <label htmlFor="dropzone-file" className="attachment-label">
                    <div className="wrapper">
                        <i className="adminfont-cloud-upload"></i>
                        <p className="heading">
                            <span>{ 'Click to upload' }</span>{ ' ' }
                            { 'or drag and drop' }
                        </p>
                    </div>
                </label>
            </div>
        </div>
    );
};

export default Attachment;
