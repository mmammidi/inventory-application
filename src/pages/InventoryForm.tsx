import { useEffect, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createItem, getItem, updateItem } from '../api/inventory';
import type { InventoryItemInput } from '../types/inventory';

export default function InventoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<InventoryItemInput>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getItem(id);
        form.setFieldsValue({
          name: data.name,
          sku: data.sku,
          quantity: data.quantity,
          price: data.price
        });
      } catch {
        message.error('Failed to load item');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, form]);

  const onFinish = async (values: InventoryItemInput) => {
    try {
      setLoading(true);
      if (isEdit && id) {
        await updateItem(id, values);
        message.success('Item updated');
      } else {
        await createItem(values);
        message.success('Item created');
      }
      navigate('/items');
    } catch {
      message.error('Save failed');
    } finally { setLoading(false); }
  };

  return (
    <Card title={isEdit ? 'Edit Item' : 'New Item'}>
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
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
