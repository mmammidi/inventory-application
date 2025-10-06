import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { createMovement, getMovement, updateMovement } from '../api/movements';
import type { MovementInput } from '../types/movement';
import type { InventoryItem } from '../types/inventory';
import { listItems } from '../api/inventory';
import type { User } from '../types/user';
import { listUsers } from '../api/users';

const MOVEMENT_TYPES = [
  { label: 'IN', value: 'IN' },
  { label: 'OUT', value: 'OUT' },
  { label: 'TRANSFER', value: 'TRANSFER' },
  { label: 'ADJUSTMENT', value: 'ADJUSTMENT' },
  { label: 'RETURN', value: 'RETURN' }
];

export default function MovementForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [form] = Form.useForm<MovementInput>();
  const navigate = useNavigate();

  useEffect(() => {
    // Load items for dropdown
    (async () => {
      try {
        const inventoryItems = await listItems();
        setItems(inventoryItems);
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Failed to load items');
      }
    })();

    // Load users for dropdown
    (async () => {
      try {
        setUsersLoading(true);
        const userList = await listUsers();
        console.log('Loaded users:', userList); // Debug log
        setUsers(userList || []);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to load users:', error);
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    })();

    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getMovement(id);
        form.setFieldsValue({
          movementType: data.movementType,
          quantity: data.quantity,
          reasonText: data.reasonText ?? '',
          referenceText: data.referenceText ?? '',
          notes: data.notes ?? '',
          itemId: data.itemId ?? '',
          userId: data.userId ?? ''
        });
      } catch {
        message.error('Failed to load movement');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, form]);

  const onFinish = async (values: MovementInput) => {
    try {
      setLoading(true);
      setSubmitError(null);
      if (isEdit && id) {
        await updateMovement(id, values);
        message.success('Movement updated');
      } else {
        await createMovement(values);
        message.success('Movement created');
      }
      navigate('/movements');
    } catch (err) {
      const ax = err as AxiosError<any>;
      const data = ax?.response?.data as any;
      const fieldErrors: Array<{ name: string; errors: string[] }> = [];

      // Accept common shapes: { errors: { field: 'msg' } } or { errors: [{ field, message }] }
      const errorsObj = data?.errors;
      if (errorsObj && typeof errorsObj === 'object' && !Array.isArray(errorsObj)) {
        for (const key of Object.keys(errorsObj)) {
          const val = errorsObj[key];
          if (val) fieldErrors.push({ name: key, errors: [String(val)] });
        }
      } else if (Array.isArray(errorsObj)) {
        for (const entry of errorsObj) {
          const field = entry?.field || entry?.path || entry?.name;
          const msg = entry?.message || entry?.msg || entry?.error;
          if (field && msg) fieldErrors.push({ name: String(field), errors: [String(msg)] });
        }
      }

      // Also support { success:false, error:"...", details:[{ field, message }] }
      const detailsArr = data?.details;
      if (Array.isArray(detailsArr)) {
        for (const entry of detailsArr) {
          const field = entry?.field || entry?.path || entry?.name;
          const rawMsg = entry?.message || entry?.msg || entry?.error;
          if (field && rawMsg) {
            fieldErrors.push({ name: String(field), errors: [String(rawMsg)] });
          }
        }
      }

      if (fieldErrors.length > 0) {
        form.setFields(fieldErrors as any);
      }

      const summaryFromDetails = Array.isArray(detailsArr)
        ? `Validation failed: ${detailsArr.map((d: any) => {
            const f = d?.field || d?.path || d?.name;
            const raw = d?.message || d?.msg || d?.error;
            return `${f}: ${raw}`;
          }).join('; ')}`
        : undefined;
      const generalMessage = summaryFromDetails || data?.message || data?.error || ax?.message || 'Save failed';
      message.error(generalMessage);
      setSubmitError(generalMessage);
    } finally { setLoading(false); }
  };

  return (
    <Card title={isEdit ? 'Edit Movement' : 'New Movement'}>
      {submitError && (
        <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Movement Type" name="movementType" rules={[{ required: true }]}>
          <Select
            placeholder="Select movement type"
            options={MOVEMENT_TYPES}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        
        <Form.Item label="Quantity" name="quantity" rules={[{ required: true, type: 'number', min: 1 }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item label="Reason Text" name="reasonText">
          <Input placeholder="Enter reason for movement" />
        </Form.Item>
        
        <Form.Item label="Reference Text" name="referenceText">
          <Input placeholder="Enter reference information" />
        </Form.Item>
        
        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={3} placeholder="Enter additional notes" />
        </Form.Item>
        
        <Form.Item label="Item" name="itemId" rules={[{ required: true }]}>
          <Select
            placeholder="Select an item"
            options={items.map(item => ({ 
              label: `${item.name} (${item.sku})`, 
              value: item.id 
            }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        
        <Form.Item label={`User (${users.length} available)`} name="userId" rules={[{ required: true }]}>
          <Select
            placeholder={usersLoading ? "Loading users..." : users.length === 0 ? "No users available from API" : "Select a user"}
            options={users.map(user => {
              console.log('User option:', user); // Debug log
              const displayName = `${user.firstname} ${user.lastname}`.trim() || user.username || `User ${user.id}`;
              return { 
                label: displayName, 
                value: user.id 
              };
            })}
            showSearch
            optionFilterProp="label"
            notFoundContent="No users found"
            disabled={usersLoading || users.length === 0}
            loading={usersLoading}
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/movements')}>
              Return to Movements List
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
