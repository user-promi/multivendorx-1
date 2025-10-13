import { useEffect, useState } from 'react';
import axios from 'axios';
import { BasicInput, SelectInput, getApiLink, SuccessNotice } from 'zyra';

const Facilitator = ({ id }: { id: string|null }) => {
    const [formData, setFormData] = useState<{ [key: string]: any }>({});
    
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        axios({
            method: 'GET',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
        })
            .then((res) => {
                const data = res.data || {};
                setFormData((prev) => ({ ...prev, ...data }));
            })
    }, [id]);
console.log(formData.facilitator)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updated = {
				...(prev || {}),
				[name]: value ?? '',
			};
			autoSave(updated);
			return updated;
		});
	};

    const autoSave = (updatedData: { [key: string]: any }) => {
        axios({
            method: 'PUT',
            url: getApiLink(appLocalizer, `store/${id}`),
            headers: { 'X-WP-Nonce': appLocalizer.nonce },
            data: updatedData
        }).then((res) => {
            if (res.data.success) {
                setSuccessMsg('Store saved successfully!');
            }
        })
    };
    
return (
        <>

            <SuccessNotice message={successMsg} />

            <div className="container-wrapper">
                <div className="card-wrapper width-65">
                    <div className="card-content">
                        <div className="form-group-wrapper">
                            <div className="form-group">
                                <label>Facilitator</label>
                                <SelectInput
                                    name="facilitator"
                                    options={appLocalizer?.facilitators_list || []}
                                    value={formData.facilitator}
                                    type="single-select"
                                    onChange={(newValue: any) => {
                                        if (!newValue || Array.isArray(newValue)) return;

                                        const updated = { ...formData, facilitator: newValue.value };
                                        setFormData(updated);
                                        autoSave(updated);
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="card-wrapper width-35">
					<div className="card-content">
						<div className="card-title">
							Facilitator value
						</div>
						<div className="form-group-wrapper">
							<div className="form-group">
								<label htmlFor="product-name">Fixed</label>
								<BasicInput preInsideText={"$"} postText={"+"} name="facilitator_fixed" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.facilitator_fixed} onChange={handleChange} />
							</div>

							<div className="form-group">
								<label htmlFor="product-name">Percentage</label>
								<BasicInput postInsideText={"%"} name="facilitator_percentage" wrapperClass="setting-form-input" descClass="settings-metabox-description" value={formData.facilitator_percentage} onChange={handleChange} />
							</div>
						</div>
					</div>
				</div>
            </div>




        </>
    );

}

export default Facilitator;