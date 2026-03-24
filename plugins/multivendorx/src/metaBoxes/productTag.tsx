import { addFilter } from '@wordpress/hooks';
import { Card } from 'zyra';
import { __ } from '@wordpress/i18n';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ProductTag = ({ product, setProduct }) => {
	// const [existingTags, setExistingTags] = useState([]);

	// useEffect(() => {
	// 	axios
	// 		.get(`${appLocalizer.apiUrl}/wc/v3/products/tags`, {
	// 			headers: { 'X-WP-Nonce': appLocalizer.nonce },
	// 		})
	// 		.then((res) => {
	// 			setExistingTags(res.data);
	// 		});
	// }, []);

	return (
		<Card title={__('Product tag', 'multivendorx')}>
			{/* <FormGroupWrapper>
				<InputWithSuggestions
					suggestions={existingTags.map(
						(tag) => tag.name
					)}
					value={
						product.tags?.map((tag) => tag.name) || []
					}
					onChange={(list) => {
						const updatedTags = list.map((name) => {
							const existing = existingTags.find(
								(tag) => tag.name === name
							);
							return existing ? existing : { name };
						});
						setProduct((prev) => ({
							...prev,
							tags: updatedTags,
						}));
					}}
					placeholder={__('Type tag…', 'multivendorx')}
					addButtonLabel={__('Add', 'multivendorx')}
				/>
			</FormGroupWrapper> */}
		</Card>
	);
};

addFilter(
	'multivendorx_add_product_right_section',
	'multivendorx/product_tag',
	(content, product, setProduct, handleChange, productFields) => {
		return (
			<>
				{content}
				{productFields.includes('product_tag') && (
					<ProductTag product={product} setProduct={setProduct} />
				)}
			</>
		);
	},
	40
);
