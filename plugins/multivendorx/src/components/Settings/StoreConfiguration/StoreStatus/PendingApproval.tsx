import { BasicInput } from "zyra";

const PendingApproval = () => {


    return (
        <>
            <div className="form-group-wrapper">
                <div className="settings-metabox-note">
                    <i className="adminlib-info"></i>
                    <div className="details">
                        <div className="title">
                        </div>
                        <p>The store is awaiting approval. Sellers can log in to their dashboard but cannot configure settings, add products, or begin selling until approved.</p>
                    </div>
                </div>
            </div>

            <div className="form-group-wrapper">
                <div className="form-group">
                    <ul className="check-list">
                        <li><i className="check adminlib-icon-yes"></i>Can log in to dashboard</li>
                        <li><i className="close adminlib-cross"></i>Modify store settings</li>
                        <li><i className="close adminlib-cross"></i>Add or edit products</li>
                        <li><i className="close adminlib-cross"></i>Process or fulfill orders</li>
                    </ul>
                </div>
            </div>

            <div className="form-group-wrapper">
                <div className="form-group">
                    <label>Message shown to pending stores:</label>
                    <BasicInput
                        name="phone"
                        // value={formData.phone} 
                        wrapperClass="setting-form-input"
                        descClass="settings-metabox-description"
                    // onChange={handleChange} 
                    />
                </div>
            </div>
        </>
    );
};

export default PendingApproval;
