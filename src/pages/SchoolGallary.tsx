import { useEffect, useState, useCallback, useRef } from "react";
import YouTube from 'react-youtube';
import { GLOBAL_URL } from "../../utils";
import { Trash2, Upload, RefreshCw, AlertCircle } from "lucide-react";

// ✅ Mock Alert component – replace with actual
interface AlertProps {
    variant: "success" | "error";
    title: string;
    message: string;
}

const Alert = ({ variant, title, message }: AlertProps) => (
    <div
        className={`p-4 rounded-md ${variant === "error"
            ? "bg-red-100 text-red-800 border border-red-200"
            : "bg-green-100 text-green-800 border border-green-200"
            }`}
    >
        <div className="font-semibold">{title}</div>
        <div>{message}</div>
    </div>
);


interface GalleryItem {
    id: string;
    imageUrl: string | null;
    videoUrl: string | null;
    date: string;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center">
                    <AlertCircle className="text-red-500 mr-4" size={24} />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">{message}</p>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};


// ✅ Extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};

const getGalleryItems = async (token: string, offset: number = 0, limit: number = 10): Promise<{ items: GalleryItem[]; hasMore: boolean; total: number }> => {
    const res = await fetch(`${GLOBAL_URL}/gallery/?offset=${offset}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) throw new Error("Failed to fetch gallery items");

    return res.json();
};

const deleteGalleryItem = async (id: string, token: string) => {
    const res = await fetch(`${GLOBAL_URL}/gallery/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Failed to delete item: ${msg}`);
    }
};

// ✅ Upload image or video URL
const uploadGalleryItem = async (
    formData: FormData,
    token: string
) => {
    const res = await fetch(`${GLOBAL_URL}/gallery/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Upload failed: ${msg}`);
    }

    return res.json();
};

const GalleryList = () => {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [alert, setAlert] = useState<{ type: "success" | "error"; message: string; show: boolean }>({
        type: "success",
        message: "",
        show: false,
    });

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [offset, setOffset] = useState(0);
    const observerRef = useRef<HTMLDivElement>(null);

    const [token, setToken] = useState<string>("");
    const [videoUrl, setVideoUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;

    // ✅ YouTube player options
    const youtubeOpts = {
        height: '240',
        width: '100%',
        playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
        },
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("authToken") ||
            localStorage.getItem("token") ||
            localStorage.getItem("access_token");

        if (storedToken) {
            setToken(storedToken);
        } else {
            showAlert("error", "No authentication token found. Please log in.");
        }
    }, []);

    const showAlert = (type: "success" | "error", message: string) => {
        setAlert({ type, message, show: true });
        setTimeout(() => setAlert((prev) => ({ ...prev, show: false })), 5000);
    };

    const fetchGallery = async (isLoadMore: boolean = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const currentOffset = isLoadMore ? offset : 0;
            const data = await getGalleryItems(token, currentOffset, ITEMS_PER_PAGE);

            if (isLoadMore) {
                setGallery((prev) => [...prev, ...data.items]);
            } else {
                setGallery(data.items || []);
            }

            setHasMore(data.hasMore);
            setOffset(currentOffset + ITEMS_PER_PAGE);
        } catch (err: any) {
            showAlert("error", err.message || "Failed to load gallery.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleDelete = (id: string) => {
        setItemToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            await deleteGalleryItem(itemToDelete, token);
            setGallery((prev) => prev.filter((item) => item.id !== itemToDelete));
            showAlert("success", "Item deleted successfully.");
        } catch (err: any) {
            showAlert("error", err.message || "Failed to delete item.");
        } finally {
            setIsModalOpen(false);
            setItemToDelete(null);
        }
    };


    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file && !videoUrl.trim()) {
            showAlert("error", "Please provide either an image or a YouTube URL.");
            return;
        }

        // ✅ Validate YouTube URL if provided
        if (videoUrl.trim() && !getYouTubeVideoId(videoUrl.trim())) {
            showAlert("error", "Please provide a valid YouTube URL.");
            return;
        }

        const formData = new FormData();
        if (file) {
            formData.append("raw_image", file);
        }
        if (videoUrl.trim()) {
            formData.append("videoUrl", videoUrl.trim());
        }

        try {
            await uploadGalleryItem(formData, token);
            showAlert("success", "Uploaded successfully.");
            setVideoUrl("");
            setFile(null);
            fetchGallery();
        } catch (err: any) {
            showAlert("error", err.message || "Upload failed.");
        }
    };

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchGallery(true);
        }
    }, [loadingMore, hasMore, offset]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: "100px",
            }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [loadMore, hasMore, loadingMore]);

    useEffect(() => {
        if (token) fetchGallery();
    }, [token]);

    // ✅ YouTube player event handlers
    const onPlayerReady = (event: any) => {
        console.log(event)
        // Player is ready
    };

    const onPlayerError = (event: any) => {
        console.error('YouTube player error:', event.data);
    };

    return (
        <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gallery</h2>
                    <button
                        onClick={() => {
                            setOffset(0);
                            setHasMore(true);
                            fetchGallery();
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </button>
                </div>

                {/* ✅ Upload Form */}
                <form onSubmit={handleUpload} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-sm text-gray-900 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">YouTube Video URL</label>
                        <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                            placeholder="https://youtube.com/watch?v=..."
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                        >
                            <Upload size={18} className="mr-2" />
                            Upload
                        </button>
                    </div>
                </form>

                {alert.show && (
                    <div className="mb-4">
                        <Alert
                            variant={alert.type}
                            title={alert.type === "error" ? "Error" : "Success"}
                            message={alert.message}
                        />
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8 text-gray-700 dark:text-gray-300">Loading...</div>
                ) : gallery.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-700 dark:text-gray-300 text-lg">No gallery items found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gallery.map((item) => (
                                <div key={item.id} className="bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden shadow hover:shadow-lg transition-shadow">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt="Gallery" className="w-full h-60 object-cover" />
                                    ) : item.videoUrl ? (
                                        <div className="w-full h-60 flex items-center justify-center bg-black">
                                            {(() => {
                                                const videoId = getYouTubeVideoId(item.videoUrl);
                                                if (videoId) {
                                                    return (
                                                        <YouTube
                                                            videoId={videoId}
                                                            opts={youtubeOpts}
                                                            onReady={onPlayerReady}
                                                            onError={onPlayerError}
                                                            className="w-full"
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <div className="text-white text-center p-4">
                                                            <p>Invalid YouTube URL</p>
                                                            <p className="text-sm text-gray-300 mt-2 break-all">{item.videoUrl}</p>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="h-60 flex items-center justify-center text-gray-500 dark:text-gray-300">No Content</div>
                                    )}
                                    <div className="p-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(item.date).toLocaleString()}</p>
                                        <button onClick={() => handleDelete(item.id)} className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center">
                                            <Trash2 size={16} className="mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div ref={observerRef} className="py-4">
                            {loadingMore && (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-300">Loading more...</div>
                            )}
                            {!hasMore && (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400">You've reached the end.</div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message="Are you sure you want to delete this item? This action cannot be undone."
            />
        </div>
    );
};

export default GalleryList;