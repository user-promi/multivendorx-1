import { addFilter } from '@wordpress/hooks';
import AIButtonSection from './AIButtonSection';

addFilter(
	'multivendorx_add_product_middle_section',
	'multivendorx/ai-section',
	(
		content,
		product,
		setProduct,
		handleChange,
		productFields,
		typeFields,
		modules,
		setFeaturedImage
	) => {
		return (
			<>
				{content}
				{modules.includes('intelligence') && (
					<AIButtonSection
						product={product}
						setProduct={setProduct}
						handleChange={handleChange}
						productFields={productFields}
						typeFields={typeFields}
						modules={modules}
						setFeaturedImage={setFeaturedImage}
					/>
				)}
			</>
		);
	},
	10
);
