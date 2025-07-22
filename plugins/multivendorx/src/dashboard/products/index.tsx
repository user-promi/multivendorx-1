import React from 'react';
import { getSubtabs } from '../getSubTab';
import SubtabWrapper from '../subtab';

const Products = () => {
  const subtabs = getSubtabs('products');
  return <SubtabWrapper tabKey="products" subtabs={subtabs} />;
};

export default Products;
