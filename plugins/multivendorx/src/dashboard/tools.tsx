import { __ } from "@wordpress/i18n";

const Tools: React.FC = () => {
    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">{__("Tools", "multivendorx")}</div>
                    <div className="des">{__("Lorem ipsum dolor sit amet consectetur, adipisicing elit. Debitis, perferendis.", "multivendorx")}</div>
                </div>
            </div>

            <div className="card-wrapper">
                <div className="card-content">
                    <div className="card-header">
                        <div className="left">
                            <div className="title">
                                {__("Vendor Dashboard transients", "multivendorx")}
                            </div>
                            <div className="des">
                                {__("Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus, nesciunt?", "multivendorx")}
                            </div>
                        </div>
                    </div>

                    <div className="card-body">
                        <div className="admin-btn btn-purple">
                            {__("Clear Transients", "multivendorx")}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default Tools;