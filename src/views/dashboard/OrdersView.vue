<template>
  <div class="grid-cols">
    <div class="card">
      <div class="actions">
        <h3>Current Cart</h3>
        <div class="actions-group">
          <button class="btn btn-secondary" @click="loadCart">Refresh</button>
          <button class="btn btn-danger" @click="clearCart" :disabled="!cart?.items.length">Clear Cart</button>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!cart?.items.length">
            <td colspan="3">Your cart is empty. Add products from the products page.</td>
          </tr>
          <tr v-for="item in cart?.items" :key="item.id">
            <td>{{ item.product?.name ?? 'Product' }}</td>
            <td>{{ item.quantity }}</td>
            <td>${{ (item.quantity * item.unit_price).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card">
      <div class="actions">
        <button class="btn btn-secondary" @click="loadOrders">Refresh</button>
        <button class="btn btn-primary" @click="showOrderForm = true" :disabled="!cart?.items.length">Place
          Order</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.order_number }}</td>
            <td>${{ order.total.toFixed(2) }}</td>
            <td>{{ order.status }}</td>
            <td>{{ formatDate(order.created_at) }}</td>
            <td>
              <button class="btn btn-secondary" @click="selectOrder(order)">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :open="Boolean(selectedOrder)" @close="selectedOrder = null">
      <div v-if="selectedOrder">
        <h3>Order {{ selectedOrder.order_number }}</h3>
        <p>Total: ${{ selectedOrder.total.toFixed(2) }}</p>
        <p>Address: {{ selectedOrder.address }}</p>
        <p>Phone: {{ selectedOrder.phone }}</p>

        <table class="table small">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedOrder.items" :key="item.id">
              <td>{{ item.product?.name ?? 'Product' }}</td>
              <td>{{ item.quantity }}</td>
              <td>${{ item.subtotal.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseModal>

    <BaseModal :open="showOrderForm" @close="resetOrderForm">
      <h3>Place order</h3>
      <form class="modal-form" @submit.prevent="submitOrder">
        <label>
          Shipping Address
          <input v-model="orderForm.address" class="input" required />
        </label>
        <label>
          Phone
          <input v-model="orderForm.phone" class="input" required />
        </label>
        <p class="muted">Cart items will be used for this order.</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="resetOrderForm">Cancel</button>
          <button class="btn btn-primary" type="submit">Submit</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import { useCartStore } from '@/stores/cart';
import { useOrdersStore } from '@/stores/orders';
import BaseModal from '@/components/ui/BaseModal.vue';
import type { Order } from '@/types/api';
import Swal from 'sweetalert2';

const cartStore = useCartStore();
const ordersStore = useOrdersStore();

const cart = computed(() => cartStore.cart);
const orders = computed(() => ordersStore.orders);
const selectedOrder = ref<Order | null>(null);
const showOrderForm = ref(false);

const orderForm = reactive({
  address: '',
  phone: '',
});

const loadOrders = async () => {
  try {
    await ordersStore.fetchOrders();
  } catch (error) {
    // Error is handled in the store
  }
};

const loadCart = async () => {
  try {
    await cartStore.fetchCart();
  } catch (error) {
    // Error is handled in the store
  }
};

const clearCart = async () => {
  if (!cart.value?.items.length) return;

  const result = await Swal.fire({
    icon: 'warning',
    title: 'Clear Cart?',
    text: 'Are you sure you want to remove all items from your cart?',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, clear it!',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    await cartStore.clearCart();
    await Swal.fire({
      icon: 'success',
      title: 'Cart Cleared!',
      text: 'All items have been removed from your cart.',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: cartStore.error || 'Failed to clear cart. Please try again.',
      confirmButtonColor: '#2563eb',
    });
  }
};

const selectOrder = (order: Order) => {
  selectedOrder.value = order;
};

const formatDate = (value: string) => new Date(value).toLocaleString();

const resetOrderForm = () => {
  showOrderForm.value = false;
  orderForm.address = '';
  orderForm.phone = '';
};

const submitOrder = async () => {
  if (!cart.value?.items.length) {
    await Swal.fire({
      icon: 'warning',
      title: 'Empty Cart',
      text: 'Please add products to the cart first.',
      confirmButtonColor: '#2563eb',
    });
    return;
  }

  try {
    await ordersStore.createOrder(orderForm);
    resetOrderForm();
    await loadCart();
    await Swal.fire({
      icon: 'success',
      title: 'Order Placed!',
      text: 'Your order has been placed successfully. Stock updated and cart cleared.',
      timer: 3000,
      showConfirmButton: true,
      confirmButtonColor: '#2563eb',
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.cart?.[0] ?? error.response?.data?.stock?.[0] ?? (ordersStore.error || 'Unable to place order');
    await Swal.fire({
      icon: 'error',
      title: 'Order Failed',
      text: errorMessage,
      confirmButtonColor: '#2563eb',
    });
  }
};

onMounted(async () => {
  await Promise.all([loadCart(), loadOrders()]);
});
</script>

<style scoped>
.grid-cols {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.table.small th,
.table.small td {
  padding: 0.5rem;
}

.muted {
  color: #475569;
  font-size: 0.9rem;
}
</style>
