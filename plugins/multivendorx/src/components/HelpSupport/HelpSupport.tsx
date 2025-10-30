import { AdminBreadcrumbs } from "zyra";

const HelpSupport: React.FC = () => {
    return (
        <>
            <AdminBreadcrumbs
                activeTabIcon="adminlib-cart"
                tabTitle="Help & Support"
                description={'Get fast help, expert guidance, and easy-to-follow resources - all in one place.'}
            />

            <div className="general-wrapper">
                <div className="row">
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Community & Forums
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="support-wrapper">
                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">Facebook Community</div>
                                        <div className="des">Connect with other store owners, share tips, and get quick solutions.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">WordPress Support Forum</div>
                                        <div className="des">Ask questions and get expert guidance from the WordPress community.</div>
                                    </div>
                                </div>
                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">Our Forum</div>
                                        <div className="des">Discuss MultiVendorX features, report issues, and collaborate with other users.</div>
                                    </div>
                                </div>
                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">Live Chat</div>
                                        <div className="des">Get real-time support from our team for setup, troubleshooting, and guidance.</div>
                                    </div>
                                    <div className="details">
                                        <div className="name">Coding Support</div>
                                        <div className="des">Professional help for customizations, integrations, and technical issues.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="card-header">
                            <div className="left">
                                <div className="title">
                                    Documentation & Learning
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="support-wrapper">
                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">Official Documentation</div>
                                        <div className="des">Step-by-step guides for every MultiVendorX feature.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">YouTube Tutorials</div>
                                        <div className="des">Watch videos on marketplace setup, store management, payments, and more.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name">FAQs</div>
                                        <div className="des">Quick answers to the most common questions about features and troubleshooting.</div>
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