import { GLOBAL_URL } from "../../utils";


export const adminLogin = async (email, password, onSucess = () => { }, onError = () => { }) => {
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
        onSucess(data)

        if (response.status === 200) {
            return {
                success: true,
                message: "Login successful",
                data
            }
        } else {
            onError()
            return {
                success: false,
                message: data.message || "An error occurred while logging in. Please try again later.",
                log: data
            }
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "An error occurred while logging in. Please try again later.",
            log: e
        }
    }
}

export const getUserInfo = async (token: string, onSucess = (data: any) => { }) => {
    try {
        const response = await fetch(`${GLOBAL_URL}/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
        const data = await response.json();
        onSucess(data)
        return {
            success: true,
            message: "User info fetched successfully",
            data
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: "An error occurred while fetching user info. Please try again later.",
            log: e
        }
    }
}