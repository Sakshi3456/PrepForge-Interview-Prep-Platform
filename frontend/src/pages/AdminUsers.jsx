import { useEffect, useState } from "react";
import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  const updateRole = async (id, role) => {
    await api.put(`/admin/users/${id}/role?role=${role}`);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users 👥</h1>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3 font-semibold">{user.role}</td>

                <td className="p-3 flex gap-2">
                  {user.role === "USER" ? (
                    <button
                      onClick={() => updateRole(user.id, "ADMIN")}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Make Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => updateRole(user.id, "USER")}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Make User
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(user.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;