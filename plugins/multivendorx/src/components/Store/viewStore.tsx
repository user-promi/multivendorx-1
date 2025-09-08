import { Link, useLocation } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import "./viewStore.scss";
import "../AdminDashboard/adminDashboard.scss";
import BannerImg from '../../assets/images/banner-placeholder.jpg';
import { AdminBreadcrumbs, BasicInput, CommonPopup, getApiLink, SelectInput, TextArea } from 'zyra';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { __ } from '@wordpress/i18n';

const overviewData = [
  { name: 'Total Products', value: 18 },
  { name: 'Product sold', value: 6 },
  { name: 'Store Visitors', value: 42 },
  { name: 'Reviews', value: 9 },
];
type AnnouncementForm = {
  title: string;
  url: string;
  content: string;
  stores: string; // ✅ renamed vendors → stores
};
const ViewStore = () => {
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [storeOptions, setStoreOptions] = useState<{ value: string; label: string }[]>([]);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [addAnnouncements, setAddAnnouncements] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: '',
    url: '',
    content: '',
    stores: '',
  });
  const location = useLocation();
  const hash = location.hash.replace(/^#/, '');

  // Turn hash into a URLSearchParams object
  const params = new URLSearchParams(hash);

  // Extract `id`
  const viewId = params.get('id');
  // Handle form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleCloseForm = () => {
    setAddAnnouncements(false);
    setFormData({ title: '', url: '', content: '', stores: '' }); // reset form
    setError(null); // clear any error
  };
  const handleSubmit = async () => {
    if (submitting) return; // prevent double-click

    try {
      setSubmitting(true);

      const endpoint = getApiLink(appLocalizer, 'announcement'); // always POST
      const method = 'POST';

      const payload = {
        ...formData,
        stores: viewId ? [viewId] : [],
      };

      const response = await axios({
        method,
        url: endpoint,
        headers: { 'X-WP-Nonce': appLocalizer.nonce },
        data: payload,
      });

      if (response.data.success) {
        setAddAnnouncements(false);
        setFormData({ title: '', url: '', content: '', stores: '' });
      } else {
        setError(__('Failed to save announcement', 'multivendorx'));
      }
    } catch (err) {
      setError(__('Failed to save announcement', 'multivendorx'));
    } finally {
      setSubmitting(false);
    }
  };


  useEffect(() => {
    if (!viewId) return;

    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, `store/${viewId}`),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
    })
      .then((res: any) => {
        const data = res.data || {};
        setData(data);
      })
    axios({
      method: 'GET',
      url: getApiLink(appLocalizer, 'store'),
      headers: { 'X-WP-Nonce': appLocalizer.nonce },
    })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          const options = response.data.map((store: any) => ({
            value: store.id.toString(),
            label: store.store_name,
          }));
          setStoreOptions(options);
        }

      })
      .catch(() => {
        setError(__('Failed to load stores', 'multivendorx'));
      });
  }, [viewId]);

  const COLORS = ['#4CAF50', '#FF9800', '#F44336', '#2196F3'];
  return (
    <>
      <AdminBreadcrumbs
        activeTabIcon="adminlib-storefront"
        tabTitle={'Viewing ' + data.name}
        description={data.description}
        buttons={[
          {
            label: 'Back',
            onClick: () => window.location.assign('?page=multivendorx#&tab=stores'),
            className: 'admin-btn btn-purple'
          }
        ]}
      />

      <div className="store-view-wrapper">
        <div className="store-header row">
          <div className="column profile-section">
            <span className="avater"><img src={data.image} /></span>
            <div className="name">{data.name}</div>
            <div className="des">{data.description}</div>
            <div className="details">
              <i className="adminlib-form-phone"></i>
              {data.phone}
            </div>
            <div className="details">
              <i className="adminlib-mail"></i>
              {data.email}
            </div>
            <div className="review">
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
              <i className="adminlib-star"></i>
            </div>
            <div className="buttons">
              <a onClick={() => setAddAnnouncements(true)} className="admin-btn btn-purple"><i className="adminlib-mail"></i> Send Mail</a>
              {addAnnouncements && (
                <CommonPopup
                  open={addAnnouncements}
                  onClose={handleCloseForm}
                  width="500px"
                  header={
                    <>
                      <div className="title">
                        <i className="adminlib-cart"></i>
                        {__('Add Announcement', 'multivendorx')}
                      </div>
                      <p>{__('Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.', 'multivendorx')}</p>
                      <i
                        onClick={handleCloseForm}
                        className="icon adminlib-close"
                      ></i>
                    </>
                  }
                  footer={
                    <>
                      <div
                        onClick={handleCloseForm}
                        className="admin-btn btn-red"
                      >
                        Cancel
                      </div>
                      <div
                        onClick={!submitting ? handleSubmit : undefined}
                        className={`admin-btn btn-purple ${submitting ? 'disabled' : ''}`}
                        style={{ opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? 'none' : 'auto' }}
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                      </div>

                    </>
                  }
                >

                  <div className="content">
                    <div className="form-group-wrapper">
                      <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <BasicInput
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="content">Enter Content</label>
                        <TextArea
                          name="content"
                          inputClass="textarea-input"
                          value={formData.content}
                          onChange={handleChange}
                        />
                      </div>

                    </div>
                  </div>

                  {error && <p className="error-text">{error}</p>}
                </CommonPopup>
              )}
            </div>
          </div>

          <div
            className="column store-image"
            style={{ backgroundImage: `url(${data.banner})` }}
          >
            {/* <img src="https://res.cloudinary.com/walden-global-services/image/upload/v1544584558/dandelion/29.jpg" alt="" /> */}
          </div>

        </div>

        <div className="row">
          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>Lifetime Earnings</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>47,892</span>
                  <a href="#">View Full Earnings</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>Settled Payments</div>
                <span className="text-green">+16.24%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$184</span>
                  <a href="?page=multivendorx#&tab=payouts">Check Paid History</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>Awaiting Payout</div>
                <span className="text-red">-8.54%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$7,892</span>
                  <a href="?page=multivendorx#&tab=payouts">See What’s Due</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>

          <div className="column">
            <div className="cards">
              <div className="title-wrapper">
                <div>Requested Payout</div>
                <span className="">+0.00%</span>
              </div>
              <div className="card-body">
                <div className="value">
                  <span>$3892</span>
                  <a href="?page=multivendorx#&tab=transactions-history">Track Withdrawal Request</a>
                </div>
                <span className="icon">
                  <i className="adminlib-dynamic-pricing"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="row">

          <div className="column">
            <h3>Recent Activity</h3>

            <div className="activity-wrapper">
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-cart"></i>
                </span>
                <div className="details">
                  New product "Wireless Gaming Headset" added by TechWorld
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-star"></i>
                </span>
                <div className="details">
                  5-star review received for "Smartphone Case" by MobileGear
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-global-community"></i>
                </span>
                <div className="details">

                  New vendor "Fashion Forward" completed registration
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity">
                <span className="icon">
                  <i className="adminlib-cart"></i>
                </span>
                <div className="details">
                  Commission payment of $2,847 processed for ElectroHub
                  <span>2 minutes ago</span>
                </div>
              </div>
            </div>

          </div>

          <div className="column ">
            <div className="chart-box">
              <h3>Products</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={overviewData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label
                  >
                    {overviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};

export default ViewStore;
