import { api } from './api';

export const getRegistrationDocuments = async (submissionId: string) => {
    return api.get(`/registrations/${submissionId}/documents`);
};

export const downloadRegistrationDocument = async (submissionId: string, documentId: string) => {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/registrations/${submissionId}/documents/${documentId}/download`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to download document');
    }

    return response.blob();
};

export const sendDocumentToEmail = async (submissionId: string, documentId: string) => {
    return api.post(`/registrations/${submissionId}/documents/${documentId}/email`, {});
};

export const deleteRegistrationDocument = async (submissionId: string, documentId: string) => {
    return api.delete(`/registrations/${submissionId}/documents/${documentId}`);
};

export const uploadRegistrationDocument = async (submissionId: string, file: File) => {
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    console.log('Token from localStorage:', token ? 'exists' : 'missing');
    console.log('Token length:', token?.length || 0);

    if (!token) {
        throw new Error('No authentication token found. Please log in again.');
    }

    const formData = new FormData();
    formData.append('document', file);

    const url = `${API_URL}/registrations/${submissionId}/documents`;
    console.log('Uploading document to:', url);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload error:', errorData);
        throw new Error(errorData.error || 'Failed to upload document');
    }

    return response.json();
};
