import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, TextArea, SuccessNotice, getApiLink } from 'zyra';

const DeactivateRequest = () => {

    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!appLocalizer.store_id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
            });
    }, [appLocalizer.store_id]);

    console.log(formData)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const updated = { ...formData, [name]: value };
        setFormData(updated);
        autoSave(updated);
    };

    const autoSave = (updatedData: { [key: string]: any }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${appLocalizer.store_id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData,
        }).then((res) => {
            if (res.data?.success) {
                setSuccessMsg('Store saved successfully!');
            }
        });
    };

    return(
        <>
             <div className="card-wrapper">
                <div className="card-content">
                    <div className="form-group-wrapper">
                        <div className="form-group">
                            <label htmlFor="store-description">Deactivation Reason</label>
                            <TextArea
                                name="deactivation_reason"
                                inputClass="textarea-input"
                                value={formData.deactivation_reason || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeactivateRequest;