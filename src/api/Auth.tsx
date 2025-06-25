import { GLOBAL_URL } from "../../utils";

export const adminLogin = async (
    email: string,
    password: string,
    onSuccess: (data: any) => void = () => { },
    onError: () => void = () => { }
): Promise<{
    success: boolean;
    message: string;
    data?: any;
    log?: any;
}> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        onSuccess(data);

        if (response.status === 200) {
            return {
                success: true,
                message: "Login successful",
                data
            };
        } else {
            onError();
            return {
                success: false,
                message: data.message || "An error occurred while logging in. Please try again later.",
                log: data
            };
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "An error occurred while logging in. Please try again later.",
            log: e
        };
    }
};

export const getUserInfo = async (
    token: string,
    onSuccess: (data: any) => void = () => { }
): Promise<{
    success: boolean;
    message: string;
    data?: any;
    log?: any;
}> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });
        const data = await response.json();
        onSuccess(data);
        return {
            success: true,
            message: "User info fetched successfully",
            data
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "An error occurred while fetching user info. Please try again later.",
            log: e
        };
    }
};

export const registerUser = async (
    email: string,
    password: string,
    role: string,
    onSuccess: (data: any) => void,
    onError: (error: { status: number; message: string }) => void
): Promise<void> => {
    const url = `${GLOBAL_URL}/register`;

    const payload = {
        email,
        password,
        role
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            onError({
                status: response.status,
                message: data?.detail || 'Registration failed'
            });
            return;
        }

        onSuccess(data);
    } catch (error) {
        onError({
            status: 500,
            message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
    }
};


export const deleteUser = async (
    token: string,
    userId: string,
    onSuccess: (response: { message: string; status: number }) => void,
    onError: (error: {
        status: number | null;
        message: string;
        data?: any;
        error?: unknown;
    }) => void
): Promise<void> => {
    try {
        const response = await fetch(`${GLOBAL_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json'
            }
        });

        if (response.ok) {
            onSuccess({
                message: 'User deleted successfully',
                status: response.status
            });
        } else {
            const data = await response.json();
            onError({
                status: response.status,
                message: data?.detail || 'Failed to delete user',
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
