import { Layout, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

export default function AppLayout() {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith('/items') ? 'items' : 'home';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>Inventory</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[
            { key: 'home', label: <Link to="/">Dashboard</Link> },
            { key: 'items', label: <Link to="/items">Items</Link> }
          ]}
        />
      </Header>
      <Content style={{ padding: 24, height: '100%' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center' }}>Inventory Management Â©2025</Footer>
    </Layout>
  );
}
