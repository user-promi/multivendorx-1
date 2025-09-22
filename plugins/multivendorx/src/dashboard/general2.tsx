const History: React.FC = () => {
    return (
        <>
            {/* page title start */}
            < div className="page-title-wrapper" >
                <div className="page-title">
                    <div className="title">
                        General
                    </div>
                </div>
            </div > {/* page title end */}
            <div className="tab-titles">
                            {tabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    className={`title ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <h2>{tab.label}</h2>
                                </div>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {tabs.map(
                                (tab) =>
                                    activeTab === tab.id && (
                                        <div key={tab.id} className="tab-panel">
                                            {tab.content}
                                        </div>
                                    )
                            )}
                        </div>
            <div className="container-wrapper">
                <div className="card-wrapper">
                    <div className="card-content">
                        <div className="card-title">General</div>

                    </div>
                </div>
            </div>
        </>
    )
};

export default History;