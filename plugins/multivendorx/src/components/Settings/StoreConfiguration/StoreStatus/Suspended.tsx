import { BasicInput } from "zyra";

const Suspended = () => {

    const modules = [
        {
            title: "Keep store visible but disable checkout",
            description: "Displays the store and its products but prevents customers from placing new orders.Freeze all pending payments",
            key: "pause_selling",
            icon: "adminlib-cart",
        },
        {
            title: "Freeze all pending payments",
            description: "Holds all earnings during suspension. Funds are released only after reinstatement or successful appeal.",
            key: "hold_payments",
            icon: "adminlib-cart",
        },
    ];

    return (
        <>

            {/* <div className="form-group-wrapper">
                <div className="form-group">
                    <ul className="check-list">
                        <li><i className="check adminlib-icon-yes"></i>Can log in to dashboard</li>
                        <li><i className="close adminlib-cross"></i>Modify store settings</li>
                        <li><i className="close adminlib-cross"></i>Add or edit products</li>
                        <li><i className="close adminlib-cross"></i>Process or fulfill orders</li>
                    </ul>
                </div>
            </div> */}
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
                    <div className="mini-module">
                        {modules.map((module, index) => (
                            <div className="module-list-item" key={module.key}>
                                <div className="module-header">
                                    <i className={`font ${module.icon}`}></i>

                                    <div className="toggle-checkbox" data-tour={`id-showcase-tour-${module.key}`}>
                                        <input
                                            type="checkbox"
                                            className="woo-toggle-checkbox"
                                            id={`toggle-switch-${module.key}`}
                                        />
                                        <label
                                            htmlFor={`toggle-switch-${module.key}`}
                                            className="toggle-switch-is_hide_cart_checkout"
                                        ></label>
                                    </div>
                                </div>

                                <div className="module-name">{module.title}</div>
                                <p className="module-description">{module.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-group-wrapper">
                <div className="form-group">
                    <label>Message shown to suspended stores:</label>
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

export default Suspended;
