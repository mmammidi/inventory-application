import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { createSupplier, getSupplier, updateSupplier } from '../api/suppliers';

interface SupplierInput { name: string; contactName?: string; email?: string; phone?: string; address?: string }

export default function SupplierForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form] = Form.useForm<SupplierInput>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getSupplier(id);
        form.setFieldsValue({ name: data.name, contactName: data.contactName, email: data.email, phone: data.phone, address: data.address });
      } catch {
        message.error('Failed to load supplier');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, form]);

  const onFinish = async (values: SupplierInput) => {
    try {
      setLoading(true);
      setSubmitError(null);
      if (isEdit && id) {
        await updateSupplier(id, values);
        message.success('Supplier updated');
      } else {
        await createSupplier(values);
        message.success('Supplier created');
      }
      navigate('/suppliers');
    } catch (err) {
      const ax = err as AxiosError<any>;
      const data = ax?.response?.data as any;
      const detailsArr = data?.details;
      const summaryFromDetails = Array.isArray(detailsArr)
        ? `Validation failed: ${detailsArr.map((d: any) => `${d.field || d.name}: ${d.message || d.error}`).join('; ')}`
        : undefined;
      const generalMessage = summaryFromDetails || data?.message || data?.error || ax?.message || 'Save failed';
      message.error(generalMessage);
      setSubmitError(generalMessage);
    } finally { setLoading(false); }
  };

  return (
    <Card title={isEdit ? 'Edit Supplier' : 'New Supplier'}>
      {submitError && (
        <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="ContactName" name="contactName"> 
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email"> 
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone"> 
          <Input />
        </Form.Item>
        <Form.Item label="Address" name="address"> 
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>Save</Button>
          <Button onClick={() => navigate('/suppliers')}>Supplier List</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}


