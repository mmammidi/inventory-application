import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, InputNumber, Select, message, Space, Typography, Divider, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, ShoppingCartOutlined } from '@ant-design/icons';
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
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Typography.Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
          <ShoppingCartOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
          {isEdit ? 'Edit Item' : 'Create New Item'}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '1rem' }}>
          {isEdit ? 'Update item information and inventory details' : 'Add a new item to your inventory'}
        </Typography.Text>
      </div>

      <Card 
        style={{ 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {submitError && (
          <Alert 
            type="error" 
            showIcon 
            message={submitError} 
            style={{ 
              marginBottom: 24,
              borderRadius: 'var(--radius-md)'
            }} 
          />
        )}
        
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish}
          size="large"
          style={{ maxWidth: 800 }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Item Name</span>} 
                name="name" 
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input 
                  placeholder="Enter item name"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>SKU</span>} 
                name="sku" 
                rules={[{ required: true, message: 'Please enter SKU' }]}
              >
                <Input 
                  placeholder="Enter SKU"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Current Quantity</span>} 
                name="quantity" 
                rules={[{ required: true, type: 'number', min: 0, message: 'Please enter valid quantity' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Selling Price</span>} 
                name="price" 
                rules={[{ required: true, type: 'number', min: 0, message: 'Please enter valid price' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  prefix="$" 
                  step={0.01}
                  placeholder="0.00"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Cost Price</span>} 
                name="cost" 
                rules={[{ required: true, type: 'number', min: 0, message: 'Please enter valid cost' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  prefix="$" 
                  step={0.01}
                  placeholder="0.00"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Minimum Quantity</span>} 
                name="minQuantity" 
                rules={[{ required: true, type: 'number', min: 0, message: 'Please enter minimum quantity' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="0"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Unit</span>} 
                name="unit" 
                rules={[{ required: true, message: 'Please enter unit' }]}
              >
                <Input 
                  placeholder="e.g., pcs, kg, lbs"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />

          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Category</span>} 
                name="categoryId" 
                rules={[{ required: true, message: 'Please select a category' }]}
              > 
                <Select
                  placeholder="Select a category"
                  options={categories.map(c => ({ label: c.name, value: c.id }))}
                  showSearch
                  optionFilterProp="label"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item 
                label={<span style={{ fontWeight: 500 }}>Supplier</span>} 
                name="supplierId" 
                rules={[{ required: true, message: 'Please select a supplier' }]}
              > 
                <Select
                  placeholder="Select a supplier"
                  options={suppliers.map(s => ({ label: s.name, value: s.id }))}
                  showSearch
                  optionFilterProp="label"
                  style={{ borderRadius: 'var(--radius-md)' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '32px 0' }} />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space size="large">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                style={{
                  background: 'var(--primary-color)',
                  borderColor: 'var(--primary-color)',
                  borderRadius: 'var(--radius-md)',
                  height: '44px',
                  padding: '0 32px',
                  fontWeight: 500
                }}
              >
                {isEdit ? 'Update Item' : 'Create Item'}
              </Button>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/items')}
                size="large"
                style={{
                  borderRadius: 'var(--radius-md)',
                  height: '44px',
                  padding: '0 24px'
                }}
              >
                Return to Items List
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
