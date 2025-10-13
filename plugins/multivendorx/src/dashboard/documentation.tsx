import React, { useState } from 'react';
import { CommonPopup } from 'zyra';

type DocumentItem = {
    id: number;
    title: string;
    icon: string;
    description: string;
};

const documentsData: DocumentItem[] = [
    {
        id: 1,
        title: 'Store Opening Procedures',
        icon: 'adminlib-contact-form',
        description: `Complete guide for opening the store including checklist, security protocols, and system startup procedures.`,
    },
    {
        id: 2,
        title: 'Data Protection Guidelines',
        icon: 'adminlib-contact-form',
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam vehicula, massa in blandit suscipit, purus leo ultricies urna, a pretium mauris lectus at sapien.`,
    },
    {
        id: 3,
        title: 'Customer Return Policy',
        icon: 'adminlib-contact-form',
        description: `Detailed information about handling customer returns, exchanges, and refund processes. Ensure all staff are aware of the policy and procedures.`,
    },
    {
        id: 4,
        title: 'Inventory Management Guidelines',
        icon: 'adminlib-contact-form',
        description: `Best practices for stock counting, replenishment, and inventory tracking in the system. Maintain accuracy for reporting and operational efficiency.`,
    },
    {
        id: 5,
        title: 'POS System Troubleshooting',
        icon: 'adminlib-contact-form',
        description: `Common issues with the point of sale system and step-by-step solutions for resolving them. Includes login errors, payment issues, and network problems.`,
    },
    {
        id: 6,
        title: 'Safety and Emergency Protocols',
        icon: 'adminlib-contact-form',
        description: `Emergency procedures, evacuation plans, and safety guidelines for store staff. Important for ensuring employee safety and regulatory compliance.`,
    },
    {
        id: 7,
        title: 'Handling Customer Complaints',
        icon: 'adminlib-contact-form',
        description: `Step-by-step guide to de-escalate situations and resolve customer complaints effectively. Focus on maintaining customer satisfaction and loyalty.`,
    },
    {
        id: 8,
        title: 'Cash Register Procedures',
        icon: 'adminlib-contact-form',
        description: `Daily cash handling, opening and closing registers, and cash reconciliation processes. Ensures accountability and prevents discrepancies.`,
    },
    {
        id: 9,
        title: 'Product Display Standards',
        icon: 'adminlib-contact-form',
        description: `Guidelines for merchandising, product placement, and maintaining visual standards. Helps in creating an attractive shopping environment.`,
    },
    {
        id: 10,
        title: 'Staff Training Manuals',
        icon: 'adminlib-contact-form',
        description: `Comprehensive manuals for training staff on operations, customer service, and safety procedures. Ensures consistent performance across employees.`,
    },
];

const Documentation: React.FC = () => {
    const [popupOpen, setPopupOpen] = useState(false);
    const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(null);
    const [searchText, setSearchText] = useState('');

    const handleReadMore = (doc: DocumentItem) => {
        setActiveDocument(doc);
        setPopupOpen(true);
    };

    const truncateText = (text: string, wordCount: number) => {
        const words = text.split(' ');
        if (words.length <= wordCount) return text;
        return words.slice(0, wordCount).join(' ') + '...';
    };

    const filteredDocuments = documentsData.filter(
        (doc) =>
            doc.title.toLowerCase().includes(searchText.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <>
            <div className="page-title-wrapper">
                <div className="page-title">
                    <div className="title">Documentation</div>
                    <div className="des">Everything you need to know about store operations</div>
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search documents..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="basic-input"
                        />
                    </div>

                    <div className="documentation-wrapper">
                        {filteredDocuments.length === 0 && (
                            <p className="no-results">No documents found.</p>
                        )}

                        {filteredDocuments.map((doc) => (
                            <div key={doc.id} className="document">
                                <div className="document-icon">
                                    <i className={doc.icon}></i>
                                </div>
                                <div className="document-content">
                                    <div className="title">{doc.title}</div>
                                    <div className="description">
                                        {truncateText(doc.description, 10)}
                                        {doc.description.split(' ').length > 10 && (
                                            <a
                                                className="read-more"
                                                onClick={() => handleReadMore(doc)}
                                            >
                                                Read More
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {activeDocument && (
                <CommonPopup
                    open={popupOpen}
                    // onClose= setAddCoupon(true)
                    width="500px"
                    height="50%"
                    header={
                        <>
                            <div className="title">
                                 <i className={activeDocument.icon}></i>
                                {activeDocument.title}
                            </div>
                            
                            <i
                                className="icon adminlib-close"
                                 onClick={() => setPopupOpen(false)}
                            ></i>
                        </>
                    }
                    footer={
                        <div className="admin-btn btn-purple" onClick={() => setPopupOpen(false)}>
                            Close
                        </div>
                    }
                >

                    <div className="content">
                        <div className="document-popup-wrapper">
                        {activeDocument.description}
                        </div>
                    </div>

                    {/* {error && <p className="error-text">{error}</p>} */}
                </CommonPopup>
            )}
        </>
    );
};

export default Documentation;
