type ButtonConfig = {
  icon?: string;
  text: string;
  onClick?: () => void;
  className?: string;
};

type AdminButtonProps = {
  buttons: ButtonConfig | ButtonConfig[]; // single or multiple buttons
  wrapperClass?: 'left' | 'right' | 'center'; // alignment class
};

const AdminButton: React.FC<AdminButtonProps> = ({ buttons, wrapperClass='' }) => {
  const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];

  const renderedButtons = buttonsArray.map((btn, index) => (
    <div
      key={index}
      className={`admin-btn ${btn.className ? `btn-${btn.className}` : ''}`}
      onClick={btn.onClick}
    >
      {btn.icon && <i className={`adminfont-${btn.icon}`}></i>}
      {btn.text}
    </div>
  ));

  const wrapperClasses = `buttons-wrapper ${wrapperClass ? ` ${wrapperClass}` : ''}`;

  return <div className={wrapperClasses}>{renderedButtons}</div>;
};

export default AdminButton;


// import React from "react";

// type ButtonConfig = {
//   icon?: string;
//   text: string;
//   onClick?: () => void;
//   className?: string;
//   disableMultipleClick?: boolean; // new optional flag, default is false
// };

// type AdminButtonProps = {
//   buttons: ButtonConfig | ButtonConfig[]; // single or multiple buttons
//   wrapperClass?: 'left' | 'right' | 'center'; // alignment class
// };

// const AdminButton: React.FC<AdminButtonProps> = ({ buttons, wrapperClass = '' }) => {
//   const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];
//   const [disabledState, setDisabledState] = React.useState<boolean[]>(
//     buttonsArray.map(() => false)
//   );

//   const handleClick = (btn: ButtonConfig, index: number) => {
//     if (btn.disableMultipleClick && disabledState[index]) {
//       return;
//     }

//     if (btn.disableMultipleClick) {
//       setDisabledState((prev) => {
//         const copy = [...prev];
//         copy[index] = true;
//         return copy;
//       });
//     }

//     btn.onClick?.();
//   };

//   const renderedButtons = buttonsArray.map((btn, index) => (
//     <div
//       key={index}
//       className={`admin-btn ${btn.className ? `btn-${btn.className}` : ''} ${disabledState[index] ? 'disabled' : ''}`}
//       onClick={() => handleClick(btn, index)}
//       style={{
//         pointerEvents: disabledState[index] ? 'none' : 'auto',
//         opacity: disabledState[index] ? 0.6 : 1,
//       }}
//     >
//       {btn.icon && <i className={`adminfont-${btn.icon}`}></i>}
//       {btn.text}
//     </div>
//   ));

//   const wrapperClasses = `buttons-wrapper${wrapperClass ? ` ${wrapperClass}` : ''}`;

//   return <div className={wrapperClasses}>{renderedButtons}</div>;
// };

// export default AdminButton;
