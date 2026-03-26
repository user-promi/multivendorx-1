import { addFilter } from '@wordpress/hooks';
import AiButtonSection from './AiButtonSection';
import FeaturedImageButton from './FeaturedImageButton';

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