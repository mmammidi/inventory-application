import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { deleteSupplier, listSuppliers } from '../api/suppliers';
import type { Supplier } from '../types/supplier';

export default function SupplierList() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await listSuppliers();
      setItems(data);
    } catch (err) {
      message.error('Failed to load suppliers');
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
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.contactName?.toLowerCase().includes(q) ?? false) ||
      (i.email?.toLowerCase().includes(q) ?? false) ||
      (i.phone?.toLowerCase().includes(q) ?? false) ||
      (i.address?.toLowerCase().includes(q) ?? false)
    );
  }, [items, query]);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Suppliers List</Typography.Title>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} onSearch={setQuery} allowClear style={{ maxWidth: 360 }} />
        <Flex gap="small">
          <Button onClick={fetchItems} loading={loading}>Refresh</Button>
          <Button type="primary" onClick={() => navigate('/suppliers/new')}>New Supplier</Button>
        </Flex>
      </Flex>
      <Table
        rowKey={(record: Supplier) => record.id}
        loading={loading}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No suppliers found' }}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'ContactName', dataIndex: 'contactName' },
          { title: 'Email', dataIndex: 'email' },
          { title: 'Phone', dataIndex: 'phone' },
          { title: 'Address', dataIndex: 'address' },
          {
            title: 'Actions',
            render: (_: any, record: Supplier) => (
              <Flex gap="small">
                <Link to={`/suppliers/${record.id}/edit`}>Edit</Link>
                <Popconfirm title="Delete supplier?" onConfirm={async () => {
                  try {
                    await deleteSupplier(record.id);
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


