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
                                    <BasicInput name="name" postText="days before expiration" size="12rem" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Payment Due</label>
                                    <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="product-name">Renewal Reminder</label>
                                    <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                            </div>
                            <div className="form-group-wrapper">
                                <div className="form-group">
                                    <label htmlFor="product-name">Grace Period</label>
                                    <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="product-name">Expiration Notice</label>
                                    <BasicInput name="name" wrapperClass="setting-form-input" descClass="settings-metabox-description" />
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
