import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { deleteCategory, listCategories } from '../api/categories';
import type { Category } from '../types/category';

export default function CategoryList() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await listCategories();
      setItems(data);
    } catch (err) {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => i.name.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Categories List</Typography.Title>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} onSearch={setQuery} allowClear style={{ maxWidth: 360 }} />
        <Flex gap="small">
          <Button onClick={fetchItems} loading={loading}>Refresh</Button>
          <Button type="primary" onClick={() => navigate('/categories/new')}>New Category</Button>
        </Flex>
      </Flex>
      <Table
        rowKey={(record: Category) => record.id}
        loading={loading}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No categories found' }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Description', dataIndex: 'description' },
          {
            title: 'Actions',
            render: (_: any, record: Category) => (
              <Flex gap="small">
                <Link to={`/categories/${record.id}/edit`}>Edit</Link>
                <Popconfirm title="Delete category?" onConfirm={async () => {
                  try {
                    await deleteCategory(record.id);
                    setItems(prev => prev.filter(i => i.id !== record.id));
                    message.success('Deleted');
                  } catch {
                    message.error('Delete failed');
                  }
                }}>
                  <a>Delete</a>
                </Popconfirm>
              </Flex>
            )
          }
        ]}
      />
    </div>
  );
}


