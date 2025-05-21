import { GLOBAL_URL } from "../../utils";

interface ApiResponse {
    data?: any;
    status?: number;
}

export const getAllReceipts = async (
    page: number,
    limit: number,
    token: string,
    onSuccess: (data: any) => void = () => { },
    onError: (data: any) => void = () => { }
): Promise<ApiResponse> => {
    try {
        const url = `${GLOBAL_URL}/fee-receipts?page=${page}&limit=${limit}`;

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
        console.log(e);
        onError(e);
        return {};
    }
};