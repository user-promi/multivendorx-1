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
      width="500px"
      height="100%"
      header={
        <>
          <div className="title">
            <i className="adminlib-cart"></i>
            Commission Details
          </div>
          <p>Publish important news, updates, or alerts that appear directly in store dashboards, ensuring sellers never miss critical information.</p>
          <i
            className="icon adminlib-close"
            onClick={() => onClose}
          ></i>
        </>}
    >
      {loading && <p>{__("Loading...", "multivendorx")}</p>}
      {!loading && details && (
        <>
          <div className="content">
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Store:", "multivendorx")}</label>
                #{details.orderId}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Store Name:", "multivendorx")}</label>
                {details.storeName}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Order ID:", "multivendorx")}</label>
                {/* {details.storeName} */}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Commission Earned:", "multivendorx")}</label>
                {details.commissionAmount}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Commission Total:", "multivendorx")}</label>
                {details.commissionTotal}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Shipping:", "multivendorx")}</label>
                {details.shippingAmount || "-"}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Tax:", "multivendorx")}</label>
                {details.taxAmount || "-"}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Discount:", "multivendorx")}</label>
                {details.discountAmount || "-"}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Status:", "multivendorx")}</label>
                {details.status}
              </div>
            </div>
            <div className="form-group-wrapper">
              <div className="form-group">
                <label htmlFor="title">{__("Created:", "multivendorx")}</label>
                {new Date(details.createTime).toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}
    </CommonPopup>
  );
};

export default ViewCommission;
