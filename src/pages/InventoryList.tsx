import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { deleteItem, listItems } from '../api/inventory';
import type { InventoryItem } from '../types/inventory';

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listItems();
        setItems(data);
      } catch (err) {
        message.error('Failed to load items');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search by name or SKU" onSearch={setQuery} allowClear style={{ maxWidth: 360 }} />
        <Button type="primary" onClick={() => navigate('/items/new')}>New Item</Button>
      </Flex>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'SKU', dataIndex: 'sku' },
          { title: 'Quantity', dataIndex: 'quantity' },
          { title: 'Price', dataIndex: 'price', render: (v: number) => `$${v.toFixed(2)}` },
          {
            title: 'Actions',
            render: (_: any, record: InventoryItem) => (
              <Flex gap="small">
                <Link to={`/items/${record.id}/edit`}>Edit</Link>
                <Popconfirm title="Delete item?" onConfirm={async () => {
                  try {
                    await deleteItem(record.id);
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
