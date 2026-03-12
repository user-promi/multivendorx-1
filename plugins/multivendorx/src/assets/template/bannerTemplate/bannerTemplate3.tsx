const BannerTemplate3 = () => {
    return (
        <div className="banner-template-3">
            <div >
                <h3 >Shop by Category</h3>
                <span >View All →</span>
            </div>

            <div >
                {['Electronics', 'Fashion', 'Home'].map((category, index) => (
                    <div key={index} >
                        <div>
                            {index === 0 ? '📱' : index === 1 ? '👕' : '🏠'}
                        </div>
                        <div >{category}</div>
                        <div >
                            {index === 0 ? '250+' : index === 1 ? '500+' : '180+'} items
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <span >Special Launch Offer</span>
                <span >SAVE20</span>
            </div>
        </div>
    );
};

export default BannerTemplate3;