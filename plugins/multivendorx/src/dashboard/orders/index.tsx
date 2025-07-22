import React from 'react';
import { getSubtabs } from '../getSubTab';
import SubtabWrapper from '../subtab';

const Orders = () => {
    const subtabs = getSubtabs( 'orders' );
    return <SubtabWrapper tabKey="orders" subtabs={ subtabs } />;
};

export default Orders;
