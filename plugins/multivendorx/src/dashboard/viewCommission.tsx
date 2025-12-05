/* global appLocalizer */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { __ } from "@wordpress/i18n";
import { CommonPopup, getApiLink } from "zyra";

type ViewCommissionProps = {
  open: boolean;
  onClose: () => void;
  commissionId: number;
};

type CommissionDetails = {
  id: number;
  storeName: string;
  orderId: number;
  commissionAmount: string;
  commissionTotal: string;
  shippingAmount?: string;
  taxAmount?: string;
  discountAmount?: string;
  status: string;
  createTime: string;
};

const ViewCommission: React.FC<ViewCommissionProps> = ({
  open,
  onClose,
  commissionId,
}) => {
  const [details, setDetails] = useState<CommissionDetails | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!commissionId) return;

    setLoading(true);
    axios({
      method: "GET",
      url: getApiLink(appLocalizer, `commission/${commissionId}`),
      headers: { "X-WP-Nonce": appLocalizer.nonce },
    })
      .then((res) => {
        setDetails(res.data);
      })
      .catch(() => {
        setDetails(null);
      })
      .finally(() => setLoading(false));
  }, [commissionId]);

  if (!open) return null;

  return (
    <CommonPopup
      open={open}
      onClose={onClose}
      width="31.25rem"
      height="100%"
      header={
        <>
          <div className="title">
            <i className="adminlib-commission"></i>
            {__("Commission Details", "multivendorx")}
          </div>
          <p>{__("Details of this commission, including the order breakdown and notes.", "multivendorx")}</p>
          <i
            className="icon adminlib-close"
            onClick={onClose}
          ></i>
        </>
      }
    >
      {loading && <p>{__("Loading...", "multivendorx")}</p>}

      {!loading && details && (
        <>
          <div className="heading">{__("Order Overview", "multivendorx")}</div>

          <div className="commission-details">
            <div className="items">
              <div className="text">{__("Store", "multivendorx")}</div>
              <div className="value">#{details.orderId}</div>
            </div>
            <div className="items">
              <div className="text">{__("Order ID", "multivendorx")}</div>
              <div className="value">#52</div>
            </div>
            <div className="items">
              <div className="text">{__("Status", "multivendorx")}</div>
              <div className="value">
                <span className={`admin-badge ${details.status === 'paid' ? 'green' : 'red'}`}>
                  {details.status
                    ? details.status
                      .replace(/^wc-/, '') // remove prefix like 'wc-'
                      .replace(/_/g, ' ')  // replace underscores with spaces
                      .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize words
                    : ''}
                </span>
              </div>
            </div>
            <div className="items">
              <div className="text">{__("Created", "multivendorx")}</div>
              <div className="value">{new Date(details.createTime).toLocaleString()}</div>
            </div>
          </div>

          <div className="popup-divider"></div>
          <div className="heading">{__("Commission Overview", "multivendorx")}</div>

          <div className="commission-details">
            <div className="items">
              <div className="text">{__("Commission Earned", "multivendorx")}</div>
              <div className="value">{details.commissionAmount}</div>
            </div>
            <div className="items">
              <div className="text">{__("Commission Total", "multivendorx")}</div>
              <div className="value">{details.commissionTotal}</div>
            </div>
            <div className="items">
              <div className="text">{__("Shipping", "multivendorx")}</div>
              <div className="value">{details.shippingAmount || "-"}</div>
            </div>
            <div className="items">
              <div className="text">{__("Tax", "multivendorx")}</div>
              <div className="value">{details.taxAmount || "-"}</div>
            </div>
            <div className="items">
              <div className="text">{__("Discount", "multivendorx")}</div>
              <div className="value">{details.discountAmount || "-"}</div>
            </div>
          </div>
        </>
      )}
    </CommonPopup>

  );
};

export default ViewCommission;
