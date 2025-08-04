import { useState, useEffect, useCallback, useRef } from "react";
import { getFeePostsByStudent, deleteFeePost, updateFeePostStatus } from "../api/Feepost";

// Define interfaces (matching your provided types)
export interface FeePost {
    student_id: string;
    title: string;
    other_fee: Record<string, number>;
    deadline: string;
    is_paid: boolean;
    mode: "online" | "offline";
    id: string;
    creation_date: string;
}

export interface FeePostResponse {
    total: number;
    offset: number;
    limit: number;
    items: FeePost[];
}

interface FeePostsListProps {
    studentId: string;
    className?: string;
}

interface UpdateStatusPayload {
    mode: "online" | "offline";
    is_paid: boolean;
}

interface UpdateModalData {
    postId: string;
    currentStatus: boolean;
    currentMode: "online" | "offline";
    title: string;
}

interface DeleteModalData {
    postId: string;
    title: string;
}

const FeePostsList: React.FC<FeePostsListProps> = ({ studentId, className }) => {
    const [feePosts, setFeePosts] = useState<FeePost[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateModalData, setUpdateModalData] = useState<UpdateModalData | null>(null);
    const [modalPayload, setModalPayload] = useState<UpdateStatusPayload>({ mode: "online", is_paid: false });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteModalData, setDeleteModalData] = useState<DeleteModalData | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const throttleTimeout = useRef<number | null>(null);

    const LIMIT = 10;

    // Throttled fetch function
    const throttledFetch = useCallback((currentOffset: number, reset = false) => {
        if (throttleTimeout.current) {
            clearTimeout(throttleTimeout.current);
        }

        throttleTimeout.current = setTimeout(async () => {
            setLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem("token") || "";
                const response = await getFeePostsByStudent(studentId, token, currentOffset, LIMIT);

                if (response.success && response.data) {
                    const { items, total: totalCount } = response.data;

                    setFeePosts(prev => reset ? items : [...prev, ...items]);
                    setTotal(totalCount);
                    setHasMore(currentOffset + items.length < totalCount);
                } else {
                    setError(response.message || "Failed to fetch fee posts");
                }
            } catch (err) {
                setError("Something went wrong while fetching fee posts");
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms throttle delay
    }, [studentId]);

    // Initial load
    useEffect(() => {
        throttledFetch(0, true);
        setOffset(0);
    }, [studentId, throttledFetch]);

    // Intersection observer for infinite scroll
    const lastPostRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                const newOffset = offset + LIMIT;
                setOffset(newOffset);
                throttledFetch(newOffset);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, offset, throttledFetch]);

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate total amount
    const calculateTotal = (otherFee: Record<string, number>) => {
        return Object.values(otherFee).reduce((sum, amount) => sum + amount, 0);
    };

    // Check if deadline has passed
    const isDeadlinePassed = (deadline: string) => {
        return new Date(deadline) < new Date();
    };

    // Handle delete click - shows confirmation modal
    const handleDeleteClick = (postId: string, title: string) => {
        setDeleteModalData({ postId, title });
        setShowDeleteModal(true);
    };

    // Handle confirmed delete
    const handleDeletePost = async () => {
        if (!deleteModalData) return;

        const postId = deleteModalData.postId;

        // Optimistic update - remove from UI immediately
        setDeletingIds(prev => new Set(prev).add(postId));
        setShowDeleteModal(false);

        try {
            const token = localStorage.getItem("token") || "";
            const response = await deleteFeePost(postId, token);

            if (response.success) {
                // Remove from state after successful deletion
                setFeePosts(prev => prev.filter(post => post.id !== postId));
                setTotal(prev => prev - 1);
                setDeleteError(null);

                // Show success message briefly
                setDeleteError("Post deleted successfully");
                setTimeout(() => setDeleteError(null), 3000);
            } else {
                // Revert optimistic update on failure
                setDeletingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(postId);
                    return newSet;
                });
                setDeleteError(response.message || "Failed to delete post");
                setTimeout(() => setDeleteError(null), 5000);
            }
        } catch (err) {
            // Revert optimistic update on error
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(postId);
                return newSet;
            });
            setDeleteError("Something went wrong while deleting the post");
            setTimeout(() => setDeleteError(null), 5000);
        } finally {
            setDeleteModalData(null);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteModalData(null);
    };

    // Handle update fee post status
    const handleUpdateStatus = (post: FeePost) => {
        if (post.is_paid) return; // Don't allow updates if already paid

        setUpdateModalData({
            postId: post.id,
            currentStatus: post.is_paid,
            currentMode: post.mode,
            title: post.title
        });
        setModalPayload({
            mode: post.mode,
            is_paid: post.is_paid
        });
        setShowUpdateModal(true);
    };

    // Confirm update status
    const confirmUpdateStatus = async () => {
        if (!updateModalData) return;

        setUpdatingIds(prev => new Set(prev).add(updateModalData.postId));
        setShowUpdateModal(false);

        try {
            await updateFeePostStatus(updateModalData.postId, modalPayload);

            // Update the fee post in state
            setFeePosts(prev => prev.map(post =>
                post.id === updateModalData.postId
                    ? { ...post, is_paid: modalPayload.is_paid, mode: modalPayload.mode }
                    : post
            ));

            setUpdateError("Status updated successfully");
            setTimeout(() => setUpdateError(null), 3000);
        } catch (err) {
            setUpdateError("Failed to update status");
            setTimeout(() => setUpdateError(null), 5000);
        } finally {
            setUpdatingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(updateModalData.postId);
                return newSet;
            });
            setUpdateModalData(null);
        }
    };

    // Cancel update
    const cancelUpdate = () => {
        setShowUpdateModal(false);
        setUpdateModalData(null);
        setModalPayload({ mode: "online", is_paid: false });
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Fee Posts ({total})
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {feePosts.length} of {total} posts
                </div>
            </div>

            {(error || deleteError || updateError) && (
                <div className="mb-6">
                    <div className={`p-4 rounded-md border ${(deleteError && deleteError.includes("successfully")) || (updateError && updateError.includes("successfully"))
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        }`}>
                        <div className="flex">
                            <div className="flex-shrink-0">
                                {((deleteError && deleteError.includes("successfully")) || (updateError && updateError.includes("successfully"))) ? (
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${((deleteError && deleteError.includes("successfully")) || (updateError && updateError.includes("successfully")))
                                    ? "text-green-800 dark:text-green-200"
                                    : "text-red-800 dark:text-red-200"
                                    }`}>
                                    {error || deleteError || updateError}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {feePosts.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No fee posts</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        No fee posts found for this student.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {feePosts.map((post, index) => {
                    const isLast = index === feePosts.length - 1;
                    const totalAmount = calculateTotal(post.other_fee);
                    const deadlinePassed = isDeadlinePassed(post.deadline);
                    const isUpdating = updatingIds.has(post.id);
                    const isDeleting = deletingIds.has(post.id);

                    return (
                        <div
                            key={post.id}
                            ref={isLast ? lastPostRef : null}
                            className={`bg-gray-50 dark:bg-blue-950 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all ${(isDeleting || isUpdating) ? 'opacity-50 pointer-events-none' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                        {post.title}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7h8M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
                                            </svg>
                                            Created: {formatDate(post.creation_date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Deadline: {formatDate(post.deadline)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${post.is_paid
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                            : deadlinePassed
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                            }`}>
                                            {post.is_paid ? 'Paid' : deadlinePassed ? 'Overdue' : 'Pending'}
                                        </div>

                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${post.mode === 'online'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                            }`}>
                                            {post.mode === 'online' ? 'Online' : 'Offline'}
                                        </div>
                                    </div>

                                    {/* Update Status Button */}
                                    <button
                                        onClick={() => handleUpdateStatus(post)}
                                        disabled={post.is_paid || isUpdating || isDeleting}
                                        className={`p-2 rounded-md transition-colors ${post.is_paid
                                            ? 'text-gray-400 cursor-not-allowed'
                                            : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                        title={post.is_paid ? "Already paid" : "Update status"}
                                    >
                                        {isUpdating ? (
                                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteClick(post.id, post.title)}
                                        disabled={isDeleting || isUpdating}
                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete post"
                                    >
                                        {isDeleting ? (
                                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Fee Breakdown:
                                    </h4>
                                    <div className="space-y-1">
                                        {Object.entries(post.other_fee).map(([feeType, amount]) => (
                                            <div key={feeType} className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                                    {feeType}:
                                                </span>
                                                <span className="font-medium text-gray-800 dark:text-gray-200">
                                                    ₹{amount.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="md:text-right">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Total Amount:
                                    </h4>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        ₹{totalAmount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="animate-spin h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Loading more posts...</span>
                    </div>
                </div>
            )}

            {!hasMore && feePosts.length > 0 && (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        You've reached the end of the list
                    </p>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && updateModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Update Fee Status
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Update the payment status for: <strong>{updateModalData.title}</strong>
                        </p>

                        <div className="space-y-4">
                            {/* Payment Status Toggle */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Payment Status
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setModalPayload(prev => ({ ...prev, is_paid: false }))}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${!modalPayload.is_paid
                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        Unpaid
                                    </button>
                                    <button
                                        onClick={() => setModalPayload(prev => ({ ...prev, is_paid: true }))}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalPayload.is_paid
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-300 dark:border-green-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        Paid
                                    </button>
                                </div>
                            </div>

                            {/* Payment Mode Toggle */}
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Payment Mode
                                </label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setModalPayload(prev => ({ ...prev, mode: "online" }))}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalPayload.mode === "online"
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-300 dark:border-blue-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        Online
                                    </button>
                                    <button
                                        onClick={() => setModalPayload(prev => ({ ...prev, mode: "offline" }))}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${modalPayload.mode === "offline"
                                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-600'
                                            }`}
                                    >
                                        Offline
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={cancelUpdate}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmUpdateStatus}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deleteModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete the fee post: <strong>{deleteModalData.title}</strong>? This action cannot be undone.
                        </p>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeletePost}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeePostsList;