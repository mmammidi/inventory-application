import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem, getItem, updateItem } from '../api/inventory';
import type { InventoryItemInput } from '../types/inventory';
import type { Category } from '../types/category';
import { listCategories } from '../api/categories';
import type { Supplier } from '../types/supplier';
import { listSuppliers } from '../api/suppliers';

export default function InventoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form] = Form.useForm<InventoryItemInput>();
  const navigate = useNavigate();

  useEffect(() => {
    // Load categories for dropdown
    (async () => {
      try {
        const cats = await listCategories();
        setCategories(cats);
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Failed to load categories');
      }
    })();

    // Load suppliers for dropdown
    (async () => {
      try {
        const sups = await listSuppliers();
        setSuppliers(sups);
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Failed to load suppliers');
      }
    })();

    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getItem(id);
        form.setFieldsValue({
          name: data.name,
          sku: data.sku,
          quantity: data.quantity,
          price: data.price,
          cost: data.cost ?? 0,
          minQuantity: data.minQuantity ?? 0,
          unit: data.unit ?? '',
          categoryId: data.categoryId ?? '',
          supplierId: data.supplierId ?? ''
        });
      } catch {
        message.error('Failed to load item');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, form]);

  const onFinish = async (values: InventoryItemInput) => {
    try {
      setLoading(true);
      setSubmitError(null);
      if (isEdit && id) {
        await updateItem(id, values);
        message.success('Item updated');
      } else {
        await createItem(values);
        message.success('Item created');
      }
      navigate('/items');
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
            const msg = String(field).toLowerCase() === 'sku' ? 'invalid sku' : String(rawMsg);
            fieldErrors.push({ name: String(field), errors: [msg] });
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
            const m = String(f).toLowerCase() === 'sku' ? 'invalid sku' : raw;
            return `${f}: ${m}`;
          }).join('; ')}`
        : undefined;
      const generalMessage = summaryFromDetails || data?.message || data?.error || ax?.message || 'Save failed';
      message.error(generalMessage);
      setSubmitError(generalMessage);
    } finally { setLoading(false); }
  };

  return (
    <Card title={isEdit ? 'Edit Item' : 'New Item'}>
      {submitError && (
        <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="SKU" name="sku" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Quantity" name="quantity" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Price" name="price" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} prefix="$" step={0.01} />
        </Form.Item>
        <Form.Item label="Cost" name="cost" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} prefix="$" step={0.01} />
        </Form.Item>
        <Form.Item label="Min Quantity" name="minQuantity" rules={[{ required: true, type: 'number', min: 0 }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Unit" name="unit" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Category" name="categoryId" rules={[{ required: true }]}> 
          <Select
            placeholder="Select a category"
            options={categories.map(c => ({ label: c.name, value: c.id }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item label="Supplier" name="supplierId" rules={[{ required: true }]}> 
          <Select
            placeholder="Select a supplier"
            options={suppliers.map(s => ({ label: s.name, value: s.id }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/items')}>
              Return to Items List
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
