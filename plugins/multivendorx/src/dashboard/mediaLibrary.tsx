import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Column, Container, NavigatorHeader, PopupUI, Skeleton } from 'zyra';
import Popup from '../components/Popup/Popup';

const MediaLibrary = () => {
	const [media, setMedia] = useState([]);
	const [loading, setLoading] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState<{ id: number } | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		fetchMedia();
	}, []);

	const fetchMedia = () => {
		setLoading(true);
		axios
			.get(`${appLocalizer.apiUrl}/wp/v2/media`, {
				params: {
					author: appLocalizer?.current_user?.data?.ID,
					per_page: 100,
				},
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
			})
			.then((res) => {
				setMedia(res.data || []);
				setLoading(false);
			})
			.catch(() => {
				setMedia([]);
				setLoading(false);
			});
	};

	const formattedMedia = media.map((item) => {
		const mime = item.mime_type || '';

		let type = 'file';
		if (mime.startsWith('image')) type = 'image';
		else if (mime.startsWith('video')) type = 'video';

		return {
			id: item.id,
			name: item.title?.rendered || 'Untitled',
			size: item.media_details?.filesize
				? (item.media_details.filesize / 1024 / 1024).toFixed(2) + ' MB'
				: '—',
			category: type === 'image' ? 'Images' : type === 'video' ? 'Videos' : 'Files',
			type,
			src: item.source_url,
		};
	});

	const deleteMedia = () => {
		if (!selectedMedia) {
			return;
		}

		axios
			.delete(`${appLocalizer.apiUrl}/wp/v2/media/${selectedMedia.id}`, {
				headers: {
					'X-WP-Nonce': appLocalizer.nonce,
				},
			})
			.then(() => {
				setMedia((prev) => prev.filter((item) => item.id !== id));
			})
			.catch((err) => {
				console.error(err);
				setConfirmOpen(false);
				setSelectedMedia(null);
			});
	};
	const MediaSkeleton = () => (
		<>
			{Array.from({ length: 12 }).map((_, index) => (
				<div key={`skeleton-${index}`} className="media-item media-image">
					<div className="media-preview">
						<Skeleton width="100%" height="100%" />
					</div>
					<div className="media-info">
						<div className="title">
							<Skeleton width="70%" height="20px" />
							<Skeleton width="24px" height="24px" borderRadius="50%" />
						</div>
						<div className="media-meta">
							<Skeleton width="40%" height="16px" />
							<Skeleton width="30%" height="16px" />
						</div>
					</div>
				</div>
			))}
		</>
	);
	return (
		<>
			<NavigatorHeader
				headerTitle={__('Media Library', 'multivendorx')}
				headerDescription={__(
					"Manage your store's media assetsManage your rental inventory items",
					'multivendorx'
				)}
			/>
			<Container>
				<Column>
					<div className="media-library-grid">
						{loading && <MediaSkeleton />}

						{!loading && formattedMedia.map((item) => (
							<div key={item.id} className={`media-item media-${item.type}`}
								onClick={() => {
									setPreviewUrl(item.src);
								}}
							>

								{item.type === 'image' && (
									<div
										className="media-preview"
										style={{ backgroundImage: `url(${item.src})` }}
									/>
								)}

								{item.type === 'video' && (
									<div className="media-icon">
										<i className="adminfont-video"></i>
									</div>
								)}

								{item.type === 'file' && (
									<div className="media-icon">
										<i className="adminfont-document"></i>
									</div>
								)}

								<div className="media-info">
									<div className="title">
										{item.name}
										<span className="adminfont-delete"
											onClick={(e) => {
												e.stopPropagation();
												setSelectedMedia({ id: item.id });
												setConfirmOpen(true);
											}}>
										</span>
									</div>

									<div className="media-meta">
										<span>{item.size}</span>
										<span>{item.category}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</Column>

				<PopupUI
					position="lightbox"
					open={confirmOpen}
					onClose={() => setConfirmOpen(false)}
					width={31.25}
					height="auto"
				>
					<Popup
						confirmMode
						title={__('Delete Media', 'multivendorx')}
						confirmMessage={__('Are you sure?', 'multivendorx')}
						confirmYesText={__('Delete', 'multivendorx')}
						confirmNoText={__('Cancel', 'multivendorx')}
						onConfirm={deleteMedia}
						onCancel={() => {
							setConfirmOpen(false);
						}}
					/>
				</PopupUI>

				<PopupUI
					position="lightbox"
					open={!!previewUrl}
					onClose={() => setPreviewUrl(null)}
					width="30rem"
					height="30rem"
					// header={{
					// 	title: 'Document Preview',
					// }}
				>

					{previewUrl && (
						previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
							<div
								className="image-preview-container"
								style={{
									backgroundImage: `url(${previewUrl})`,
								}}
							/>
						) : (
							<iframe
								src={previewUrl}
								title="Document"
								style={{ width: '100%', height: '100%', minHeight: '400px', border: 'none' }}
							/>
						)
					)}
				</PopupUI>
			</Container>
		</>
	);
};

export default MediaLibrary;
