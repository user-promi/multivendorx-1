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

const AdminButton: React.FC<AdminButtonProps> = ({ buttons, wrapperClass }) => {
  const buttonsArray = Array.isArray(buttons) ? buttons : [buttons];

  const renderedButtons = buttonsArray.map((btn, index) => (
    <button
      key={index}
      className={`admin-btn ${btn.className ? `btn-${btn.className}` : ''}`}
      onClick={btn.onClick}
    >
      {btn.icon && <i className={`adminlib-${btn.icon}`}></i>}
      {btn.text}
    </button>
  ));

  // Default wrapper class + optional alignment
  const wrapperClasses = `buttons-wrapper ${wrapperClass ? ` ${wrapperClass}` : ''}`;

  return <div className={wrapperClasses}>{renderedButtons}</div>;
};

export default AdminButton;
