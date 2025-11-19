import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import type { Cart, CartItem } from '@/types/api';
import { getErrorMessage } from '@/utils/errorHandler';

export const useCartStore = defineStore('cart', () => {
    // State
    const cart = ref<Cart | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Getters
    const items = computed(() => cart.value?.items || []);
    const itemCount = computed(() => cart.value?.items?.length || 0);
    const isEmpty = computed(() => !cart.value?.items?.length);
    const total = computed(() => {
        if (!cart.value?.items) return 0;
        return cart.value.items.reduce((sum: number, item: CartItem) => {
            return sum + item.quantity * item.unit_price;
        }, 0);
    });

    // Actions
    const fetchCart = async () => {
        loading.value = true;
        error.value = null;
        try {
            const response = await api.get<Cart>('/cart');
            cart.value = response.data;
        } catch (err: any) {
            error.value = getErrorMessage(err);
            console.error('Failed to load cart:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const addItem = async (productId: number, quantity: number) => {
        loading.value = true;
        error.value = null;
        try {
            await api.post('/cart/items', {
                product_id: productId,
                quantity: quantity,
            });
            await fetchCart();
        } catch (err: any) {
            error.value = getErrorMessage(err);
            console.error('Failed to add item to cart:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const clearCart = async () => {
        loading.value = true;
        error.value = null;
        try {
            await api.delete('/cart');
            await fetchCart();
        } catch (err: any) {
            error.value = getErrorMessage(err);
            console.error('Failed to clear cart:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        // State
        cart,
        loading,
        error,
        // Getters
        items,
        itemCount,
        isEmpty,
        total,
        // Actions
        fetchCart,
        addItem,
        clearCart,
    };
});

