import { addFilter } from '@wordpress/hooks';
import AiButtonSection from './AiButtonSection';

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