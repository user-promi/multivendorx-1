import React, { useState, useEffect, useRef } from 'react';
import { BasicInput, CommonPopup, MultiCheckBox, PaymentTabsComponent, Table, TableCell, TextArea } from 'zyra';
import { __ } from '@wordpress/i18n';

const Withdrawl: React.FC = () => {
  let settingChanged = false;
  const paymentTabsData = {
    key: "payment_methods",
    type: "payment-tabs",
    modal: [
      {
        id: "id-verification",
        // icon: payPal,
        label: "Identity Verification",
        connected: false,
        desc: "Verify user identity using government-issued documents or facial recognition. Ensures authenticity of users.",
        wrapperClass: "add-method",
        formFields: [
          {
            key: "verification_methods",
            type: "verification-methods",
            label: "Verification Methods",
            addButtonLabel: "Add New Method",
            deleteButtonLabel: "Remove",
            nestedFields: [
              { key: "label", type: "text", label: "Label", placeholder: "Enter label" },
              { key: "required", type: "checkbox", label: "Required" },
              { key: "active", type: "checkbox", label: "Active" },
            ],
          },
        ],
      },
      {
        id: "email-verification",
        // icon: email,
        label: "Email Verification",
        connected: true,
        desc: "Verify user email addresses to prevent fake registrations and enhance security.",
        formFields: [
          {
            key: "registration_notice",
            label: __("Registration Notice", "multivendorx"),
            desc: __("This message will be displayed on the registration page.", "multivendorx"),
            type: "textarea",
            class: "mvx-setting-textarea",
          },
          {
            key: "login_notice",
            label: __("Login Notice", "multivendorx"),
            desc: __("This message will be shown on the login page.", "multivendorx"),
            type: "textarea",
            class: "mvx-setting-textarea",
          },
        ],
      },
      {
        id: "social-verification",
        // icon: social,
        label: "Social Verification",
        connected: true,
        desc: "Verify user email addresses to prevent fake registrations and enhance security.",
        wrapperClass: "social-verification",
        formFields: [
          {
            key: "payment_methods",
            type: "payment-tabs",
            modal: [
              {
                id: "google-connect",
                // icon: google,
                label: "Google Connect",
                connected: false,
                desc: "Connect and authenticate users via Google accounts.",
                formFields: [
                  { key: "client_id", type: "text", label: "Google Client ID", placeholder: "Enter Google Client ID" },
                  { key: "client_secret", type: "password", label: "Google Client Secret", placeholder: "Enter Google Client Secret" },
                  { key: "redirect_uri", type: "text", label: "Redirect URI", placeholder: "Enter Redirect URI" },
                ],
              },
              {
                id: "twitter-connect",
                // icon: twitter,
                label: "Twitter Connect",
                connected: false,
                desc: "Connect and authenticate users via Twitter accounts.",
                formFields: [
                  { key: "api_key", type: "text", label: "Twitter API Key", placeholder: "Enter Twitter API Key" },
                  { key: "api_secret_key", type: "password", label: "Twitter API Secret Key", placeholder: "Enter Twitter API Secret Key" },
                  { key: "bearer_token", type: "text", label: "Bearer Token", placeholder: "Enter Bearer Token" },
                ],
              },
              {
                id: "facebook-connect",
                // icon: facebook,
                label: "Facebook Connect",
                connected: false,
                desc: "Connect and authenticate users via Facebook accounts.",
                formFields: [
                  { key: "app_id", type: "text", label: "Facebook App ID", placeholder: "Enter Facebook App ID" },
                  { key: "app_secret", type: "password", label: "Facebook App Secret", placeholder: "Enter Facebook App Secret" },
                ],
              },
              {
                id: "linkedin-connect",
                // icon: LinkedIn,
                label: "LinkedIn Connect",
                connected: false,
                desc: "Connect and authenticate users via LinkedIn accounts.",
                formFields: [
                  { key: "client_id", type: "text", label: "LinkedIn Client ID", placeholder: "Enter LinkedIn Client ID" },
                  { key: "client_secret", type: "password", label: "LinkedIn Client Secret", placeholder: "Enter LinkedIn Client Secret" },
                  { key: "redirect_uri", type: "text", label: "Redirect URI", placeholder: "Enter Redirect URI" },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <>

      <div className="container-wrapper">
        <div className="card-wrapper width-65">
          <div className="card-content">
            <div className="card-title">Payment Method</div>
            <PaymentTabsComponent
              key={paymentTabsData.key}
              name={paymentTabsData.key}
              proSettingChanged={() => console.log("proSettingChanged")}
              apilink="/api/payment"
              appLocalizer={{}}
              methods={paymentTabsData.modal}
              buttonEnable={true}
              value={{}}
              onChange={(data) => {
                settingChanged = true; // just sets the static variable
                console.log("Updated Data:", data);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Withdrawl;
