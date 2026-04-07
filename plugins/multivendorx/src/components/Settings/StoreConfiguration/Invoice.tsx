import { BasicInputUI, Card, ChoiceToggleUI, Column, Container, FileInputUI, FormGroup, FormGroupWrapper, MultiCheckBoxUI, TextAreaUI } from "zyra";
import { __ } from '@wordpress/i18n';

const Invoice: React.FC = () => {
    return (
        <Container className="notice-settings">
            <Column grid={8}>
                <Card title={__('Automatic invoice generation', 'multivendorx')} desc={__('Choose at which order stages invoices should be generated automatically.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label="Invoice prefix" desc={__('', 'multivendorx-pro')}>
                            <BasicInputUI
                                name="name"
                            // value={formData.name || ''}
                            // onChange={(val) =>
                            //     handleChange('name', val as string)
                            // }
                            />
                        </FormGroup>
                        <FormGroup cols={2} label="Invoice prefix" desc={__('', 'multivendorx-pro')}>
                            <BasicInputUI
                                name="name"
                            // value={formData.name || ''}
                            // onChange={(val) =>
                            //     handleChange('name', val as string)
                            // }
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('PDF format', 'multivendorx')} desc={__('A4 is standard internationally, Letter is standard in North America', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label="Page size">
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('A4 (210 × 297 mm)', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Letter (8.5 × 11 in)', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Legal (8.5 × 14 in)', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                         <FormGroup cols={2} label="Orientation">
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('Portrait (Vertical)', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Landscape (Horizontal)', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Invoice Content Controls', 'multivendorx')} desc={__('Choose at which order stages invoices should be generated automatically.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label={__('Invoice footer text', 'multivendorx')} >
                            <TextAreaUI
                                name="content"
                            />
                        </FormGroup>
                        <FormGroup cols={2} label={__('Terms and conditions', 'multivendorx')}>
                            <TextAreaUI
                                name="content"
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
            </Column>


            <Column grid={4}>
                <Card title={__('Legal and tax information', 'multivendorx')} desc={__('Choose at which order stages invoices should be generated automatically.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup cols={2} label="VAT / Tax number" desc={__('', 'multivendorx-pro')}>
                            <BasicInputUI
                                name="name"
                            />
                        </FormGroup>
                        <FormGroup cols={2} label="Additional Tax ID" desc={__('', 'multivendorx-pro')}>
                            <BasicInputUI
                                name="name"
                            />
                        </FormGroup>
                        <FormGroup cols={2} label="Company registration number" desc={__('', 'multivendorx-pro')}>
                            <BasicInputUI
                                name="name"
                            />
                        </FormGroup>
                        <FormGroup cols={2} label="Trade License Number" desc={__('', 'multivendorx-pro')}>
                            <BasicInputUI
                                name="name"
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Store commission invoices', 'multivendorx')} desc={__('Choose at which order stages invoices should be generated automatically.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup label="Commission invoice frequency" desc={__(
                            'Choose how often vendors receive commission invoices from the marketplace:<ul><li>Per order - Generate a commission invoice for each order.</li><li>Monthly - Generate a single consolidated commission invoice at the end of each month.</li></ul>',
                            'multivendorx'
                        )}>
                            <ChoiceToggleUI
                                options={[
                                    {
                                        key: 'public',
                                        value: 'public',
                                        label: __('Per order', 'multivendorx'),
                                    },
                                    {
                                        key: 'private',
                                        value: 'private',
                                        label: __('Monthly', 'multivendorx'),
                                    },
                                ]}
                            />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
                <Card title={__('Company logo', 'multivendorx')} desc={__('Choose at which order stages invoices should be generated automatically.', 'multivendorx')}>
                    <FormGroupWrapper>
                        <FormGroup label="Company logo" desc={__('', 'multivendorx-pro')}>
                            <FileInputUI />
                        </FormGroup>
                        <FormGroup label="Invoice signature" desc={__('', 'multivendorx-pro')}>
                            <FileInputUI />
                        </FormGroup>
                    </FormGroupWrapper>
                </Card>
            </Column>
        </Container>
    );
}

export default Invoice;

