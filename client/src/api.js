import axios from 'axios';

// Create Axios Instance
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Attach Bearer Token Automatically
API.interceptors.request.use(req => {
  const token = localStorage.getItem('token'); // already a plain string

  if (token) {
    req.headers.Authorization = `${token}`;
  }

  return req;
});

// =========================
//  AUTH APIS
// =========================

export const registerUser = async data => {
  return await API.post('/auth/register', data);
};

export const loginUser = async data => {
  const response = await API.post('/auth/login', data);
  return response.data;
};

// =========================
//   ADMIN / MERCHANT APIs
// =========================

// Get All Products
export const fetchProducts = async () => {
  const response = await API.get('/product');
  return response.data;
};

export const fetchBrands = async () => {
  const response = await API.get('/brand');
  return response.data.brands;
};

export const addProduct = async formData => {
  try {
    const response = await API.post('/product/add', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add product');
  }
};

export const fetchProductById = async id => {
  try {
    const response = await API.get(`/product/${id}`);
    return response.data.product;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch product');
  }
};

export const updateProduct = async (id, formData) => {
  try {
    console.log('Sending product data:', formData);

    // Check if formData is FormData (contains images) or plain object
    const isFormData = formData instanceof FormData;

    if (isFormData) {
      // If it's FormData with images, send as multipart/form-data
      const response = await API.put(`/product/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } else {
      // If it's plain object, send as JSON (backward compatibility)
      const payload = {
        product: formData
      };
      const response = await API.put(`/product/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    }
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update product');
  }
};

export const deleteProduct = async id => {
  try {
    const response = await API.delete(`/product/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete product');
  }
};
// =========================
//  CATEGORY APIs
// =========================

export const fetchCategories = async () => {
  const response = await API.get('/category');
  return response.data.categories;
};
export const addCategory = async data => {
  try {
    const response = await API.post('/category/add', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add category');
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await API.put(`/category/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update category');
  }
};

export const getCategoryById = async id => {
  try {
    const response = await API.get(`/category/${id}`);
    return response.data.category;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch category');
  }
};
export const deleteCategory = async id => {
  try {
    const response = await API.delete(`/category/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete category');
  }
};

// =========================
//  ORDER APIs (NEW)
// =========================

export const placeOrder = async orderData => {
  try {
    // Now expects { cartId: "...", total: 1234 }
    const response = await API.post('/order/add', orderData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to place order');
  }
};

export const fetchMyOrders = async () => {
  try {
    const response = await API.get('/order/me');
    return response.data.orders || response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch orders');
  }
};

// 3. Fetch Single Order Details (For View Invoice/Details)
export const fetchOrderById = async id => {
  try {
    const response = await API.get(`/order/${id}`);
    return response.data.order;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to fetch order details'
    );
  }
};

// =========================
//  CART APIs (NEW - Add this)
// =========================
export const syncCartToDB = async cartData => {
  try {
    // Expects { products: [...] }
    const response = await API.post('/cart/add', cartData);
    return response.data; // This will return { success: true, cartId: "..." }
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to sync cart');
  }
};

// =========================
//  NEWSLETTER APIs
// =========================

export const subscribeToNewsletter = async email => {
  try {
    // Assuming your route prefix in server.js is '/newsletter'
    const response = await API.post('/newsletter/subscribe', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to subscribe');
  }
};

// =========================
//  USER PROFILE APIs
// =========================

// 1. Fetch Current User Details
export const fetchProfile = async () => {
  try {
    const response = await API.get('/user/me');
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch profile');
  }
};

// 2. Update User Profile
export const updateProfile = async profileData => {
  try {
    // Backend expects req.body.profile
    const payload = { profile: profileData };

    const response = await API.put('/user', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update profile');
  }
};

// =========================
//  CONTACT APIs
// =========================

export const submitContact = async data => {
  try {
    // Matches router.post('/add', ...) mounted at /contact
    const response = await API.post('/contact/add', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

// =========================
//  SEARCH APIs
// =========================

export const searchProducts = async keyword => {
  try {
    // Option 1: If you have a specific backend route (e.g. /product/search?q=...) use that.
    // Option 2 (Implemented here): Fetch all and filter client-side (Robust for now)

    const response = await API.get('/product');
    const allProducts = response.data.products || response.data || [];

    if (!keyword) return [];

    // Filter logic: Match Name or Category (Case Insensitive)
    const lowerKeyword = keyword.toLowerCase();

    const filtered = allProducts.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(lowerKeyword);
      // Handle category if it's an object or string
      const categoryName =
        typeof item.category === 'object' ? item.category?.name : item.category;
      const catMatch = categoryName
        ? categoryName.toLowerCase().includes(lowerKeyword)
        : false;

      return nameMatch || catMatch;
    });

    return filtered.slice(0, 5); // Return top 5 matches
  } catch (error) {
    console.error('Search API Error', error);
    return [];
  }
};

// =========================
//  REVIEW APIs
// =========================

export const addReview = async reviewData => {
  try {
    const response = await API.post('/review/add', reviewData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add review');
  }
};

export const fetchReviewsBySlug = async slug => {
  try {
    const response = await API.get(`/review/${slug}`);
    return response.data.reviews;
  } catch (error) {
    // If 404 (no reviews yet or product not found), return empty array
    return [];
  }
};

// =========================
//  ADMIN REVIEW APIs
// =========================

// Fetch all reviews (with pagination support if needed)
export const fetchAllReviews = async (page = 1) => {
  try {
    const response = await API.get(`/review?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch reviews');
  }
};

// Approve a review
export const approveReview = async reviewId => {
  try {
    const response = await API.put(`/review/approve/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to approve review');
  }
};

// Reject a review
export const rejectReview = async reviewId => {
  try {
    const response = await API.put(`/review/reject/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to reject review');
  }
};

// Delete a review
export const deleteReview = async reviewId => {
  try {
    const response = await API.delete(`/review/delete/${reviewId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete review');
  }
};
// =========================
//  ADMIN USER APIs
// =========================

export const fetchAllUsers = async (page = 1) => {
  try {
    // Matches router.get('/', ...) in your backend user.js
    const response = await API.get(`/user?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch users');
  }
};

// =========================
//  POLICY APIs
// =========================

export const fetchShippingPolicy = async () => {
  try {
    const response = await API.get('/policy/shipping');
    return response.data.policy;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch policy');
  }
};

export const saveShippingPolicy = async content => {
  try {
    const response = await API.post('/policy/shipping', { content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save policy');
  }
};

export const addBanner = async formData => {
  try {
    const response = await API.post('/banner/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to upload banners');
  }
};

export const fetchBanners = async () => {
  try {
    const response = await API.get('/banner/');
    return response.data.banners;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch banners');
  }
};

export const getPromoCards = async () => {
  const response = await API.get('/promo-cards');
  return response.data;
};

export const savePromoCard = async formData => {
  try {
    const response = await API.post('/promo-cards/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save promo card');
  }
};

// =========================
//  SHIPPING CONFIG APIs
// =========================

export const fetchShippingConfig = async () => {
  try {
    const response = await API.get('/shipping');
    return response.data.config;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || 'Failed to fetch shipping config'
    );
  }
};

export const saveShippingConfig = async data => {
  try {
    const response = await API.post('/shipping', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save config');
  }
};
// =========================
//  ADMIN ORDER APIs
// =========================

export const fetchAllOrders = async (page = 1) => {
  try {
    // Matches router.get('/', ...) in your backend order.js (Admin Access)
    const response = await API.get(`/order?page=${page}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch orders');
  }
};
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await API.put(`/order/status/${orderId}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update status');
  }
};
// =========================
//  NOTIFICATION APIs
// =========================

// Mark order as read (for both Admin and User)
export const markOrderAsRead = async (orderId, role) => {
  try {
    // We send the ID and the role so the backend knows which flag (userRead or adminRead) to update
    const response = await API.put(`/order/read-status/${orderId}`, { role });
    return response.data;
  } catch (error) {
    console.error('Failed to mark notification as read', error);
    // Even if API fails, we return true to update UI optimistically
    return { success: true };
  }
};

// =========================
//  BANK DETAILS APIs
// =========================

export const fetchBanks = async () => {
  try {
    const response = await API.get('/bank');
    return response.data.banks;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch banks');
  }
};

export const addBank = async bankData => {
  try {
    const response = await API.post('/bank/add', bankData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to add bank');
  }
};

export const updateBank = async (id, bankData) => {
  try {
    const response = await API.put(`/bank/${id}`, bankData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update bank');
  }
};

export const deleteBank = async id => {
  try {
    const response = await API.delete(`/bank/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete bank');
  }
};

export const getDiscountData = async () => {
  const res = await API.get('discount/products');
  return res.data;
};

export const saveStoreDiscount = async payload => {
  const res = await API.post('discount/store', payload);
  return res.data;
};

export const saveProductDiscount = async (id, payload) => {
  const res = await API.put(`discount/product/${id}`, payload);
  return res.data;
};
