/* global appLocalizer */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	getApiLink,
	useModules,
	Container,
	Column,
	FormGroupWrapper,
	FormGroup,
	Card,
	SelectInputUI,
	NoticeManager,
	InfoItem,
	ButtonInputUI,
	TableCard,
	PopupUI,
	MultiInputTableUI,
} from 'zyra';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

// Define proper interfaces
interface StoreOwner {
	label: string;
	value: string;
	[key: string]: unknown;
}

interface AdditionalOwner {
	id: string;
	label: string;
	email: string;
}

interface StaffMember {
	id: string;
	name: string;
	email: string;
	role: string;
	permissions: string[];
	status: 'active' | 'inactive';
	avatarInitials: string;
}

interface StoreSquadFormData {
	store_owners?: string[];
	primary_owner?: string;
	state?: string;
	staff_members?: StaffMember[];
	[key: string]: string | string[] | StaffMember[] | undefined;
}

interface StoreSquadProps {
	id: string | null;
}

// Type for the filter callback
type FilterCallback = (
	content: null,
	formData: StoreSquadFormData,
	setFormData: React.Dispatch<React.SetStateAction<StoreSquadFormData>>,
	autoSave: (data: StoreSquadFormData) => void
) => React.ReactElement | null;

const StoreSquad: React.FC<StoreSquadProps> = ({ id }) => {
	const { modules } = useModules();
	const [formData, setFormData] = useState<StoreSquadFormData>({});
	const [showPrimaryOwnerSelect, setShowPrimaryOwnerSelect] = useState<boolean>(true);
	const [selectedOwnerInfo, setSelectedOwnerInfo] = useState<StoreOwner | null>(null);
	const [showAdditionalOwnerSelect, setShowAdditionalOwnerSelect] = useState<boolean>(false);
	const [additionalOwners, setAdditionalOwners] = useState<AdditionalOwner[]>([]);
	const [editStaffPermissions, seteditStaffPermissions] = useState(false);

	// Staff members state
	const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedStaffMember, setSelectedStaffMember] = useState<StaffMember | null>(null);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [editStaffMember, setEditStaffMember] = useState<StaffMember | null>(null);
	const [showStaffForm, setShowStaffForm] = useState(false);


	// Static demo data for staff roles and permissions
	const roleOptions = [
		{ value: 'store_manager', label: 'Store Manager' },
		{ value: 'product_manager', label: 'Product Manager' },
		{ value: 'customer_support', label: 'Customer Support' },
		{ value: 'order_assistant', label: 'Order Assistant' },
	];

	const permissionOptions = [
		{ value: 'products', label: 'Products' },
		{ value: 'orders', label: 'Orders' },
		{ value: 'coupons', label: 'Coupons' },
		{ value: 'inventory', label: 'Inventory' },
		{ value: 'settings', label: 'Settings' },
		{ value: 'support', label: 'Support' },
	];

	// Demo initial staff data
	const demoStaffMembers: StaffMember[] = [
		{
			id: '1',
			name: 'Riya Joshi',
			email: 'riya@earthyways.com',
			role: 'Store Manager',
			permissions: ['Products', 'Orders', 'Coupons', 'Inventory', 'Settings'],
			status: 'active',
			avatarInitials: 'RJ',
		},
		{
			id: '2',
			name: 'Mihail Stancu',
			email: 'mihail@earthyways.com',
			role: 'Product Manager',
			permissions: ['Products', 'Inventory'],
			status: 'active',
			avatarInitials: 'MS',
		},
		{
			id: '3',
			name: 'Priya Devi',
			email: 'priya@earthyways.com',
			role: 'Customer Support',
			permissions: ['Support', 'Orders'],
			status: 'active',
			avatarInitials: 'PD',
		},
		{
			id: '4',
			name: 'Takanori Kato',
			email: 'takanori@earthyways.com',
			role: 'Order Assistant',
			permissions: ['Orders'],
			status: 'inactive',
			avatarInitials: 'TK',
		},
	];

	useEffect(() => {
		if (!id) {
			return;
		}

		axios({
			method: 'GET',
			url: getApiLink(appLocalizer, `store/${id}`),
			params: { fetch_user: true },
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
		}).then((res) => {
			const data = res.data || {};
			setFormData((prev) => ({ ...prev, ...data }));

			// If there's an existing primary owner, show the InfoItem instead of select
			if (data.primary_owner) {
				const owner = (appLocalizer.store_owners || []).find(
					(opt: StoreOwner) => opt.value === data.primary_owner
				);
				if (owner) {
					setSelectedOwnerInfo(owner);
					setShowPrimaryOwnerSelect(false);
				}
			}

			// Load existing additional owners from store_owners array
			if (data.store_owners && Array.isArray(data.store_owners)) {
				const loadedOwners = data.store_owners.map((ownerValue: string) => {
					const owner = (appLocalizer.store_owners || []).find(
						(opt: StoreOwner) => opt.value === ownerValue
					);
					return {
						id: ownerValue,
						label: owner?.label || ownerValue,
						email: owner?.value || ownerValue,
					};
				});
				setAdditionalOwners(loadedOwners);
			}

			// Load staff members from API or use demo data
			if (data.staff_members && Array.isArray(data.staff_members)) {
				setStaffMembers(data.staff_members);
			} else {
				setStaffMembers(demoStaffMembers);
			}
		});
	}, [id]);

	const autoSave = (updatedData: StoreSquadFormData) => {
		axios({
			method: 'POST',
			url: getApiLink(appLocalizer, `store/${id}`),
			headers: { 'X-WP-Nonce': appLocalizer.nonce },
			data: {
				...updatedData,
				user: 'true',
			},
		}).then((res) => {
			if (res.data.success) {
				NoticeManager.add({
					title: __('Great!', 'multivendorx'),
					message: __('Store saved successfully!', 'multivendorx'),
					type: 'success',
					position: 'float',
				});
			}
		});
	};

	const handlePrimaryOwnerSelect = (primary_owner: string | string[]) => {
		if (Array.isArray(primary_owner)) {
			return;
		}

		const selectedOwner = (appLocalizer.store_owners || []).find(
			(opt: StoreOwner) => opt.value === primary_owner
		);

		if (selectedOwner) {
			setSelectedOwnerInfo(selectedOwner);
			setShowPrimaryOwnerSelect(false);
		}

		const updated = {
			...formData,
			primary_owner: primary_owner || '',
		};

		setFormData(updated);
		autoSave(updated);
	};

	const handleRemovePrimaryOwner = () => {
		setShowPrimaryOwnerSelect(true);
		setSelectedOwnerInfo(null);

		const updated = {
			...formData,
			primary_owner: '',
		};

		setFormData(updated);
		autoSave(updated);
	};

	const handleAddAdditionalOwner = () => {
		setShowAdditionalOwnerSelect(true);
	};

	const handleAdditionalOwnerSelect = (selectedOwners: string | string[]) => {
		const ownersArray = Array.isArray(selectedOwners)
			? selectedOwners
			: selectedOwners
				? [selectedOwners]
				: [];

		if (ownersArray.length > 0) {
			const newOwner = ownersArray[0];
			const ownerInfo = (appLocalizer.store_owners || []).find(
				(opt: StoreOwner) => opt.value === newOwner
			);

			if (ownerInfo && !additionalOwners.some(owner => owner.id === newOwner)) {
				const newAdditionalOwner: AdditionalOwner = {
					id: newOwner,
					label: ownerInfo.label,
					email: ownerInfo.value,
				};

				const updatedAdditionalOwners = [...additionalOwners, newAdditionalOwner];
				setAdditionalOwners(updatedAdditionalOwners);

				const updatedStoreOwners = updatedAdditionalOwners.map(owner => owner.id);
				const updated = {
					...formData,
					store_owners: updatedStoreOwners,
				};
				setFormData(updated);
				autoSave(updated);
			}
		}

		setShowAdditionalOwnerSelect(false);
	};

	const handleRemoveAdditionalOwner = (ownerId: string) => {
		const updatedAdditionalOwners = additionalOwners.filter(owner => owner.id !== ownerId);
		setAdditionalOwners(updatedAdditionalOwners);

		const updatedStoreOwners = updatedAdditionalOwners.map(owner => owner.id);
		const updated = {
			...formData,
			store_owners: updatedStoreOwners,
		};
		setFormData(updated);
		autoSave(updated);
	};

	// Staff member handlers
	const handleEditStaff = (staff: StaffMember) => {
		setEditStaffMember(staff);
		setShowStaffForm(true);
	};

	const handleDeleteStaff = (staff: StaffMember) => {
		setSelectedStaffMember(staff);
		setConfirmOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!selectedStaffMember) {
			return;
		}

		const updatedStaff = staffMembers.filter(member => member.id !== selectedStaffMember.id);
		setStaffMembers(updatedStaff);

		const updated = {
			...formData,
			staff_members: updatedStaff,
		};
		setFormData(updated);
		autoSave(updated);

		setConfirmOpen(false);
		setSelectedStaffMember(null);

		NoticeManager.add({
			title: __('Success', 'multivendorx'),
			message: __('Staff member removed successfully!', 'multivendorx'),
			type: 'success',
			position: 'float',
		});
	};

	const handleSaveStaff = (staffData: Partial<StaffMember>) => {
		if (editStaffMember) {
			// Update existing staff
			const updatedStaff = staffMembers.map(member =>
				member.id === editStaffMember.id
					? { ...member, ...staffData } as StaffMember
					: member
			);
			setStaffMembers(updatedStaff);

			const updated = {
				...formData,
				staff_members: updatedStaff,
			};
			setFormData(updated);
			autoSave(updated);
		} else {
			// Add new staff
			const newStaff: StaffMember = {
				id: Date.now().toString(),
				name: staffData.name || '',
				email: staffData.email || '',
				role: staffData.role || '',
				permissions: staffData.permissions || [],
				status: staffData.status || 'active',
				avatarInitials: (staffData.name || '')
					.split(' ')
					.map(n => n[0])
					.join('')
					.toUpperCase()
					.slice(0, 2),
			};

			const updatedStaff = [...staffMembers, newStaff];
			setStaffMembers(updatedStaff);

			const updated = {
				...formData,
				staff_members: updatedStaff,
			};
			setFormData(updated);
			autoSave(updated);
		}

		setShowStaffForm(false);
		setEditStaffMember(null);
	};

	// Format permissions for display
	const formatPermissions = (permissions: string[]) => {
		return permissions.join(', ');
	};

	// Table headers configuration
	const headers = {
		name: {
			label: __('Staff member', 'multivendorx'),
			width: 15,
			render: (row: StaffMember) => (
				<InfoItem
					title={row.name}
					avatar={{
						// image: row.image?.src || '',
						iconClass: 'person',
					}}
					descriptions={[
						{
							label: __('Email', 'multivendorx'),
							value: row.email,
						},
					]}
				/>
			)
		},
		role: {
			label: __('Role', 'multivendorx'),
			render: (row: StaffMember) => <span className='admin-badge green'>{row.role}</span>
		},
		permissions: {
			label: __('Key permissions', 'multivendorx'),
			render: (row: StaffMember) => (
				<div className="buttons-wrapper" data-position={'left'}>
					{row.permissions.map((permission, idx) => (
						<span key={idx} className="admin-badge ">{permission}</span>
					))}
				</div>
			)
		},
		action: {
			type: 'action',
			label: __('Action', 'multivendorx'),
			actions: [
				{
					label: __('Edit', 'multivendorx'),
					icon: 'edit',
					onClick: (row: StaffMember) => seteditStaffPermissions(true),
				},
				{
					label: __('Remove', 'multivendorx'),
					icon: 'delete',
					onClick: (row: StaffMember) => handleDeleteStaff(row),
					className: 'danger',
				},
			],
		},
	};

	// Convert staff members to table row format
	const tableRows = staffMembers.map(member => ({
		id: member.id,
		name: member.name,
		email: member.email,
		role: member.role,
		permissions: member.permissions,
		status: member.status,
		avatarInitials: member.avatarInitials,
	}));

	return (
		<Container>
			<Column grid={8}>
				<Card
					title={__('Staff members', 'multivendorx')}
					buttons={[
						{
							label: __('Add Staff Member', 'multivendorx'),
							icon: 'plus',
							onClick: () => {
								setEditStaffMember(null);
								setShowStaffForm(true);
							},
						},
					]}
				>
					<TableCard
						headers={headers}
						rows={tableRows}
						showMenu={false}
						isLoading={isLoading}
						totalRows={staffMembers.length}
					/>

					{modules.includes('staff-manager') &&
						(applyFilters(
							'additional_staff_manager_fields',
							null,
							formData,
							setFormData,
							autoSave
						) as ReturnType<FilterCallback>)}

					{modules.includes('facilitator') &&
						(applyFilters(
							'additional_facilitator_fields',
							null,
							formData,
							setFormData,
							autoSave
						) as ReturnType<FilterCallback>)}
				</Card>
				<PopupUI
					open={editStaffPermissions}
					onClose={() => seteditStaffPermissions(false)}
					width={31.25}
					height={50}
					header={{
						icon: 'announcement',
						title: __('Edit staff permissions', 'multivendorx')
					}}
					footer={
						<ButtonInputUI
							buttons={[
								{
									icon: 'close',
									text: __('Cancel', 'multivendorx'),
									color: 'red',
									// onClick: seteditStaffPermissions(false),
								},
								{
									icon: 'save',
									text: __('Save', 'multivendorx'),
									// onClick: () => handleSubmit(),
								},
							]}
						/>
					}
				>
					<FormGroupWrapper>
						<InfoItem
							title='Riya Joshi'
							avatar={{
								iconClass: `item-icon adminfont-person admin-color-green`,
							}}
							descriptions={[
								{
									label: __('Email: ', 'multivendorx'),
									value: 'riya@earthyways.com',
								},
							]}
							badges={[
								{
									text: __('Store Manager', 'multivendorx'),
									className: 'green',
								},
							]}
						/>

						<FormGroup
							label={__('Assigned role', 'multivendorx')}
						>
							<SelectInputUI
								name="period_interval"
								type="single-select"
								options={[
									{ value: 'day', label: 'Store Manager' },
									{ value: 'week', label: 'Product Manager' },
									{ value: 'month', label: 'Customer Support' },
									{ value: 'year', label: 'Order Assistant' },
								]}
							// onChange={(value) => handleChange('period_interval', value)}
							/>
						</FormGroup>
						<FormGroup
							label={__('Assigned role', 'multivendorx')}
						>
							<ChoiceToggleUI
								options={[
									{
										key: 'draft',
										value: 'draft',
										label: __('Use default role permissions', 'multivendorx'),
									},
									{
										key: 'pending',
										value: 'pending',
										label: __('Customize permissions', 'multivendorx'),
									},
								]}
							// value={formData.status}
							// onChange={(val: string) =>
							// 	handleChange('status', val)
							// }
							/>
						</FormGroup>
						<FormGroup label={__('Store Permissions', 'multivendorx')}>
							<MultiInputTableUI
								khali_dabba={false}
								rows={{
									'order_permissions': {
										label: 'Order',
										desc: 'Manage order-related capabilities',
										capability: {
											'manage_orders': 'Manage orders',
											'view_orders': 'View orders',
											'edit_orders': 'Edit orders',
											'delete_orders': 'Delete orders',
											'add_order_notes': 'Add order notes'
										}
									},
									'coupon_permissions': {
										label: 'Coupon ',
										desc: 'Manage coupon-related capabilities',
										capability: {
											'add_coupons': 'Add coupons',
											'view_coupons': 'View coupons',
											'edit_coupons': 'Edit coupons',
											'publish_coupons': 'Publish coupons'
										}
									},
									'order_permissns': {
										label: 'Commission & earnings',
										desc: 'Manage order-related capabilities',
										capability: {
											'manage_orders': 'Manage orders',
											'view_orders': 'View orders',
											'edit_orders': 'Edit orders',
											'delete_orders': 'Delete orders',
											'add_order_notes': 'Add order notes'
										}
									},
									'coupon_permissios': {
										label: 'Store support & engagement ',
										desc: 'Manage coupon-related capabilities',
										capability: {
											'add_coupons': 'Add coupons',
											'view_coupons': 'View coupons',
											'edit_coupons': 'Edit coupons',
											'publish_coupons': 'Publish coupons'
										}
									}
								}}
								columns={[
									{
										key: 'permission',
										label: 'Permission',
										type: 'checkbox'
									}
								]}
								setting={{
									permission: ['manage_orders', 'view_orders', 'add_order_notes', 'view_coupons', 'add_coupons']
								}}
								visibilityContext={{}}
								storeTabSetting={{}}
								proSetting={false}
								modules={[]}
								onChange={(subKeyOrBatch, value) => {
									handleMultiInputChange(subKeyOrBatch, value);
								}}
								onBlocked={(type, payload) => {
									console.log('Blocked:', type, payload);
								}}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</PopupUI>
			</Column>

			<Column grid={4}>
				<Card
					id="primary-owner"
					title={__('Store ownership', 'multivendorx')}
				>
					<FormGroupWrapper>
						<FormGroup
							label={__('Primary owner', 'multivendorx')}
							desc={__('Primary owner cannot be removed.', 'multivendorx')}
						>
							<>
							<InfoItem
								title={selectedOwnerInfo?.label || __('Store Owner', 'multivendorx')}
								titleLink={selectedOwnerInfo?.value || '#'}
								avatar={{
									iconClass: "item-icon adminfont-person admin-color-green",
								}}
								descriptions={[
									{
										label: __('Email: ', 'multivendorx'),
										value: selectedOwnerInfo?.email || 'owner@example.com',
									},
									{
										label: __('Phone: ', 'multivendorx'),
										value: selectedOwnerInfo?.phone || '+1 234 567 8900',
									}
								]}
								badges={[
									{
										text: __('Primary Owner', 'multivendorx'),
										className: 'green',
									}
								]}
								rightContent={
									<ButtonInputUI
										buttons={[
											{
												text: __('Transfer', 'multivendorx'),
												onClick: () => setShowPrimaryOwnerSelect(true),
												color: 'gray',
											}
										]}
									/>
								}
							/>

							{showPrimaryOwnerSelect && (
								<SelectInputUI
									name="primary_owner"
									options={appLocalizer?.store_owners || []}
									value={formData.primary_owner}
									onChange={handlePrimaryOwnerSelect}
								/>
							)}
						</>
						</FormGroup>

						<FormGroup
							label={__('Additional owners', 'multivendorx')}
						>
							<div className="additional-owners-wrapper">
								{additionalOwners.map((owner) => (
									<InfoItem
										key={owner.id}
										title={owner.label}
										avatar={{
											iconClass: `item-icon adminfont-person admin-color-green`,
										}}
										descriptions={[
											{
												label: __('Email: ', 'multivendorx'),
												value: 'earthyways@test.com',
											},
										]}
										badges={[
											{
												text: __('Co-owner', 'multivendorx'),
												className: 'blue',
											},
										]}
										rightContent={
											<ButtonInputUI
												buttons={[
													{
														text: __('Remove', 'multivendorx'),
														color: 'red',
														onClick: () => handleRemoveAdditionalOwner(owner.id),
													},
												]}
											/>
										}
									/>
								))}
							</div>

							{showAdditionalOwnerSelect && (
								<SelectInputUI
									name="store_owners"
									options={appLocalizer.store_owners || []}
									type="multi-select"
									value={[]}
									size="20rem"
									onChange={handleAdditionalOwnerSelect}
								/>
							)}

							<ButtonInputUI
								buttons={[
									{
										text: __('Add additional owner', 'multivendorx'),
										color: 'purple',
										icon: 'plus',
										onClick: handleAddAdditionalOwner,
									},
								]}
							/>
						</FormGroup>
					</FormGroupWrapper>
				</Card>
			</Column>
		</Container>
	);
};

// Staff Member Form Component
interface StaffMemberFormProps {
	staffMember: StaffMember | null;
	roleOptions: { value: string; label: string }[];
	permissionOptions: { value: string; label: string }[];
	onSave: (data: Partial<StaffMember>) => void;
	onCancel: () => void;
}

const StaffMemberForm: React.FC<StaffMemberFormProps> = ({
	staffMember,
	roleOptions,
	permissionOptions,
	onSave,
	onCancel,
}) => {
	const [formData, setFormData] = useState<Partial<StaffMember>>({
		name: staffMember?.name || '',
		email: staffMember?.email || '',
		role: staffMember?.role || '',
		permissions: staffMember?.permissions || [],
		status: staffMember?.status || 'active',
	});

	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	const validate = () => {
		const newErrors: { [key: string]: string } = {};
		if (!formData.name?.trim()) {
			newErrors.name = __('Name is required', 'multivendorx');
		}
		if (!formData.email?.trim()) {
			newErrors.email = __('Email is required', 'multivendorx');
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = __('Email is invalid', 'multivendorx');
		}
		if (!formData.role) {
			newErrors.role = __('Role is required', 'multivendorx');
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (validate()) {
			onSave(formData);
		}
	};

	return (
		<FormGroupWrapper>
			<FormGroup label={__('Full Name', 'multivendorx')} htmlFor="name">
				<BasicInputUI
					name="name"
					value={formData.name || ''}
					onChange={(val) => setFormData({ ...formData, name: val as string })}
					msg={{ message: errors.name }}
				/>
			</FormGroup>

			<FormGroup label={__('Email Address', 'multivendorx')} htmlFor="email">
				<BasicInputUI
					name="email"
					type="email"
					value={formData.email || ''}
					onChange={(val) => setFormData({ ...formData, email: val as string })}
					msg={{ message: errors.email }}
				/>
			</FormGroup>

			<FormGroup label={__('Role', 'multivendorx')} htmlFor="role">
				<SelectInputUI
					name="role"
					options={roleOptions}
					value={formData.role || ''}
					onChange={(val) => setFormData({ ...formData, role: val as string })}
					msg={{ message: errors.role }}
				/>
			</FormGroup>

			<FormGroup label={__('Permissions', 'multivendorx')} htmlFor="permissions">
				<SelectInputUI
					name="permissions"
					type="multi-select"
					options={permissionOptions}
					value={formData.permissions || []}
					onChange={(val) => setFormData({ ...formData, permissions: val as string[] })}
				/>
			</FormGroup>

			<FormGroup label={__('Status', 'multivendorx')} htmlFor="status">
				<ChoiceToggleUI
					options={[
						{ key: 'active', value: 'active', label: __('Active', 'multivendorx') },
						{ key: 'inactive', value: 'inactive', label: __('Inactive', 'multivendorx') },
					]}
					value={formData.status || 'active'}
					onChange={(val) => setFormData({ ...formData, status: val as 'active' | 'inactive' })}
				/>
			</FormGroup>

			<ButtonInputUI
				buttons={[
					{
						text: __('Cancel', 'multivendorx'),
						icon: 'close',
						color: 'red',
						onClick: onCancel,
					},
					{
						text: __('Save Staff Member', 'multivendorx'),
						icon: 'save',
						color: 'green',
						onClick: handleSubmit,
					},
				]}
			/>
		</FormGroupWrapper>
	);
};

// Import missing components
import { BasicInputUI, ChoiceToggleUI } from 'zyra';

export default StoreSquad;