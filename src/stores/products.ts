import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Product, ProductResponse } from '@/types/api';

interface ProductFormData {
    name: string;
    description?: string;
    price: number;
    stock: number;
}

interface PaginationMeta {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
}

export const useProductsStore = defineStore('products', () => {
    // State
    const products = ref<Product[]>([]);
    const meta = ref<PaginationMeta>({
        total: 0,
        per_page: 0,
        current_page: 0,
        last_page: 0,
        from: 0,
        to: 0,
    });
    const loading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');

    // Getters
    const hasProducts = computed(() => products.value.length > 0);
    const hasMorePages = computed(() => meta.value.current_page < meta.value.last_page);
    const canGoPrevious = computed(() => meta.value.current_page > 1);

    // Actions
    const buildQueryString = () => {
        const params = new URLSearchParams();
        if (searchQuery.value.trim()) {
            params.append('search', searchQuery.value.trim());
        }
        return params.toString();
    };

    const fetchProducts = async (page: number | null = null) => {
        loading.value = true;
        error.value = null;
        try {
            const query = buildQueryString();
            let url = '/products';

            if (page) {
                url += query ? `?page=${page}&${query}` : `?page=${page}`;
            } else if (query) {
                url += `?${query}`;
            }

            const response = await api.get<ProductResponse>(url);
            products.value = response.data.data;
            meta.value = response.data.meta;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to load products';
            console.error('Failed to load products:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const createProduct = async (productData: ProductFormData) => {
        loading.value = true;
        error.value = null;
        try {
            await api.post('/products', productData);
            await fetchProducts(meta.value.current_page);
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to create product';
            console.error('Failed to create product:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateProduct = async (id: number, productData: ProductFormData) => {
        loading.value = true;
        error.value = null;
        try {
            await api.put(`/products/${id}`, productData);
            await fetchProducts(meta.value.current_page);
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to update product';
            console.error('Failed to update product:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteProduct = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            await api.delete(`/products/${id}`);
            await fetchProducts(meta.value.current_page);
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to delete product';
            console.error('Failed to delete product:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const setSearchQuery = (query: string) => {
        searchQuery.value = query;
    };

    const clearSearch = () => {
        searchQuery.value = '';
        meta.value.current_page = 1;
    };

    const changePage = async (page: number) => {
        await fetchProducts(page);
    };

    return {
        // State
        products,
        meta,
        loading,
        error,
        searchQuery,
        // Getters
        hasProducts,
        hasMorePages,
        canGoPrevious,
        // Actions
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        setSearchQuery,
        clearSearch,
        changePage,
    };
});

