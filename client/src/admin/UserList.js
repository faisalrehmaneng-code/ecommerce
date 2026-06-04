import React, { useEffect, useState } from 'react';
import { fetchAllUsers } from '../api'; // Adjust path
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // --- FETCH USERS ---
    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await fetchAllUsers(currentPage);
            setUsers(data.users || []);
            setTotalPages(data.totalPages || 1);
            setTotalUsers(data.count || 0);
        } catch (error) {
            console.error("Failed to load users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    // Helper to format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Helper for Role Badge
    const getRoleBadge = (role) => {
        switch (role) {
            case 'ROLE ADMIN': return 'bg-danger';
            case 'ROLE MERCHANT': return 'bg-warning text-dark';
            default: return 'bg-secondary'; // ROLE MEMBER
        }
    };

    return (
        <div className="admin-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">Users</h2>
                    <p className="text-muted small mb-0">Total Registered: {totalUsers}</p>
                </div>
                {/* Optional: Add Search Bar here later using /user/search API */}
            </div>

            <div className="table-responsive bg-white rounded shadow-sm border">
                <table className="table table-hover mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="py-3 ps-4">Name</th>
                            <th className="py-3">Email</th>
                            <th className="py-3">Role</th>
                            <th className="py-3">Provider</th>
                            <th className="py-3">Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            // Skeleton Loading
                            [...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    <td className="ps-4"><Skeleton width={150} /></td>
                                    <td><Skeleton width={200} /></td>
                                    <td><Skeleton width={100} /></td>
                                    <td><Skeleton width={80} /></td>
                                    <td><Skeleton width={120} /></td>
                                </tr>
                            ))
                        ) : users.length > 0 ? (
                            users.map((user, index) => (
                                <tr key={index}> {/* Using index fallback since backend might exclude _id based on query */}
                                    <td className="ps-4 fw-bold text-dark">
                                        {user.firstName} {user.lastName}
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge rounded-pill ${getRoleBadge(user.role)} px-3`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{user.provider}</td>
                                    <td className="text-muted small">
                                        {formatDate(user.created)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-muted">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4 gap-2">
                    <button
                        className="btn btn-outline-dark btn-sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </button>
                    <span className="align-self-center text-muted small">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="btn btn-outline-dark btn-sm"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserList;