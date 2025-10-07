import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, Typography, message, Card, Space, Tag, Statistic, Row, Col } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined, SearchOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SwapOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
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

  const totalMovements = useMemo(() => {
    return filtered.length;
  }, [filtered]);

  const inMovements = useMemo(() => {
    return filtered.filter(m => m.movementType?.toLowerCase().includes('in') || m.quantity > 0);
  }, [filtered]);

  const outMovements = useMemo(() => {
    return filtered.filter(m => m.movementType?.toLowerCase().includes('out') || m.quantity < 0);
  }, [filtered]);

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <Flex justify="space-between" align="center" style={{ marginBottom: '24px' }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
              <SwapOutlined style={{ marginRight: '12px', color: 'var(--primary-color)' }} />
              Inventory Movements
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: '1rem' }}>
              Track all inventory movements and stock changes
            </Typography.Text>
          </div>
          <Button 
            type="primary" 
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate('/movements/new')}
            style={{
              background: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              borderRadius: 'var(--radius-md)',
              height: '40px',
              padding: '0 24px',
              fontWeight: 500
            }}
          >
            New Movement
          </Button>
        </Flex>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Total Movements"
                value={totalMovements}
                valueStyle={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 600 }}
                prefix={<SwapOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Stock In"
                value={inMovements.length}
                valueStyle={{ color: 'var(--success-color)', fontSize: '1.5rem', fontWeight: 600 }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Stock Out"
                value={outMovements.length}
                valueStyle={{ color: 'var(--error-color)', fontSize: '1.5rem', fontWeight: 600 }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <Statistic
                title="Net Change"
                value={filtered.reduce((sum, m) => sum + m.quantity, 0)}
                valueStyle={{ 
                  color: filtered.reduce((sum, m) => sum + m.quantity, 0) >= 0 ? 'var(--success-color)' : 'var(--error-color)', 
                  fontSize: '1.5rem', 
                  fontWeight: 600 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Actions */}
        <Card style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <Flex justify="space-between" align="center" wrap="wrap" gap="16px">
            <Input.Search 
              placeholder="Search movements..." 
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

      {/* Movements Table */}
      <Card 
        style={{ 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey={(record: Movement) => record.id}
          loading={loading}
          dataSource={filtered}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} movements`,
            style: { padding: '16px 24px' }
          }}
          locale={{ emptyText: 'No movements found' }}
          columns={[
            { 
              title: 'Movement Type', 
              dataIndex: 'movementType',
              render: (type: string) => (
                <Tag 
                  color={type?.toLowerCase().includes('in') ? 'green' : type?.toLowerCase().includes('out') ? 'red' : 'blue'}
                  style={{ fontWeight: 500 }}
                >
                  {type}
                </Tag>
              )
            },
            { 
              title: 'Quantity', 
              dataIndex: 'quantity',
              render: (quantity: number) => (
                <div style={{ 
                  fontWeight: 600, 
                  color: quantity > 0 ? 'var(--success-color)' : quantity < 0 ? 'var(--error-color)' : 'var(--text-primary)',
                  fontSize: '1.1rem'
                }}>
                  {quantity > 0 ? '+' : ''}{quantity}
                </div>
              )
            },
            { 
              title: 'Reason', 
              dataIndex: 'reasonText',
              render: (reason: string) => reason || '-'
            },
            { 
              title: 'Reference', 
              dataIndex: 'referenceText',
              render: (reference: string) => reference || '-'
            },
            { 
              title: 'Item', 
              dataIndex: ['item', 'name'],
              render: (itemName: string, record: Movement) => (
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {itemName || 'Unknown Item'}
                  </div>
                  {record.item?.sku && (
                    <Tag color="blue" size="small">{record.item.sku}</Tag>
                  )}
                </div>
              )
            },
            { 
              title: 'User', 
              dataIndex: ['user', 'name'],
              render: (userName: string) => userName || 'Unknown User'
            },
            {
              title: 'Actions',
              render: (_: any, record: Movement) => (
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/movements/${record.id}/edit`)}
                    style={{ color: 'var(--primary-color)' }}
                  >
                    Edit
                  </Button>
                  <Popconfirm 
                    title="Delete this movement?" 
                    description="This action cannot be undone."
                    onConfirm={async () => {
                      try {
                        await deleteMovement(record.id);
                        setItems(prev => prev.filter(i => i.id !== record.id));
                        message.success('Movement deleted successfully');
                      } catch {
                        message.error('Failed to delete movement');
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
