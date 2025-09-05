import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink } from 'zyra';

const StoreQueue = ({ id }: { id: string }) => {
    const [formData, setFormData] = useState<{ [key: string]: string }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    return (
        <>

            {successMsg && (
                <>
                    <div className="admin-notice-wrapper">
                        <i className="admin-font adminlib-icon-yes"></i>
                        <div className="notice-details">
                            <div className="title">Great!</div>
                            <div className="desc">{successMsg}</div>
                        </div>
                    </div>
                </>
            )}
            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">

                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Users</label>
                                <SelectInput
                                    name="country"
                                    options={appLocalizer.store_owners || []}
                                    type="single-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="name-list">
                            <ul>
                                <li>Vendor 1  </li>
                                <li>Vendor 2    </li>
                                <li>Vendor 3  </li>
                            </ul>
                        </div>
                    </div>

                    <div className="card-content">


                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Manager</label>
                                <SelectInput
                                    name="country"
                                    // value={formData.country}
                                    options={appLocalizer.store_owners || []}
                                    type="single-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="name-list">
                            <ul>
                                <li>Vendor 1  </li>
                                <li>Vendor 2   </li>
                                <li>Vendor 3  </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Admin</label>
                                <SelectInput
                                    name="country"
                                    // value={formData.country}
                                    options={appLocalizer.store_owners || []}
                                    type="single-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="name-list">
                            <ul>
                                <li>Vendor 1  </li>
                                <li>Vendor 2    </li>
                                <li>Vendor 3  </li>
                            </ul>
                        </div>
                    </div>

                    <div className="card-content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label htmlFor="product-name">Store Customer</label>
                                <SelectInput
                                    name="country"
                                    // value={formData.country}
                                    options={appLocalizer.store_owners || []}
                                    type="single-select"
                                    onChange={(newValue) => {
                                        if (!newValue || Array.isArray(newValue)) return;
                                        const updated = { ...formData, user: newValue.value, state: '' }; // reset state
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="name-list">
                            <ul>
                                <li>Vendor 1  </li>
                                <li>Vendor 2    </li>
                                <li>Vendor 3  </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>




        </>
    );

}

export default StoreQueue;