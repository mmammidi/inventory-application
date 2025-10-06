import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { deleteMovement, listMovements } from '../api/movements';
import type { Movement } from '../types/movement';

export default function MovementList() {
  const [items, setItems] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await listMovements();
      setItems(data);
    } catch (err) {
      message.error('Failed to load movements');
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
      i.movementType.toLowerCase().includes(q) ||
      (i.reasonText?.toLowerCase().includes(q) ?? false) ||
      (i.referenceText?.toLowerCase().includes(q) ?? false) ||
      (i.notes?.toLowerCase().includes(q) ?? false) ||
      (i.item?.name.toLowerCase().includes(q) ?? false) ||
      (i.user?.name.toLowerCase().includes(q) ?? false)
    );
  }, [items, query]);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Movements List</Typography.Title>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search movements" value={query} onChange={(e) => setQuery(e.target.value)} onSearch={setQuery} allowClear style={{ maxWidth: 360 }} />
        <Flex gap="small">
          <Button onClick={fetchItems} loading={loading}>Refresh</Button>
          <Button type="primary" onClick={() => navigate('/movements/new')}>New Movement</Button>
        </Flex>
      </Flex>
      <Table
        rowKey={(record: Movement) => record.id}
        loading={loading}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No movements found' }}
        columns={[
          { title: 'MovementType', dataIndex: 'movementType' },
          { title: 'Quantity', dataIndex: 'quantity' },
          { title: 'ReasonText', dataIndex: 'reasonText' },
          { title: 'ReferenceText', dataIndex: 'referenceText' },
          { title: 'Notes', dataIndex: 'notes' },
          { title: 'Item', dataIndex: ['item', 'name'], render: (_, record) => record.item?.name || '' },
          { title: 'User', dataIndex: ['user', 'name'], render: (_, record) => record.user?.name || '' },
          {
            title: 'Actions',
            render: (_: any, record: Movement) => (
              <Flex gap="small">
                <Link to={`/movements/${record.id}/edit`}>Edit</Link>
                <Popconfirm title="Delete movement?" onConfirm={async () => {
                  try {
                    await deleteMovement(record.id);
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
