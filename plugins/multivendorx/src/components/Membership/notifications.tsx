import { BasicInput } from "zyra";

const Notifications = ({ id }: { id: string }) => {

    return (
        <>
            <div className="container-wrapper">
                <div className="card-wrapper column w-65">
                    <div className="card-content">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">Membership Settings</div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Reminder Days Before Expiration</label>
                                    <BasicInput name="name" size="10rem" postText="days before expiration" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <div className="notice-wrapper green">
                                        <div className="notice-name">
                                            <i className="adminlib-cart green"></i>
                                            Payment Due
                                        </div>
                                        <div className="des">Sent when payment is overdue</div>
                                    </div>

                                    <div className="notice-wrapper yellow">
                                        <div className="notice-name">
                                            <i className="adminlib-cart yellow"></i>
                                            Renewal Reminder
                                        </div>
                                        <div className="des">Sent when payment is overdue</div>
                                    </div>

                                    <div className="notice-wrapper blue">
                                        <div className="notice-name">
                                            <i className="adminlib-cart blue"></i>
                                           Grace Period
                                        </div>
                                        <div className="des">Sent when payment is overdue</div>
                                    </div>

                                    <div className="notice-wrapper red">
                                        <div className="notice-name">
                                            <i className="adminlib-cart red"></i>
                                            Expiration Notice
                                        </div>
                                        <div className="des">Sent when payment is overdue</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notifications;
