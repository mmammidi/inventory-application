import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

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
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 600 }}>Inventory Management</div>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              { key: 'items', label: <Link to="/items">Items</Link> },
              { key: 'categories', label: <Link to="/categories">Categories</Link> },
              { key: 'suppliers', label: <Link to="/suppliers">Suppliers</Link> },
              { key: 'movements', label: <Link to="/movements">Movements</Link> },
              { key: 'users', label: <Link to="/users">Users</Link> }
            ]}
          />
        </Sider>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
      <Footer style={{ textAlign: 'center' }}>Inventory Management Â©2025</Footer>
    </Layout>
  );
}
