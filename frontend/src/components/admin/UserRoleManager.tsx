import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { api } from '../../lib/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'employee' | 'client';
  company?: string;
  created_at: string;
}

export const UserRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'employee' | 'client') => {
    setUpdating(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">Loading users...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">User Role Management</h3>
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <h4 className="font-medium">
                    {user.first_name} {user.last_name}
                  </h4>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.company && (
                    <p className="text-sm text-gray-500">{user.company}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
              
              <div className="flex gap-2">
                {user.role !== 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserRole(user.id, 'admin')}
                    disabled={updating === user.id}
                  >
                    {updating === user.id ? 'Updating...' : 'Make Admin'}
                  </Button>
                )}
                
                {user.role !== 'employee' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserRole(user.id, 'employee')}
                    disabled={updating === user.id}
                  >
                    {updating === user.id ? 'Updating...' : 'Make Employee'}
                  </Button>
                )}
                
                {user.role !== 'client' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateUserRole(user.id, 'client')}
                    disabled={updating === user.id}
                  >
                    {updating === user.id ? 'Updating...' : 'Make Client'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
