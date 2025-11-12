import { AdminBreadcrumbs } from "zyra";

const HelpSupport: React.FC = () => {
    const videos = [
        {
            link: "https://www.youtube.com/watch?v=TL1HegIe0jE",
            title: "How to Set Up MultiVendorX Marketplace",
            des: "A step-by-step guide to setting up your multivendor marketplace."
        },
        {
            link: "https://www.youtube.com/watch?v=TL1HegIe0jE",
            title: "Vendor Dashboard Overview",
            des: "Learn everything about the vendor dashboard and features."
        },
        {
            link: "https://www.youtube.com/watch?v=TL1HegIe0jE",
            title: "Enable Vendor Subscriptions",
            des: "Understand how to set up subscription-based vendor plans."
        }
    ];
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
                                    Community & forums
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
                                        <div className="name"><a href="https://www.facebook.com/groups/multivendorxcommunity" target="_blank" rel="noopener noreferrer">Facebook community</a></div>
                                        <div className="des">Connect with other store owners, share tips, and get quick solutions.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name"><a href="https://wordpress.org/support/plugin/dc-woocommerce-multi-vendor/" target="_blank" rel="noopener noreferrer">WordPress support forum</a></div>
                                        <div className="des">Ask questions and get expert guidance from the WordPress community.</div>
                                    </div>
                                </div>
                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name"><a href="https://multivendorx.com/support-forum/" target="_blank" rel="noopener noreferrer">Our forum</a></div>
                                        <div className="des">Discuss MultiVendorX features, report issues, and collaborate with other users.</div>
                                    </div>
                                </div>
                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name"><a href="https://tawk.to/chat/5d2eebf19b94cd38bbe7c9ad/1fsg8cq8n" target="_blank" rel="noopener noreferrer">Live chat</a></div>
                                        <div className="des">Get real-time support from our team for setup, troubleshooting, and guidance.</div>
                                    </div>
                                    <div className="details">
                                        <div className="name"><a href="https://discord.com/channels/1376811097134469191/1376811102020829258" target="_blank" rel="noopener noreferrer">Coding support</a></div>
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
                                        <div className="name"><a href="https://multivendorx.com/docs/knowledgebase/" target="_blank" rel="noopener noreferrer">Official documentation</a></div>
                                        <div className="des">Step-by-step guides for every MultiVendorX feature.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name"><a href="https://www.youtube.com/@MultiVendorX/videos" target="_blank" rel="noopener noreferrer">YouTube tutorials</a></div>
                                        <div className="des">Watch videos on marketplace setup, store management, payments, and more.</div>
                                    </div>
                                </div>

                                <div className="support">
                                    <div className="image">
                                        <i className="adminlib-cart"></i>
                                    </div>
                                    <div className="details">
                                        <div className="name"><a href="https://multivendorx.com/docs/faqs/" target="_blank" rel="noopener noreferrer">FAQs</a></div>
                                        <div className="des">Quick answers to the most common questions about features and troubleshooting.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="column">
                        <div className="video-section">
                            <div className="details-wrapper">
                                <div className="title">
                                    Master MultiVendorX in minutes!
                                </div>
                                <div className="des">Watch our top tutorial videos and learn how to set up your marketplace, manage vendors, and enable subscriptions - all in just a few easy steps.</div>
                                <div className="admin-btn btn-purple"><a href="https://www.youtube.com/@MultiVendorX/videos" target="_blank" rel="noopener noreferrer">Watch All Tutorials</a></div>
                            </div>

                            <div className="video-section">
                                {videos.map((video, index) => {
                                    const videoId = new URL(video.link).searchParams.get("v");
                                    return (
                                        <div key={index} className="video-wrapper">
                                            <iframe
                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                title={video.title}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>

                                            <div className="title">{video.title}</div>
                                            <div className="des">{video.des}</div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

export default HelpSupport;