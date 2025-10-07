import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, Typography, message, Card, Space, Tag, Statistic, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { deleteItem, listItems } from '../api/inventory';
import type { InventoryItem } from '../types/inventory';

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await listItems();
      setItems(data);
      // Debug: log fetched count and first item shape
      // eslint-disable-next-line no-console
      console.log('Fetched items:', Array.isArray(data) ? data.length : 0, data?.[0]);
    } catch (err) {
      message.error('Failed to load items');
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
      i.sku.toLowerCase().includes(q)
    );
  }, [items, query]);

  const totalValue = useMemo(() => {
    return filtered.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [filtered]);

  const lowStockItems = useMemo(() => {
    return filtered.filter(item => item.quantity <= (item.minQuantity || 0));
  }, [filtered]);

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
              <ShoppingCartOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
              Inventory Items
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: '1rem' }}>
              Manage your inventory items and track stock levels
            </Typography.Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/items/new')}
            style={{
              background: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              borderRadius: 'var(--radius-md)',
              height: '40px',
              padding: '0 24px',
              fontWeight: 500
            }}
          >
            Add New Item
          </Button>
        </Flex>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Total Items"
                value={filtered.length}
                valueStyle={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 600 }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Total Value"
                value={totalValue}
                precision={2}
                prefix="$"
                valueStyle={{ color: 'var(--success-color)', fontSize: '1.5rem', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Low Stock"
                value={lowStockItems.length}
                valueStyle={{ color: lowStockItems.length > 0 ? 'var(--error-color)' : 'var(--text-secondary)', fontSize: '1.5rem', fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Avg. Price"
                value={filtered.length > 0 ? filtered.reduce((sum, item) => sum + item.price, 0) / filtered.length : 0}
                precision={2}
                prefix="$"
                valueStyle={{ color: 'var(--warning-color)', fontSize: '1.5rem', fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Actions */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap="16px">
            <Input.Search 
              placeholder="Search by name or SKU..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              onSearch={setQuery} 
              allowClear 
              size="large"
              prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
              style={{ 
                maxWidth: 400,
                borderRadius: 'var(--radius-md)'
              }} 
            />
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchItems} 
                loading={loading}
                size="large"
                style={{ borderRadius: 'var(--radius-md)' }}
              >
                Refresh
              </Button>
            </Space>
          </Flex>
        </Card>
      </div>

      {/* Items Table */}
      <Card 
        style={{ 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey={(record: InventoryItem) => record.id || record.sku}
          loading={loading}
          dataSource={filtered}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            style: { padding: '16px 24px' }
          }}
          locale={{ emptyText: 'No items found' }}
          columns={[
            { 
              title: 'Item Details', 
              dataIndex: 'name',
              render: (name: string, record: InventoryItem) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {name}
                  </div>
                  <Tag color="blue" style={{ fontSize: '0.75rem' }}>
                    {record.sku}
                  </Tag>
                </div>
              )
            },
            { 
              title: 'Stock Level', 
              dataIndex: 'quantity',
              render: (quantity: number, record: InventoryItem) => {
                const isLowStock = quantity <= (record.minQuantity || 0);
                return (
                  <div>
                    <div style={{ 
                      fontWeight: 600, 
                      color: isLowStock ? 'var(--error-color)' : 'var(--text-primary)',
                      fontSize: '1.1rem'
                    }}>
                      {quantity}
                    </div>
                    {isLowStock && (
                      <Tag color="red" size="small">Low Stock</Tag>
                    )}
                  </div>
                );
              }
            },
            { 
              title: 'Price', 
              dataIndex: 'price', 
              render: (price: number) => (
                <div style={{ fontWeight: 600, color: 'var(--success-color)', fontSize: '1.1rem' }}>
                  ${price.toFixed(2)}
                </div>
              )
            },
            {
              title: 'Actions',
              render: (_: any, record: InventoryItem) => (
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/items/${record.id}/edit`)}
                    style={{ color: 'var(--primary-color)' }}
                  >
                    Edit
                  </Button>
                  <Popconfirm 
                    title="Delete this item?" 
                    description="This action cannot be undone."
                    onConfirm={async () => {
                      try {
                        await deleteItem(record.id);
                        setItems(prev => prev.filter(i => i.id !== record.id));
                        message.success('Item deleted successfully');
                      } catch {
                        message.error('Failed to delete item');
                      }
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                  >
                    <Button 
                      type="text" 
                      icon={<DeleteOutlined />}
                      danger
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}
