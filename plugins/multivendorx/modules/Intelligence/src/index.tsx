import { addFilter } from '@wordpress/hooks';
import AiButtonSection from './AiButtonSection';
import FeaturedImageButton from './FeaturedImageButton';
import AiField from './AiField';

addFilter(
  'multivendorx_add_product_middle_section',
  'multivendorx/ai-section',
  (content, product, setProduct, handleChange, productFields, typeFields, modules) => {
    return (
      <>
        {content}
        {modules.includes('intelligence') && (
          <AiButtonSection
            product={product}
            setProduct={setProduct}
            handleChange={handleChange}
            productFields={productFields}
            typeFields={typeFields}
            modules={modules}
          />
        )}
      </>
    );
  },
  10
);

addFilter(
    'product_image_enhancement',
    'multivendorx/add-featured-button',
    (existing, props) => {
        if (props.isFeaturedImage) {
            return (
                <>
                    {existing}
                    <FeaturedImageButton {...props} />
                </>
            );
        }
        return existing;
    }
);

addFilter(
  'multivendorx_product_field_suggestions',
  'multivendorx/ai-field',
  (existing, props) => {
    const { product, setProduct, field } = props;
    if (['name', 'short_description', 'description'].includes(field)) {
      return <AiField product={product} setProduct={setProduct} field={field} />;
    }
    return existing;
  }
);