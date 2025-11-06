import { BasicInput } from "zyra";

const UnderReview = () => {

    const modules = [
        {
            title: "Pause selling products",
           // description: "Prevent stores from selling and fulfilling orders while under review.",
            key: "pause_selling",
            icon: "adminlib-cart",
        },
        {
            title: "Hold payments release",
           // description: "Keep earnings on hold until the review concludes. Payments will release once compliance is cleared.",
            key: "hold_payments",
            icon: "adminlib-cart",
        },
        {
            title: "Restrict new product uploads",
            //description: "Prevent stores from listing new products during review. Existing listings stay active unless selling is disabled.",
            key: "restrict_product_uploads",
            icon: "adminlib-product",
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
        </>
    );
};

export default UnderReview;
