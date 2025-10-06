import { useEffect, useMemo, useState } from 'react';
import { Button, Flex, Input, Popconfirm, Table, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { deleteUser, listUsers } from '../api/users';
import type { User } from '../types/user';

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await listUsers();
      console.log('Users loaded in UserList:', data); // Debug log
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err); // Debug log
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(user =>
      user.firstname.toLowerCase().includes(q) ||
      user.lastname.toLowerCase().includes(q) ||
      (user.email?.toLowerCase().includes(q) ?? false) ||
      (user.username?.toLowerCase().includes(q) ?? false)
    );
  }, [users, query]);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>Users List</Typography.Title>
      <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
        <Input.Search placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} onSearch={setQuery} allowClear style={{ maxWidth: 360 }} />
        <Flex gap="small">
          <Button onClick={fetchUsers} loading={loading}>Refresh</Button>
          <Button type="primary" onClick={() => navigate('/users/new')}>New User</Button>
        </Flex>
      </Flex>
      <Table
        rowKey={(record: User) => record.id}
        loading={loading}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'No users found' }}
        columns={[
          { title: 'First Name', dataIndex: 'firstname' },
          { title: 'Last Name', dataIndex: 'lastname' },
          { title: 'Email', dataIndex: 'email', render: (email) => email || '-' },
          { title: 'Username', dataIndex: 'username', render: (username) => username || '-' },
          {
            title: 'Actions',
            render: (_: any, record: User) => (
              <Flex gap="small">
                <Link to={`/users/${record.id}/edit`}>Edit</Link>
                <Popconfirm title="Delete user?" onConfirm={async () => {
                  try {
                    await deleteUser(record.id);
                    setUsers(prev => prev.filter(u => u.id !== record.id));
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
