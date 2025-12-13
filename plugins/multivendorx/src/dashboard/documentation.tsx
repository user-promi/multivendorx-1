import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { CommonPopup, getApiLink } from 'zyra';
import { __ } from '@wordpress/i18n';

type DocumentItem = {
	id: number;
	title: string;
	content?: string;
	description?: string;
	icon?: string;
	date?: string;
	status?: string;
};

const Documentation: React.FC = () => {
	const [data, setData] = useState<DocumentItem[]>([]);
	const [popupOpen, setPopupOpen] = useState(false);
	const [activeDocument, setActiveDocument] = useState<DocumentItem | null>(
		null
	);
	const [searchText, setSearchText] = useState('');

	function requestData() {
		setData([]);
		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, 'knowledge'),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			params: {
				status: 'publish',
			},
		})
			.then((response) => {
				// response.data.items = array of docs from API
				const apiData = response.data.items || [];
				setData(apiData);
			})
			.catch(() => {
				console.error(__('Failed to load documents', 'multivendorx'));
				setData([]);
			});
	}

	useEffect(() => {
		requestData();
	}, []);

	const handleReadMore = (doc: DocumentItem) => {
		setActiveDocument(doc);
		setPopupOpen(true);
	};

	const truncateText = (text: string, wordCount: number) => {
		const words = text.split(' ');
		if (words.length <= wordCount) {
			return text;
		}
		return words.slice(0, wordCount).join(' ') + '...';
	};

	//Filter logic — works for API data
	const filteredDocuments = data.filter((doc) => {
		const title = doc.title?.toLowerCase() || '';
		const content = doc.content?.toLowerCase() || '';
		return (
			title.includes(searchText.toLowerCase()) ||
			content.includes(searchText.toLowerCase())
		);
	});
	const handlePrint = (doc: DocumentItem) => {
		const printWindow = window.open('', '_blank', 'width=800,height=600');
		if (printWindow) {
			printWindow.document.write(`
                <html>
                    <head>
                        <title>${doc.title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 1.25rem; }
                            h2 { color: #333; }
                            p { line-height: 1.5; }
                        </style>
                    </head>
                    <body>
                        <h2>${doc.title}</h2>
                        <p>${doc.content}</p>
                    </body>
                </html>
            `);
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
		}
	};

	return (
		<>
			<div className="page-title-wrapper">
				<div className="page-title">
					<div className="title">
						{__('Documentation', 'multivendorx')}
					</div>
					<div className="des">
						{__(
							'Everything you need to know about store operations',
							'multivendorx'
						)}
					</div>
				</div>
			</div>

			<div className="card-content">
				<div className="card-body">
					<div className="buttons-wrapper">
						<div className="search-field">
							<div className="search-section">
								<input
									type="text"
									placeholder={__(
										'Search documents...',
										'multivendorx'
									)}
									value={searchText}
									onChange={(e) =>
										setSearchText(e.target.value)
									}
									className="basic-input"
								/>
								<i className="adminlib-search"></i>
							</div>
						</div>
					</div>

					<div className="documentation-wrapper">
						{filteredDocuments.length === 0 && (
							<div className="permission-wrapper">
								<i className="adminlib-info red"></i>
								<div className="title">
									{__('No documents found.', 'multivendorx')}
								</div>
							</div>
						)}

						{filteredDocuments.map((doc) => (
							<div key={doc.id} className="document">
								<div className="document-icon">
									<i className="adminlib-contact-form"></i>
								</div>
								<div className="document-content">
									<div className="title">{doc.title}</div>
									<div className="description">
										{truncateText(doc.content || '', 10)}
										{(doc.content || '').split(' ').length >
											10 && (
											<a
												className="read-more"
												onClick={() =>
													handleReadMore(doc)
												}
											>
												{__(
													'Read More',
													'multivendorx'
												)}
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
				<>
					<CommonPopup
						open={popupOpen}
						width="31.25rem"
						header={
							<>
								<div className="title">
									<i className="adminlib-contact-form"></i>
									{activeDocument.title}
								</div>
								<i
									className="icon adminlib-close"
									onClick={() => setPopupOpen(false)}
								></i>
							</>
						}
						footer={
							<div className="footer-buttons">
								<div className="buttons-wrapper">
									<div
										className="admin-btn btn-red"
										onClick={() => setPopupOpen(false)}
									>
										<i className="adminlib-close"></i>
										{__('Close', 'multivendorx')}
									</div>
									<div
										className="admin-btn btn-purple"
										onClick={() =>
											handlePrint(activeDocument)
										}
									>
										<i className="adminlib-import"></i>
										{__('Print', 'multivendorx')}
									</div>
								</div>
							</div>
						}
					>
						<div className="content">
							<div
								className="document-popup-wrapper"
								id="printable-content"
							>
								<h2>{activeDocument.title}</h2>
								<p>{activeDocument.content}</p>
							</div>
						</div>
					</CommonPopup>
				</>
			)}
		</>
	);
};

export default Documentation;
