/* global appLocalizer */
import React, { useEffect, useState } from "react";
import { __ } from "@wordpress/i18n";
import { CommonPopup, getApiLink } from "zyra";
import axios from "axios";

interface QnaItem {
  id: number;
  product_id: number;
  product_name: string;
  product_link: string;
  product_image: string; // ✅ added
  question_text: string;
  answer_text: string | null;
  question_by: number;
  author_name: string;
  question_date: string;
  time_ago: string;
  total_votes: number;
  question_visibility: string;
}

interface EditQnaProps {
  open: boolean;
  onClose: () => void;
  qnaId?: number | null;
  onUpdated?: () => void;
}

const EditQna: React.FC<EditQnaProps> = ({ open, onClose, qnaId, onUpdated }) => {
  const [qna, setQna] = useState<QnaItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch QnA details
  useEffect(() => {
    if (qnaId) {
      axios({
        method: "GET",
        url: getApiLink(appLocalizer, `qna/${qnaId}`),
        headers: { "X-WP-Nonce": appLocalizer.nonce },
      })
        .then((res) => {
          setQna(res.data || null);
        })
        .catch(() => setQna(null));
    }
  }, [qnaId]);

  // Save Answer + Visibility
  const handleSave = () => {
    if (!qna) return;
    setSaving(true);

    axios({
      method: "PUT",
      url: getApiLink(appLocalizer, `qna/${qna.id}`),
      headers: { "X-WP-Nonce": appLocalizer.nonce },
      data: {
        answer_text: qna.answer_text,
        question_visibility: qna.question_visibility,
      },
    })
      .then(() => {
        setSaving(false);
        onClose();
        if (onUpdated) onUpdated();
      })
      .catch(() => setSaving(false));
  };

  return (
    <CommonPopup
      open={open}
      onClose={onClose}
      width="800px"
      height="100%"
      header={
        <>
          <div className="title">
            <i className="adminlib-comment"></i>
            {__("Edit Question", "multivendorx")} {qna ? `#${qna.id}` : ""}
          </div>
          <p>{__("Update the answer or change visibility of this question.", "multivendorx")}</p>
          <i onClick={onClose} className="icon adminlib-close"></i>
        </>
      }
      footer={
        <>
          <div onClick={onClose} className="admin-btn btn-red">
            {__("Cancel", "multivendorx")}
          </div>
          <div onClick={handleSave} className="admin-btn btn-green">
            {saving ? __("Saving...", "multivendorx") : __("Save", "multivendorx")}
          </div>
        </>
      }
    >
      {qna ? (
        <div className="content multi">
          {/* Left: Product & Question */}
          <div className="section left">
            {/* Product */}
            <div className="heading">{__("Product Details", "multivendorx")}</div>
            <div className="vendor-details">
              {qna.product_image && (
                <div className="product-thumb">
                  <img
                    src={qna.product_image}
                    alt={qna.product_name}
                    style={{ maxWidth: "80px", borderRadius: "6px", marginBottom: "8px" }}
                  />
                </div>
              )}
              <div className="name">
                <a href={qna.product_link} target="_blank" rel="noreferrer">
                  {qna.product_name}
                </a>
              </div>
              <div className="details">
                <b>{__("Product ID", "multivendorx")}:</b> {qna.product_id}
              </div>
            </div>

            <div className="popup-divider"></div>

            {/* Question */}
            <div className="heading">{__("Question", "multivendorx")}</div>
            <div className="settings-metabox-note">
              <i className="adminlib-help"></i>
              <p>
                <b>Q:</b> {qna.question_text}
              </p>
            </div>

            {/* Answer (editable) */}
            <div className="heading">{__("Answer", "multivendorx")}</div>
            <textarea
              value={qna.answer_text || ""}
              onChange={(e) => setQna({ ...qna, answer_text: e.target.value })}
              placeholder={__("Type your answer here...", "multivendorx")}
              rows={4}
              style={{ width: "100%" }}
            />
          </div>

          {/* Right: Meta Info & Visibility */}
          <div className="section right">
            <div className="heading">{__("Question Overview", "multivendorx")}</div>
            <div className="commission-details">
              <div className="items">
                <div className="text">{__("Asked By", "multivendorx")}</div>
                <div className="value">{qna.author_name}</div>
              </div>
              <div className="items">
                <div className="text">{__("Date", "multivendorx")}</div>
                <div className="value">{qna.question_date}</div>
              </div>
              <div className="items">
                <div className="text">{__("Time Ago", "multivendorx")}</div>
                <div className="value">{qna.time_ago}</div>
              </div>
              <div className="items">
                <div className="text">{__("Votes", "multivendorx")}</div>
                <div className="value">{qna.total_votes}</div>
              </div>
              {/* Visibility */}
              <div className="items">
                <div className="text">{__("Visibility", "multivendorx")}</div>
                <div className="value">
                  <select
                    value={qna.question_visibility}
                    onChange={(e) =>
                      setQna({ ...qna, question_visibility: e.target.value })
                    }
                  >
                    <option value="public">{__("Public", "multivendorx")}</option>
                    <option value="private">{__("Private", "multivendorx")}</option>
                    <option value="hidden">{__("Hidden", "multivendorx")}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading">{__("Loading...", "multivendorx")}</div>
      )}
    </CommonPopup>
  );
};

export default EditQna;
