import React from "react";

type Product = {
  id: number;
  title: string;
  sold: number;
  price: string;
  image: string;
};

const products: Product[] = [
  {
    id: 1,
    title: "Citrus Bloom",
    sold: 3,
    price: "$380",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/headphones.png",
  },
  {
    id: 2,
    title: "Leather Backpack",
    sold: 5,
    price: "$120",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/apple-watch.png",
  },
  {
    id: 3,
    title: "Smart Watch",
    sold: 2,
    price: "$220",
    image: "https://demos.pixinvent.com/vuexy-html-admin-template/assets/img/products/play-station.png",
  },
];
const Leaders: React.FC = () => {
    return (
        <div className="dashboard-overview">
            <div className="row">
                <div className="column">
                    <h3>Top Vendors</h3>
                    <div className="top-items">
                        <div className="items">
                            <div className="left-side">
                                <div className="icon">
                                    <i className="adminlib-pro-tag admin-icon red"></i>
                                </div>
                                <div className="details">
                                    <div className="item-title">Lather & Loom</div>
                                    <div className="sub-text">3 orders</div>
                                </div>
                            </div>
                            <div className="right-side">
                                <div className="price">$380</div>
                            </div>
                        </div>
                        <div className="items">
                            <div className="left-side">
                                <div className="icon">
                                    <i className="adminlib-pro-tag admin-icon green"></i>
                                </div>
                                <div className="details">
                                    <div className="item-title">Lather & Loom</div>
                                    <div className="sub-text">3 orders</div>
                                </div>
                            </div>
                            <div className="right-side">
                                <div className="price">$380</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="column">
                    <h3>Top Products</h3>
                    <div className="top-items">
                        {products.map((product) => (
                            <div className="items" key={product.id}>
                                <div className="left-side">
                                    <div className="image">
                                        <img src={product.image} alt={product.title} />
                                    </div>
                                    <div className="details">
                                        <div className="item-title">{product.title}</div>
                                        <div className="sub-text">{product.sold} sold</div>
                                    </div>
                                </div>
                                <div className="right-side">
                                    <div className="price">{product.price}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <h3>Recent Activity</h3>
                    <div className="top-items">
                        {products.map((product) => (
                            <div className="items" key={product.id}>
                                <div className="left-side">
                                    <div className="details">
                                        <div className="item-title">New order #23530</div>
                                    </div>
                                </div>
                                <div className="right-side">
                                    <div className="price">+$308</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="column">
                    <h3>Commission</h3>
                    <div className="top-items">
                        {products.map((product) => (
                            <div className="items" key={product.id}>
                                <div className="left-side">
                                    <div className="details">
                                        <div className="item-title">Admin</div>
                                    </div>
                                </div>
                                <div className="right-side">
                                    <div className="price">$308</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Leaders;
