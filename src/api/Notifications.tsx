import { GLOBAL_URL } from "../../utils";

interface ApiResponse {
    data?: any;
    status?: number;
}

export const getNotificationHistory = async (
    token: string,
    onSuccess: (data: any) => void = () => {},
    onError: () => void = () => {}
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
        } else {
            onError();
        }

        return {
            data: data,
            status: response.status
        };
    } catch (e) {
        console.error("Error fetching notifications:", e);
        onError();
        return {};
    }
};