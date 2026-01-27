import React from 'react';
import './pagination.scss';

interface PageArrowsProps {
	currentPage: number;
	showPageArrowsLabel?: boolean;
	perPage:number;
	total:number
}

const PageArrows: React.FC<PageArrowsProps> = ({
	currentPage,
	showPageArrowsLabel = true,
	perPage,
	total
}) => {
	const startIndex = (currentPage - 1) * perPage + 1;
	const endIndex = Math.min(currentPage * perPage, total);

	return (
		<div className="pagination-number-wrapper">
			{showPageArrowsLabel && (
				<span
					className="show-section"
					role="status"
					aria-live="polite"
				>
					Showing {startIndex} to {endIndex} of {total} entries.
				</span>
			)}

		</div>
	);
};

export default PageArrows;
