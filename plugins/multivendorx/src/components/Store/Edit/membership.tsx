const Membership = ({ id }: { id: string | null }) => {


    return (
        <>
            <div className="container-wrapper">
                <div className="card-wrapper w-65">
                    <div className="card-content">
                        <div className="form-group-wrapper">
                            <div className="description-wrapper">
                                <div className="title">
                                    <i className="adminlib-error"></i>
                                    Gold Plan
                                    <span className="admin-badge green">Active</span>
                                </div>
                                <div className="des">Renews on Dec 15, 2024</div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="card-wrapper w-35">

                </div>
            </div>
        </>
    );

}

export default Membership;