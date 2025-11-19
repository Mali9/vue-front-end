/**
 * Extracts error message from backend API error response
 * Handles Laravel validation errors and general error messages
 */
export function getErrorMessage(error: any): string {
    if (!error) {
        return 'An unexpected error occurred';
    }

    // Handle axios error response
    const response = error.response || error;

    // Laravel validation errors (422)
    if (response.status === 422 && response.data?.errors) {
        const errors = response.data.errors;
        // Get first error message from validation errors
        const firstKey = Object.keys(errors)[0];
        if (firstKey && Array.isArray(errors[firstKey])) {
            return errors[firstKey][0];
        }
    }

    // Laravel validation errors as arrays (e.g., cart[0], stock[0])
    if (response.data) {
        // Check for nested validation errors
        if (response.data.cart && Array.isArray(response.data.cart)) {
            return response.data.cart[0];
        }
        if (response.data.stock && Array.isArray(response.data.stock)) {
            return response.data.stock[0];
        }
        if (response.data.quantity && Array.isArray(response.data.quantity)) {
            return response.data.quantity[0];
        }
        if (response.data.product_id && Array.isArray(response.data.product_id)) {
            return response.data.product_id[0];
        }

        // General error message
        if (response.data.message) {
            return response.data.message;
        }

        // Error object with message
        if (response.data.error) {
            return response.data.error;
        }
    }

    // Network error
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        return 'Network error. Please check your connection and try again.';
    }

    // Request timeout
    if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please try again.';
    }

    // Default error message
    return error.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Extracts all validation errors from Laravel response
 */
export function getValidationErrors(error: any): Record<string, string[]> {
    if (error?.response?.data?.errors) {
        return error.response.data.errors;
    }
    return {};
}

