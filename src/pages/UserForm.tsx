import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Input, message, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, getUser, updateUser } from '../api/users';
import type { UserInput } from '../types/user';

export default function UserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form] = Form.useForm<UserInput>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getUser(id);
        form.setFieldsValue({
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email ?? '',
          username: data.username ?? ''
        });
      } catch {
        message.error('Failed to load user');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, form]);

  const onFinish = async (values: UserInput) => {
    try {
      setLoading(true);
      setSubmitError(null);
      
      // Transform form data to match API expectations
      const apiData = {
        firstName: values.firstname,
        lastName: values.lastname,
        email: values.email,
        username: values.username
      };
      
      if (isEdit && id) {
        await updateUser(id, apiData);
        message.success('User updated');
      } else {
        await createUser(apiData);
        message.success('User created');
      }
      navigate('/users');
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
    <Card title={isEdit ? 'Edit User' : 'New User'}>
      {submitError && (
        <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
      )}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="First Name" name="firstname" rules={[{ required: true }]}>
          <Input placeholder="Enter first name" />
        </Form.Item>
        
        <Form.Item label="Last Name" name="lastname" rules={[{ required: true }]}>
          <Input placeholder="Enter last name" />
        </Form.Item>
        
        <Form.Item label="Email" name="email">
          <Input type="email" placeholder="Enter email address" />
        </Form.Item>
        
        <Form.Item label="Username" name="username">
          <Input placeholder="Enter username" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>Save</Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
              Return to Users List
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
