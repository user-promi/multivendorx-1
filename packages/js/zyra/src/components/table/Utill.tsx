import { TableRow } from "./types";

export const renderCell = (cell: TableRow) => {
	if (!cell) return null;
	switch (cell.type) {
		case 'product': {
			const { id, name, image, link, sku } = cell.data || {};
			return (
				<div className="product-cell">
					{image && (
						<img
							src={image}
							alt={name}
							className="product-image"
						/>
					)}
					<div className="product-info">
						<a href={link} target="_blank" rel="noreferrer">
							<strong>{name}</strong>
						</a>
						{sku && <div className="sku">SKU: {sku}</div>}
						{id && <div className="id">#{id}</div>}
					</div>
				</div>
			);
		}

		default:
			return cell.display ?? null;
	}
};
