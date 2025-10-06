import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { createCategory, getCategory, updateCategory } from '../api/categories';

interface CategoryInput { name: string; description?: string; status?: string | boolean }

export default function CategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form] = Form.useForm<CategoryInput>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getCategory(id);
        form.setFieldsValue({ name: data.name, description: data.description, status: data.status });
      } catch {
        message.error('Failed to load category');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, form]);

  const onFinish = async (values: CategoryInput) => {
    try {
      setLoading(true);
      setSubmitError(null);
      if (isEdit && id) {
        await updateCategory(id, values);
        message.success('Category updated');
      } else {
        await createCategory(values);
        message.success('Category created');
      }
      navigate('/categories');
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
    <Card title={isEdit ? 'Edit Category' : 'New Category'}>
      {submitError && (
        <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Description" name="description">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>Save</Button>
          <Button onClick={() => navigate('/categories')}>Category List</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}


