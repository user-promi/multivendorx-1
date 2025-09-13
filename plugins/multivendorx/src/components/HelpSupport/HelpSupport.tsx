import { AdminBreadcrumbs } from "zyra";

const HelpSupport: React.FC = () => {
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Help & Support"
                description={'Manage all pending administrative actions including approvals, payouts, and notifications.'}
            />

            <div className="admin-dashboard">
                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Channels
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Discover more marketing tools
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="support-wrapper">
                                <div className="support">
                                    <div className="image">

                                    </div>
                                    <div className="details">
                                        <div className="name">Google for WooCommerce</div>
                                        <div className="des">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum, accusantium dolore officia eaque voluptas nobis.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">Google for WooCommerce</div>
                                        <div className="des">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum, accusantium dolore officia eaque voluptas nobis.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">Google for WooCommerce</div>
                                        <div className="des">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum, accusantium dolore officia eaque voluptas nobis.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HelpSupport;