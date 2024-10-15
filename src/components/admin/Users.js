import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '../../firebase';
import { ref, get, update } from 'firebase/database';
import UserModal from './UserModal';
import { useAuth } from '../../hooks/useAuth';
import { useTable, usePagination, useGlobalFilter, useSortBy } from 'react-table';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: currentUser } = useAuth();

  const handleViewUser = useCallback((user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedUser(null);
  }, []);

  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Role', accessor: 'role' },
      {
        Header: 'Status',
        accessor: 'isActive',
        Cell: ({ value }) => (
          <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <button 
            className="text-blue-600 hover:text-blue-900"
            onClick={() => handleViewUser(row.original)}
          >
            View
          </button>
        ),
      },
    ],
    [handleViewUser]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = useTable(
    { columns, data: users, initialState: { pageIndex: 0, pageSize: 10 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const usersData = [];
          snapshot.forEach((childSnapshot) => {
            const userId = childSnapshot.key;
            const userData = childSnapshot.val();
            if (!currentUser || userId !== currentUser.uid) {
              usersData.push({
                id: userId,
                ...userData
              });
            }
          });
          setUsers(usersData);
        } else {
          setUsers([]);
        }
      } catch (err) {
        setError('Failed to fetch users');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleDeactivateUser = async (userId, currentStatus) => {
    try {
      await update(ref(db, `users/${userId}`), {
        isActive: !currentStatus
      });
      setUsers(users.map(user => 
        user.id === userId ? {...user, isActive: !currentStatus} : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await update(ref(db, `users/${userId}`), {
        role: newRole
      });
      setUsers(users.map(user => 
        user.id === userId ? {...user, role: newRole} : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <input
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value)}
          placeholder="Search users..."
          className="p-2 border rounded"
        />
      </div>
      <table {...getTableProps()} className="min-w-full bg-surface">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()} className="bg-background text-text uppercase text-sm leading-normal">
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())} className="py-3 px-6 text-left">
                  {column.render('Header')}
                  <span>
                    {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="text-gray-600 text-sm font-light">
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="border-b border-gray-200 hover:bg-gray-100">
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()} className="py-3 px-6 text-left whitespace-nowrap">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination mt-4 flex justify-between items-center">
        <div>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="mr-2">
            {'<<'}
          </button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="mr-2">
            {'<'}
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="mr-2">
            {'>'}
          </button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="mr-2">
            {'>>'}
          </button>
        </div>
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
        <select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
          className="p-2 border rounded"
        >
          {pageOptions.map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show
            </option>
          ))}
        </select>
      </div>
      
      {isModalOpen && selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDeactivate={handleDeactivateUser}
          onChangeRole={handleChangeRole}
        />
      )}
    </div>
  );
}

export default Users;
