import { GLOBAL_URL } from "../../utils";

interface FeePostPayload {
    student_id: string;
    title: string;
    other_fee?: Record<string, number>;
    deadline: string;
    is_paid: boolean;
    mode: 'online' | 'offline';
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: unknown;
}

export async function createFeePost(
    payload: FeePostPayload,
): Promise<ApiResponse> {
    try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${GLOBAL_URL}/feepost/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData?.detail || `HTTP Error ${response.status}`,
            };
        }

        const data = await response.json();
        console.log("success: ", data)
        return {
            success: true,
            message: 'Fee post created successfully',
            data,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Network or unexpected error occurred',
        };
    }
}



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
export async function getFeePostsByStudent(
    studentId: string,
    token: string,
    offset: number = 0,
    limit: number = 10
): Promise<{ success: boolean; data?: FeePostResponse; message?: string }> {
    const url = `${GLOBAL_URL}/feepost/by-student?student_id=${studentId}&offset=${offset}&limit=${limit}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            return {
                success: false,
                message: error?.detail || `HTTP ${res.status} - ${res.statusText}`,
            };
        }

        const data: FeePostResponse = await res.json();
        return {
            success: true,
            data,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Network error",
        };
    }
}


export async function deleteFeePost(
    postId: string,
    token: string
): Promise<{ success: boolean; message?: string }> {
    const url = `${GLOBAL_URL}/feepost/${postId}`;

    try {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData?.detail || `HTTP ${response.status} - ${response.statusText}`,
            };
        }

        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Network or unexpected error occurred.",
        };
    }
}



type UpdateStatusPayload = {
    mode: "online" | "offline";
    is_paid: boolean;
};

export async function updateFeePostStatus(
    feePostId: string,
    payload: UpdateStatusPayload
): Promise<void> {
    const url = `${GLOBAL_URL}/feepost/${feePostId}/status`;

    try {
        const token = localStorage.getItem('token')
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                `Failed to update status: ${response.status} ${errorData?.detail || response.statusText
                }`
            );
        }

        console.log("Fee post status updated successfully.");
    } catch (error) {
        console.error("Error updating fee post status:", error);
        throw error;
    }
}
