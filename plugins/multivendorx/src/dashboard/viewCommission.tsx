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
      title={__("Commission Details", "multivendorx")}
      open={open}
      onClose={onClose}
    >
      {loading && <p>{__("Loading...", "multivendorx")}</p>}
      {!loading && details && (
        <div className="commission-details">
          <p>
            <strong>{__("Store:", "multivendorx")}</strong> {details.storeName}
          </p>
          <p>
            <strong>{__("Order ID:", "multivendorx")}</strong> #{details.orderId}
          </p>
          <p>
            <strong>{__("Commission Earned:", "multivendorx")}</strong>{" "}
            {details.commissionAmount}
          </p>
          <p>
            <strong>{__("Commission Total:", "multivendorx")}</strong>{" "}
            {details.commissionTotal}
          </p>
          <p>
            <strong>{__("Shipping:", "multivendorx")}</strong>{" "}
            {details.shippingAmount || "-"}
          </p>
          <p>
            <strong>{__("Tax:", "multivendorx")}</strong>{" "}
            {details.taxAmount || "-"}
          </p>
          <p>
            <strong>{__("Discount:", "multivendorx")}</strong>{" "}
            {details.discountAmount || "-"}
          </p>
          <p>
            <strong>{__("Status:", "multivendorx")}</strong> {details.status}
          </p>
          <p>
            <strong>{__("Created:", "multivendorx")}</strong>{" "}
            {new Date(details.createTime).toLocaleString()}
          </p>
        </div>
      )}
    </CommonPopup>
  );
};

export default ViewCommission;
