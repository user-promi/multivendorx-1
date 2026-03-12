import { AdminButtonUI, Card, Column, Container, ItemListUI, NavigatorHeader } from "zyra";
import { __ } from '@wordpress/i18n';


const membership: React.FC = () => {
    return (
        <>
            <NavigatorHeader
                headerTitle={__('Pick a plan that fits your store', 'multivendorx')}
                headerDescription={__(
                    'Scale your store with the right tools. Upgrade or downgrade anytime.',
                    'multivendorx'
                )}
            />
            <Container>
                <Column row className="membership-plan">
                    <Card>
                        <div className="plan-name">
                            <i className="adminfont-storefront" />
                            Free
                        </div>
                        <div className="desc plan-desc">
                            Get started
                        </div>

                        <ItemListUI
                            className='checklist'
                            items={[
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                            ]}
                        />
                        <AdminButtonUI
                            position="center"
                            buttons={[
                                {
                                    // icon: 'import',
                                    text: 'Select Free',
                                    color: 'purple',
                                    // onClick: (e) => {
                                    //     handleDownloadLog?.(e);
                                    // },
                                },
                            ]}
                        />
                    </Card>
                    <Card>
                        <div className="plan-name">
                            <i className="adminfont-storefront" />
                            Growth
                        </div>
                        <div className="desc plan-desc">
                            Most popular
                        </div>

                        <ItemListUI
                            className='checklist'
                            items={[
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                            ]}
                        />
                        <AdminButtonUI
                            position="center"
                            buttons={[
                                {
                                    // icon: 'import',
                                    text: 'Select Free',
                                    color: 'purple',
                                    // onClick: (e) => {
                                    //     handleDownloadLog?.(e);
                                    // },
                                },
                            ]}
                        />
                    </Card>
                    <Card>
                        <div className="plan-name">
                            <i className="adminfont-storefront" />
                            Pro
                        </div>
                        <div className="desc plan-desc">
                            Serious sellers
                        </div>

                        <ItemListUI
                            className='checklist'
                            items={[
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                            ]}
                        />
                        <AdminButtonUI
                            position="center"
                            buttons={[
                                {
                                    // icon: 'import',
                                    text: 'Select Free',
                                    color: 'purple',
                                    // onClick: (e) => {
                                    //     handleDownloadLog?.(e);
                                    // },
                                },
                            ]}
                        />
                    </Card>
                    <Card>
                        <div className="plan-name">
                            <i className="adminfont-storefront" />
                            Enterprise
                        </div>
                        <div className="desc plan-desc">
                            Custom pricing
                        </div>

                        <ItemListUI
                            className='checklist'
                            items={[
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('50 products listed', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Basic store analytics', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('1 staff account', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                                {
                                    title: __('Community support', 'multivendorx'),
                                    icon: 'icon-yes',
                                },
                            ]}
                        />
                        <AdminButtonUI
                            position="center"
                            buttons={[
                                {
                                    // icon: 'import',
                                    text: 'Select Free',
                                    color: 'purple',
                                    // onClick: (e) => {
                                    //     handleDownloadLog?.(e);
                                    // },
                                },
                            ]}
                        />
                    </Card>
                </Column>
            </Container>
        </>
    )
};

export default membership;