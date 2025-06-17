import { GLOBAL_URL } from "../../utils";


export const createEvent = (
    formData: any,
    token: string | null,
    onSuccess: (data: any) => void,
    onError: (data: any) => void
) => {
    if (!token) {
        onError({ message: 'Authentication token is missing.' });
        return;
    }

    fetch(`${GLOBAL_URL}/events/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Note: Do NOT set 'Content-Type' when using FormData, browser sets it with boundary
        },
        body: formData
    })
        .then(async (response) => {
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || response.statusText);
            }

            onSuccess(data);
        })
        .catch((error) => {
            onError({ message: error.message });
        });
};


export const getActiveEvents = async (
    token: string,
    onSuccess: (data: any) => void,
    onError: (data: any) => void
) => {
    try {
        const response = await fetch(`${GLOBAL_URL}/events/active`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.detail || 'Failed to fetch active events');
        }

        onSuccess(data);
    } catch (error) {
        onError(error);
    }
};




