import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllUsers, getAllUsers } from "../../store/slices/user";

const UserList: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading, error, pagination } = useSelector((state: any) => state.users);

  useEffect(() => {
    dispatch(fetchAllUsers({ page: pagination.page, page_size: pagination.limit }));
  }, [dispatch, pagination.page, pagination.limit]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">User List</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user: any, idx: number) => (
            <tr key={user.id || idx}>
              <td className="border px-2 py-1">{idx + 1}</td>
              <td className="border px-2 py-1">{user.name || user.full_name || "-"}</td>
              <td className="border px-2 py-1">{user.email || "-"}</td>
              <td className="border px-2 py-1">{user.is_active ? "Active" : "Inactive"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination (basic) */}
      <div className="mt-4 flex gap-2">
        <button
          disabled={pagination.page <= 1}
          onClick={() => dispatch({ type: "users/setCurrentPage", payload: pagination.page - 1 })}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>Page {pagination.page} of {pagination.totalPages}</span>
        <button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => dispatch({ type: "users/setCurrentPage", payload: pagination.page + 1 })}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default UserList;
