import { Layout, Menu, Avatar, Badge } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  TagsOutlined, 
  ShopOutlined, 
  SwapOutlined,
  DashboardOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

export default function AppLayout() {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith('/items')
    ? 'items'
    : location.pathname.startsWith('/categories')
      ? 'categories'
      : location.pathname.startsWith('/suppliers')
        ? 'suppliers'
        : location.pathname.startsWith('/movements')
          ? 'movements'
          : location.pathname.startsWith('/users')
            ? 'users'
            : 'items'; // Default to items instead of home

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--background-color)' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 24px',
        boxShadow: 'var(--shadow-md)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ 
          color: '#fff', 
          fontWeight: 700, 
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShoppingCartOutlined style={{ fontSize: '1.75rem' }} />
          Inventory Management
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Badge count={3} size="small">
            <BellOutlined style={{ color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }} />
          </Badge>
          <Avatar 
            size="small" 
            icon={<UserOutlined />} 
            style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          />
        </div>
      </Header>
      <Layout>
        <Sider 
          width={240} 
          style={{ 
            background: 'var(--surface-color)',
            boxShadow: 'var(--shadow-sm)',
            borderRight: '1px solid var(--border-color)'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ 
              border: 'none',
              background: 'transparent',
              padding: '16px 0'
            }}
            items={[
              { 
                key: 'items', 
                icon: <ShoppingCartOutlined />,
                label: <Link to="/items" style={{ fontWeight: 500 }}>Items</Link> 
              },
              { 
                key: 'categories', 
                icon: <TagsOutlined />,
                label: <Link to="/categories" style={{ fontWeight: 500 }}>Categories</Link> 
              },
              { 
                key: 'suppliers', 
                icon: <ShopOutlined />,
                label: <Link to="/suppliers" style={{ fontWeight: 500 }}>Suppliers</Link> 
              },
              { 
                key: 'movements', 
                icon: <SwapOutlined />,
                label: <Link to="/movements" style={{ fontWeight: 500 }}>Movements</Link> 
              },
              { 
                key: 'users', 
                icon: <UserOutlined />,
                label: <Link to="/users" style={{ fontWeight: 500 }}>Users</Link> 
              }
            ]}
          />
        </Sider>
        <Content style={{ 
          padding: '32px',
          background: 'var(--background-color)',
          minHeight: 'calc(100vh - 64px - 70px)'
        }}>
          <div style={{
            background: 'var(--surface-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            padding: '32px',
            minHeight: 'calc(100vh - 128px - 70px)'
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
      <Footer style={{ 
        textAlign: 'center', 
        background: 'var(--surface-color)',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        Inventory Management System ©2025 - Built with React & Ant Design
      </Footer>
    </Layout>
  );
}
