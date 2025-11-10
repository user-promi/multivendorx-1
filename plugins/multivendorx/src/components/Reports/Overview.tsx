import React, { useEffect, useState } from "react";
import { __ } from '@wordpress/i18n';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Stat = {
  id: string | number;
  count: number | string;
  icon: string;
  label: string;
};
type Product = {
  id: number;
  title: string;
  price: string;
};
type OverviewProps = {
  overview: Stat[];
  data: { month: string; revenue: number; net_sale: number; admin_amount: number }[];
  overviewData: { name: string; orders: number; sold_out: number }[];
  pieData: { name: string; value: number }[];
  COLORS?: string[];
};

const products: Product[] = [
  {
    id: 1,
    title: "Admin Net Earning",
    price: "$5,072.31",
  },
  {
    id: 1,
    title: "Store Net Earning",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Shipping",
    price: "$75",
  },
  {
    id: 1,
    title: "Tax",
    price: "$1,713.85",
  },
  {
    id: 1,
    title: "Total",
    price: "$855552",
  },
];

const Overview: React.FC<OverviewProps> = ({
  overview,
  data,
  overviewData,
  pieData,
  COLORS = ["#5007aa", "#00c49f", "#ff7300", "#d400ffff", "#004ec4ff"],
}) => {
  const salesByLocations = [
    { name: "USA", coordinates: [40, -100], sales: 12000 },
    { name: "India", coordinates: [22, 78], sales: 8500 },
    { name: "UK", coordinates: [54, -2], sales: 6700 },
    { name: "Germany", coordinates: [51, 10], sales: 5400 },
    { name: "Australia", coordinates: [-25, 133], sales: 4300 },
  ];
  const salesIcon = new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background:#5007aa;color:#fff;border-radius:50%;padding:6px 0.625rem;font-size:0.75rem;">$</div>`,
  });

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);
      const response = await axios({
        method: "GET",
        url: `${appLocalizer.apiUrl}/wc-analytics/leaderboards`,
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      });
      setLeaderboard(response.data || []);
    } catch (err: any) {
      setError("Failed to fetch leaderboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, []);


  return (
    <>
      <div className="row">
        <div className="column w-65">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Account Overview
              </div>
            </div>
            <div className="right">
              <span>Updated 1 month ago</span>
            </div>
          </div>
          <div className="card-body">
            <div className="analytics-container">
              {overview.map((item, idx) => (
                <div key={idx} className="analytics-item">
                  <div className="analytics-icon">
                    <i className={item.icon}></i>
                  </div>
                  <div className="details">
                    <div className="number">{item.count}</div>
                    <div className="text">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="column w-35">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue breakdown
              </div>
            </div>
          </div>
          <div className="top-items">
            {products.map((product) => (
              <div className="items" key={product.id}>
                <div className="left-side">
                  <div className="details">
                    <div className="item-title">{product.title}</div>
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
        <div className="column w-65">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Revenue trade
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#5007aa" strokeWidth={3} name="Top Category" />
              <Line type="monotone" dataKey="net_sale" stroke="#ff7300" strokeWidth={3} name="Top Brand" />
              <Line type="monotone" dataKey="admin_amount" stroke="#00c49f" strokeWidth={3} name="Top Store" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="column w-35">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Sales by Locations
              </div>
            </div>
          </div>
          <MapContainer
            center={[20, 0]}
            zoom={2}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {salesByLocations.map(({ name, coordinates, sales }) => (
              <Marker
                key={name}
                position={coordinates as [number, number]}
                icon={salesIcon}
              >
                <Popup>
                  <strong>{name}</strong>
                  <br />
                  Sales: ${sales}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
      <div className="row">
        {leaderboard.map((section: any, sectionIndex: number) => (
          <div className="column" key={sectionIndex}>
            <div className="card-header">
              <div className="left">
                <div className="title">{section.label}</div>
              </div>
            </div>

            <div className="top-items">
              {section.rows?.length ? (
                section.rows.map((row: any, rowIndex: number) => (
                  <div className="items" key={rowIndex}>
                    <div className="left-side">
                      <div className="icon">
                        <i
                          className={`adminlib-pro-tag admin-icon ${rowIndex % 2 === 0 ? "red" : "green"
                            }`}
                        ></i>
                      </div>
                      <div className="details">
                        <div
                          className="item-title"
                          dangerouslySetInnerHTML={{
                            __html: row[0].display.trim()
                              ? row[0].display
                              : `<a href="#">Customer</a>`, // fallback text
                          }}
                        />
                        <div className="sub-text">
                          {row[1].value} {row[1].label || "orders"}
                        </div>
                      </div>
                    </div>
                    <div className="right-side">
                      <div
                        className="price"
                        dangerouslySetInnerHTML={{ __html: row[2].display }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="items">
                  <div className="left-side">
                    <div className="details">
                      <div className="item-title">No data</div>
                      <div className="sub-text">0 orders</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}


        <div className="column">
          <div className="card-header">
            <div className="left">
              <div className="title">
                Top Store
              </div>
            </div>
          </div>
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
      </div>
    </>
  );
};

export default Overview;
