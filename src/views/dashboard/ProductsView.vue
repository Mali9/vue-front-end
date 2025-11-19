<template>
  <div class="products-container">
    <div class="card">
      <div class="header-section">
        <div class="header-content">
          <h2 class="page-title">Products</h2>
          <p class="page-subtitle" v-if="meta.total > 0">
            {{ meta.total }} {{ meta.total === 1 ? 'product' : 'products' }} total
          </p>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" @click="loadProducts" title="Refresh products">
            <span>↻</span>
            <span class="btn-text">Refresh</span>
          </button>
          <button class="btn btn-primary" @click="openModal()">
            <span>+</span>
            <span class="btn-text">New Product</span>
          </button>
        </div>
      </div>

      <div class="filter-section">
        <div class="search-wrapper">
          <input v-model="searchQuery" @input="handleSearch" type="text" class="input search-input"
            placeholder="Search products by name..." />
          <button v-if="searchQuery" @click="clearSearch" class="clear-search" title="Clear search">
            ×
          </button>
        </div>
      </div>

      <div class="table-container" v-if="products.length > 0">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product.id" class="table-row">
              <td class="product-name">{{ product.name }}</td>
              <td class="product-price">${{ product.price.toFixed(2) }}</td>
              <td class="product-stock">{{ product.stock }}</td>
              <td>
                <span :class="['status-pill', product.out_of_stock ? 'status-danger' : 'status-success']">
                  {{ product.out_of_stock ? 'Out of stock' : 'Available' }}
                </span>
              </td>
              <td class="actions-column" style="width: 20%; justify-content: flex-center;">
                <div class="row-actions"
                  style="display: inline-flex; gap: 0.5rem; margin-left: 1rem; justify-content: flex-center;">
                  <button class="btn btn-sm btn-secondary" @click="openModal(product)" title="Edit product">
                    Edit
                  </button>
                  <button class="btn btn-sm btn-danger" @click="deleteProduct(product.id)" title="Delete product">
                    Delete
                  </button>
                  <button class="btn btn-sm btn-primary" @click="addToCart(product.id)" title="Add to cart">
                    Add to Cart
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="empty-state" v-else>
        <div class="empty-content">
          <p class="empty-icon">📦</p>
          <h3 v-if="searchQuery">No products found</h3>
          <h3 v-else>No products found</h3>
          <p class="empty-text" v-if="searchQuery">
            No products match your search "{{ searchQuery }}"
          </p>
          <p class="empty-text" v-else>Get started by creating your first product</p>
          <button v-if="!searchQuery" class="btn btn-primary" @click="openModal()">Create Product</button>
          <button v-else class="btn btn-secondary" @click="clearSearch">Clear Search</button>
        </div>
      </div>

      <div class="pagination-wrapper" v-if="meta.last_page > 1">
        <div class="pagination">
          <div class="pagination-info">
            <span>Showing {{ meta.from }}-{{ meta.to }} of {{ meta.total }}</span>
          </div>
          <div class="pagination-controls">
            <button class="btn btn-secondary btn-sm" :disabled="meta.current_page === 1"
              @click="changePage(meta.current_page - 1)" :class="{ disabled: meta.current_page === 1 }">
              ← Previous
            </button>
            <span class="page-info">Page {{ meta.current_page }} of {{ meta.last_page }}</span>
            <button class="btn btn-secondary btn-sm" :disabled="meta.current_page === meta.last_page"
              @click="changePage(meta.current_page + 1)" :class="{ disabled: meta.current_page === meta.last_page }">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>

    <BaseModal :open="showModal" @close="closeModal">
      <div class="modal-header">
        <h3>{{ editing ? 'Update Product' : 'Create New Product' }}</h3>
      </div>
      <form class="modal-form" @submit.prevent="saveProduct">
        <div class="form-group">
          <label>
            Product Name
            <input v-model="form.name" class="input" placeholder="Enter product name" required />
          </label>
        </div>
        <div class="form-group">
          <label>
            Description
            <textarea v-model="form.description" class="input" rows="3"
              placeholder="Enter product description (optional)"></textarea>
          </label>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>
              Price ($)
              <input v-model.number="form.price" type="number" min="0" step="0.01" class="input" placeholder="0.00"
                required />
            </label>
          </div>
          <div class="form-group">
            <label>
              Stock Quantity
              <input v-model.number="form.stock" type="number" min="0" class="input" placeholder="0" required />
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" type="button" @click="closeModal">Cancel</button>
          <button class="btn btn-primary" type="submit">{{ editing ? 'Update Product' : 'Create Product' }}</button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, reactive, ref, computed } from 'vue';
import { useProductsStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';
import BaseModal from '@/components/ui/BaseModal.vue';
import Swal from 'sweetalert2';

const productsStore = useProductsStore();
const cartStore = useCartStore();

const products = computed(() => productsStore.products);
const meta = computed(() => productsStore.meta);
const searchQuery = ref(productsStore.searchQuery);

const showModal = ref(false);
const editing = ref(null);
let searchTimeout = null;

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
});

const resetForm = () => {
  form.name = '';
  form.description = '';
  form.price = 0;
  form.stock = 0;
};

const loadProducts = async () => {
  try {
    await productsStore.fetchProducts();
  } catch (error) {
    // Error is handled in the store
  }
};

const changePage = async (page) => {
  try {
    await productsStore.changePage(page);
  } catch (error) {
    // Error is handled in the store
  }
};

const handleSearch = () => {
  // Update store search query
  productsStore.setSearchQuery(searchQuery.value);

  // Debounce search to avoid too many API calls
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    // Reset to first page when searching
    productsStore.meta.current_page = 1;
    loadProducts();
  }, 300);
};

const clearSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  searchQuery.value = '';
  productsStore.clearSearch();
  loadProducts();
};

const openModal = (product) => {
  if (product) {
    editing.value = product;
    form.name = product.name;
    form.description = product.description ?? '';
    form.price = product.price;
    form.stock = product.stock;
  } else {
    editing.value = null;
    resetForm();
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  if (!editing.value) {
    resetForm();
  }
};

const saveProduct = async () => {
  try {
    if (editing.value) {
      await productsStore.updateProduct(editing.value.id, form);
    } else {
      await productsStore.createProduct(form);
    }
    closeModal();
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: editing.value ? 'Product updated successfully!' : 'Product created successfully!',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: productsStore.error || 'Failed to save product. Please try again.',
      confirmButtonColor: '#2563eb',
    });
  }
};

const deleteProduct = async (id) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'This action cannot be undone!',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  try {
    await productsStore.deleteProduct(id);
    await Swal.fire({
      icon: 'success',
      title: 'Deleted!',
      text: 'Product has been deleted.',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: productsStore.error || 'Failed to delete product. Please try again.',
      confirmButtonColor: '#2563eb',
    });
  }
};

const addToCart = async (productId) => {
  const { value: quantity } = await Swal.fire({
    title: 'Add to Cart',
    text: 'Enter quantity:',
    input: 'number',
    inputLabel: 'Quantity',
    inputValue: '1',
    inputAttributes: {
      min: '1',
      step: '1',
    },
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Add to Cart',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value || Number(value) <= 0) {
        return 'Please enter a valid quantity (greater than 0)';
      }
    },
  });

  if (!quantity || Number(quantity) <= 0) return;

  try {
    await cartStore.addItem(productId, Number(quantity));
    await Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Item added to cart successfully!',
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: cartStore.error || 'Failed to add item to cart. Please try again.',
      confirmButtonColor: '#2563eb',
    });
  }
};

onMounted(loadProducts);

onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});
</script>

<style scoped>
.products-container {
  width: 100%;
}

.card {
  background: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -20px rgba(15, 23, 42, 0.25);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-text {
  display: inline;
}

.filter-section {
  margin-bottom: 1.25rem;
}

.search-wrapper {
  position: relative;
  max-width: 400px;
}

.search-input {
  padding-right: 2.5rem;
}

.clear-search {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.table-container {
  overflow-x: auto;
  margin: 1rem 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f8fafc;
}

.table th {
  padding: 1rem 0.85rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e2e8f0;
}

.table td {
  padding: 1rem 0.85rem;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.table-row {
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background-color: #f8fafc;
}

.product-name {
  font-weight: 500;
  color: #0f172a;
}

.product-price {
  font-weight: 600;
  color: #2563eb;
}

.product-stock {
  color: #475569;
  font-weight: 500;
}

.actions-column {
  text-align: right;
  width: 1%;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 0.45rem 0.75rem;
  font-size: 0.875rem;
}

.btn:disabled,
.btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
}

.empty-text {
  color: #64748b;
  margin: 0 0 1.5rem 0;
}

.pagination-wrapper {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e2e8f0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #64748b;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-info {
  color: #475569;
  font-weight: 500;
  font-size: 0.9rem;
  min-width: 100px;
  text-align: center;
}

.modal-header {
  margin-bottom: 1.25rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.9rem;
  color: #374151;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

textarea.input {
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .actions {
    width: 100%;
  }

  .actions .btn {
    flex: 1;
    justify-content: center;
  }

  .table-container {
    margin: 0 -1rem;
    padding: 0 1rem;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
  }

  .row-actions {
    flex-direction: column;
    width: 100%;
  }

  .row-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: space-between;
    width: 100%;
  }

  .page-info {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .btn-text {
    display: none;
  }

  .actions .btn {
    min-width: 44px;
  }
}
</style>
