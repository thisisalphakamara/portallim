import { ErrorUtils } from '../utils/errorUtils';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    let data;
    try {
        data = isJson ? await response.json() : await response.text();
    } catch (error) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
        // If we got HTML instead of JSON, it's likely a 404/500 error page
        if (!isJson && data.startsWith('<!DOCTYPE')) {
            throw new Error(`Backend error: Received HTML instead of JSON (status ${response.status}). Check API URL and CORS configuration.`);
        }
        
        const error = new Error(ErrorUtils.extractErrorMessage(data));
        (error as any).status = response.status;
        (error as any).response = { status: response.status, data };
        throw error;
    }

    return data;
};

export const api = {
    get: async (endpoint: string) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },
    
    post: async (endpoint: string, data: any) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },
    
    put: async (endpoint: string, data: any) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },
    
    delete: async (endpoint: string) => {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    }
};
