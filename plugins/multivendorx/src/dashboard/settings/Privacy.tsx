import { useState } from 'react';
import { BasicInput, TextArea, FileInput, SelectInput, getApiLink } from 'zyra';

const Privacy = () => {
    return (
        <>
            <div className="card-wrapper">
                <div className="card-content">
                    <div className="settings-metabox-note">
                        <i className="adminlib-info"></i>
                        <p>Confirm that you have access to johndoe@gmail.com in sender email settings.</p>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Shipping Policy</label>
                            <TextArea
                                name="content"
                                inputClass="textarea-input"
                            // value={formData.content}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Refund Policy</label>
                            <TextArea
                                name="content"
                                inputClass="textarea-input"
                            // value={formData.content}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="product-name">Cancellation/Return/Exchange Policy</label>
                            <TextArea
                                name="content"
                                inputClass="textarea-input"
                            // value={formData.content}
                            // onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Privacy;
