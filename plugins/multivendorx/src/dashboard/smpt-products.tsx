
const SmptProducts: React.FC = () => {

    return (
        <>
            <div className="product-category-select-wrapper">
                <div className="title">Select a category from the list</div>
                <div className="search-section-wrapper">
                    <div className="search-field">
                        <div className="search-section">
                            <input
                                type="text"
                                placeholder="Search Settings"
                                className="basic-input"
                            // value={query}
                            // onChange={(e) => onSearchChange(e.target.value)}
                            />
                            <i className="adminlib-search"></i>
                        </div>
                    </div>
                </div>
                <div className="product-wrapper">
                    <div className="category">
                        <i className="product-icon adminlib-cart"></i>
                        <div className="name">Product 1</div>
                        <div className="price">$299</div>
                        <div className="overley"><i className="adminlib-plus-circle-o"></i></div>
                    </div>
                    <div className="category">
                        <i className="product-icon adminlib-cart"></i>
                        <div className="name">Product 2</div>
                        <div className="price">$299</div>
                        <div className="overley"><i className="adminlib-plus-circle-o"></i></div>
                    </div>
                    <div className="category">
                        <i className="product-icon adminlib-cart"></i>
                        <div className="name">Product 3</div>
                        <div className="price">$299</div>
                        <div className="overley"><i className="adminlib-plus-circle-o"></i></div>
                    </div>
                    <div className="category">
                        <i className="product-icon adminlib-cart"></i>
                        <div className="name">Product 4</div>
                        <div className="price">$299</div>
                        <div className="overley"><i className="adminlib-plus-circle-o"></i></div>
                    </div>
                    <div className="category">
                        <i className="product-icon adminlib-cart"></i>
                        <div className="name">Product 5</div>
                        <div className="price">$299</div>
                        <div className="overley"><i className="adminlib-plus-circle-o"></i></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SmptProducts;
