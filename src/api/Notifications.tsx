import { GLOBAL_URL } from "../../utils";

interface ApiResponse {
    data?: any;
    status?: number;
}

export const getNotificationHistory = async (
    token: string,
    onSuccess: (data: any) => void = () => { },
    onError: (data: any) => void = () => { }
): Promise<ApiResponse> => {
    try {
        const url = `${GLOBAL_URL}/notifications/all`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        const data = await response.json();

        if (response.status === 200) {
            onSuccess(data);
        }

        return {
            data: data,
            status: response.status
        };
    } catch (e) {
        console.error("Error fetching notifications:", e);
        onError(e);
        return {};
    }
};


export const sendMassNotification = async (
    title: string,
    body: string,
    recipient_type: string,
    onSuccess: (data: any) => void,
    onError: (data: any) => void
) => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication token not found in localStorage.');
        }

        const response = await fetch(`${GLOBAL_URL}/notifications/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                message: body,
                recipient_type
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        console.log('Notification sent successfully:', data);
        onSuccess(data)
        return data;

    } catch (error: any) {
        console.error('Failed to send notification:', error);
        onError(error)
    }
}


export const sendSingleNotification = async (
    title: string,
    body: string,
    recipient_type: string,
    recipient_id: string,
    notfication_token: string,
    onSuccess: (data: any) => void,
    onError: (data: any) => void
) => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication token not found in localStorage.');
        }

        const response = await fetch(`${GLOBAL_URL}/notifications/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                message: body,
                recipient_type,
                recipient_id,
                notfication_token
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error ${response.status}: ${errorData.detail || response.statusText}`);
        }

        const data = await response.json();
        console.log('Notification sent successfully:', data);
        onSuccess(data)
        return data;

    } catch (error: any) {
        console.error('Failed to send notification:', error);
        onError(error)
    }
}

export const deleteNotification = async (
    token: string,
    notificationId: string,
    onSuccess: (response: { message: string; status: number }) => void,
    onError: (error: {
        status: number | null;
        message: string;
        data?: any;
        error?: unknown;
    }) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            onSuccess({
                message: 'Notification deleted successfully',
                status: response.status
            });
        } else {
            const data = await response.json();
            onError({
                status: response.status,
                message: data?.detail || 'Failed to delete notification',
                data
            });
        }
    } catch (error) {
        onError({
            status: null,
            message: error instanceof Error ? error.message : 'Network error',
            error
        });
    }
};
