import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, DEMO_USERS } from '../data/products';
import { calculateOrderTotals } from '../utils/priceAssistant';
import { analyzeReviewContent } from '../utils/reviewChecker';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. User state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_user');
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  // Registered users database (persists demo + newly registered accounts)
  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_registered_users');
      return saved ? JSON.parse(saved) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  });

  // 2. Products state
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // 3. Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Orders state
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_orders');
      if (saved) return JSON.parse(saved);
      // Default demo preloaded order so user can test tracking / return flow right away!
      const initialDemoOrder = {
        id: 'ORD-2026-9042',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        items: [
          {
            id: 'prod-3',
            name: 'PulseFit Pro Ultra GPS Smartwatch',
            brand: 'ChronosHealth',
            price: 199.50,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'
          }
        ],
        totals: {
          subtotal: 199.50,
          shippingCost: 0,
          discountAmount: 0,
          taxAmount: 16.46,
          grandTotal: 215.96,
          itemCount: 1
        },
        shippingAddress: DEMO_USERS[0].address,
        paymentMethod: 'Demo Credit Card (•••• 4242)',
        deliverySpeed: 'Standard Delivery (2-3 Business Days)',
        carrier: 'ApexExpress',
        trackingNumber: 'APX-774920194US',
        status: 'delivered', // Placed, processing, shipped, out_for_delivery, delivered
        trackingTimeline: [
          { stage: 'Order Placed', time: '3 days ago', detail: 'Simulated order verified & payment authorized.', done: true },
          { stage: 'Order Processed', time: '2 days ago', detail: 'Items securely packed at Apex Fulfillment Center #4.', done: true },
          { stage: 'Shipped', time: 'Yesterday', detail: 'Handed over to ApexExpress carrier. In transit.', done: true },
          { stage: 'Out for Delivery', time: 'Yesterday 09:30 AM', detail: 'Local courier out on final mile delivery.', done: true },
          { stage: 'Delivered', time: 'Yesterday 02:15 PM', detail: 'Delivered to front porch / reception.', done: true }
        ],
        returnStatus: null, // null | 'requested' | 'under_inspection' | 'approved' | 'refunded'
        returnDetails: null
      };
      return [initialDemoOrder];
    } catch {
      return [];
    }
  });

  // Navigation & View state
  const [currentView, setCurrentView] = useState('home'); // home, discovery, product-detail, cart, checkout, orders, order-detail, wishlist, compare, workflow-guide
  const [selectedProductId, setSelectedProductId] = useState('prod-1');
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-2026-9042');
  const [compareList, setCompareList] = useState([]); // Array of product objects
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Workflow tracking
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(1);
  const [activeFlowGuidance, setActiveFlowGuidance] = useState(null); // 'wishlist', 'search', 'return', 'review', 'price'
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('apex_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('apex_registered_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('apex_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('apex_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('apex_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('apex_orders', JSON.stringify(orders));
  }, [orders]);

  // Toast utility
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.message === message ? null : prev));
    }, 3800);
  };

  // Cart actions with stock validation
  const addToCart = (product, qty = 1) => {
    // Check current live product stock
    const currentProd = products.find(p => p.id === product.id) || product;
    const availableStock = currentProd.stockCount !== undefined ? currentProd.stockCount : 10;

    if (availableStock <= 0) {
      showToast(`Sorry, "${product.name.slice(0, 20)}..." is currently Out of Stock!`, 'danger');
      return false;
    }

    const existingInCart = cart.find(item => item.id === product.id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;

    if (currentCartQty + qty > availableStock) {
      showToast(`Only ${availableStock} units available in stock (${currentCartQty} already in cart)!`, 'warning');
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.images?.[0] || '',
            category: product.category,
            quantity: qty
          }
        ];
      }
    });
    setCurrentWorkflowStep(6);
    const shortName = product.name.length > 26 ? product.name.slice(0, 24) + '…' : product.name;
    showToast(`"${shortName}" added to cart! (${availableStock - (currentCartQty + qty)} left)`, 'success');
    return true;
  };

  const buyNow = (product, qty = 1) => {
    const added = addToCart(product, qty);
    if (added) {
      navigateTo('checkout', { step: 8 });
    }
  };

  const updateCartQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    const currentProd = products.find(p => p.id === productId);
    const availableStock = currentProd?.stockCount !== undefined ? currentProd.stockCount : 99;

    if (qty > availableStock) {
      showToast(`Cannot add more. Only ${availableStock} units in stock!`, 'warning');
      return;
    }

    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist actions
  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      showToast(`Removed from Wishlist.`, 'info');
    } else {
      setWishlist(prev => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.images?.[0] || '',
          category: product.category,
          rating: product.rating
        }
      ]);
      showToast(`Saved to Wishlist!`, 'success');
    }
  };

  const isInWishlist = (productId) => wishlist.some(item => item.id === productId);

  // Move from Wishlist to Cart (Alternative Flow: Wishlist Flow)
  const moveToCart = (product) => {
    addToCart(product, 1);
    setWishlist(prev => prev.filter(item => item.id !== product.id));
    showToast(`Moved "${product.name.slice(0, 20)}..." to your cart!`, 'success');
  };

  // Compare actions
  const toggleCompare = (product) => {
    const exists = compareList.some(item => item.id === product.id);
    if (exists) {
      setCompareList(prev => prev.filter(item => item.id !== product.id));
      showToast(`Removed from comparison table.`, 'info');
    } else {
      if (compareList.length >= 4) {
        showToast(`You can compare up to 4 items simultaneously.`, 'warning');
        return;
      }
      setCompareList(prev => [...prev, product]);
      showToast(`Added to comparison table. (${compareList.length + 1}/4)`, 'success');
    }
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Coupon actions
  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    const found = INITIAL_COUPONS[cleanCode];
    if (!found) {
      showToast(`Invalid coupon code "${code}". Try "SAVE15" or "WELCOME10".`, 'danger');
      return false;
    }
    setAppliedCoupon(found);
    showToast(`Coupon "${cleanCode}" successfully applied!`, 'success');
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promo discount removed.', 'info');
  };

  // Order Placement (Step 8)
  const placeDemoOrder = (orderDetails) => {
    const newOrderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();

    const createdOrder = {
      id: newOrderId,
      createdAt: now.toISOString(),
      items: [...cart],
      totals: calculateOrderTotals(cart, appliedCoupon, orderDetails.deliverySpeed),
      shippingAddress: orderDetails.shippingAddress,
      paymentMethod: orderDetails.paymentMethod,
      deliverySpeed: orderDetails.deliverySpeed === 'express' ? 'Express Delivery (Next Day)' : 'Standard Delivery (2-3 Business Days)',
      carrier: 'ApexExpress',
      trackingNumber: `APX-${Math.floor(100000000 + Math.random() * 900000000)}US`,
      status: 'placed',
      trackingTimeline: [
        {
          stage: 'Order Placed',
          time: 'Just now',
          detail: 'Order received and demo payment authorization confirmed.',
          done: true
        },
        {
          stage: 'Processing & Packaging',
          time: 'Estimated within 2 hrs',
          detail: 'Allocating inventory and packaging in warehouse.',
          done: false
        },
        {
          stage: 'Shipped',
          time: 'Estimated tomorrow',
          detail: 'Handover to carrier ApexExpress.',
          done: false
        },
        {
          stage: 'Out for Delivery',
          time: 'Estimated in 2 days',
          detail: 'Local courier transit to recipient address.',
          done: false
        },
        {
          stage: 'Delivered',
          time: 'Estimated in 2-3 days',
          detail: 'Package delivered.',
          done: false
        }
      ],
      returnStatus: null,
      returnDetails: null
    };

    setOrders(prev => [createdOrder, ...prev]);
    setSelectedOrderId(newOrderId);

    // Deduct stock for all ordered items and update inStock status
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const orderedItem = cart.find(item => item.id === prod.id);
        if (orderedItem) {
          const newStock = Math.max(0, (prod.stockCount || 0) - orderedItem.quantity);
          return {
            ...prod,
            stockCount: newStock,
            inStock: newStock > 0
          };
        }
        return prod;
      })
    );

    clearCart();
    setAppliedCoupon(null);
    setCurrentWorkflowStep(9);
    setCurrentView('order-detail');
    showToast(`Order ${newOrderId} placed successfully! Stock updated.`, 'success');
    return createdOrder;
  };

  // Simulate Order Tracking Lifecycle (Step 9)
  const advanceOrderStatus = (orderId) => {
    const stages = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        const currentIndex = stages.indexOf(order.status);
        if (currentIndex >= stages.length - 1) {
          showToast('Order is already marked as Delivered.', 'info');
          return order;
        }
        const nextStatus = stages[currentIndex + 1];
        const nextTimeline = order.trackingTimeline.map((item, idx) => {
          if (idx <= currentIndex + 1) {
            return {
              ...item,
              done: true,
              time: idx === currentIndex + 1 ? 'Just now (Simulated)' : item.time
            };
          }
          return item;
        });

        const statusDisplay = {
          processing: 'Processing in Warehouse',
          shipped: 'Shipped with Carrier',
          out_for_delivery: 'Out for Delivery',
          delivered: 'Delivered'
        }[nextStatus];

        showToast(`Simulated status updated to: ${statusDisplay}!`, 'success');
        return {
          ...order,
          status: nextStatus,
          trackingTimeline: nextTimeline
        };
      })
    );
  };

  // Returns & Refunds (Step 10)
  const requestOrderReturn = (orderId, reason, note = '') => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          returnStatus: 'requested',
          returnDetails: {
            reason,
            note,
            requestedAt: new Date().toISOString(),
            refundAmount: order.totals.grandTotal,
            refundMethod: order.paymentMethod,
            refundTimeline: [
              { stage: 'Return Requested', time: 'Just now', detail: `Reason: ${reason}. Under automated inspection.`, done: true },
              { stage: 'Return Authorized', time: 'Simulated queue', detail: 'Pre-paid return shipping label generated.', done: false },
              { stage: 'Item Inspected', time: 'Warehouse check', detail: 'Verification of returned item condition.', done: false },
              { stage: 'Refund Credited', time: 'Payment gateway', detail: `Credit of $${order.totals.grandTotal.toFixed(2)} to original payment method.`, done: false }
            ]
          }
        };
      })
    );
    setCurrentWorkflowStep(10);
    showToast('Return request submitted for demo processing!', 'success');
  };

  const advanceRefundStatus = (orderId) => {
    const stages = ['requested', 'under_inspection', 'approved', 'refunded'];
    setOrders(prev =>
      prev.map(order => {
        if (order.id !== orderId || !order.returnDetails) return order;
        const currentIdx = stages.indexOf(order.returnStatus || 'requested');
        if (currentIdx >= stages.length - 1) {
          showToast('Refund is already completed!', 'info');
          return order;
        }
        const nextStatus = stages[currentIdx + 1];
        const nextTimeline = order.returnDetails.refundTimeline.map((item, idx) => {
          if (idx <= currentIdx + 1) {
            return {
              ...item,
              done: true,
              time: idx === currentIdx + 1 ? 'Just now (Simulated)' : item.time
            };
          }
          return item;
        });

        const statusNames = {
          under_inspection: 'Pre-paid Return Label Authorized',
          approved: 'Return Inspected & Approved',
          refunded: 'Refund Credited to Original Payment'
        };

        showToast(`Refund stage: ${statusNames[nextStatus]}!`, 'success');
        return {
          ...order,
          returnStatus: nextStatus,
          returnDetails: {
            ...order.returnDetails,
            refundTimeline: nextTimeline
          }
        };
      })
    );
  };

  // Submit Review with Rule-Based Suspicious Detection (Step 10)
  const submitReview = (productId, { rating, title, comment, authorName }) => {
    const analysis = analyzeReviewContent(comment, rating, title);
    const newReview = {
      id: `rev-${Date.now()}`,
      userName: authorName || user?.name || 'Shopper',
      rating,
      date: new Date().toISOString().split('T')[0],
      title,
      comment,
      verified: true,
      analysis,
      suspicious: analysis.isSuspicious
    };

    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        const updatedReviews = [newReview, ...(prod.reviews || [])];
        const avgRating = Number(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
        );
        return {
          ...prod,
          reviews: updatedReviews,
          rating: avgRating,
          reviewCount: updatedReviews.length
        };
      })
    );

    if (analysis.isSuspicious) {
      showToast(`Review submitted but FLAGGED as suspicious by rule engine (${analysis.verdict})`, 'warning');
    } else {
      showToast(`Review verified & submitted successfully!`, 'success');
    }

    return analysis;
  };

  // User auth actions
  const loginDemoUser = (userIndex = 0) => {
    const list = users.length > 0 ? users : DEMO_USERS;
    const selected = list[userIndex] || DEMO_USERS[0];
    setUser(selected);
    setCurrentWorkflowStep(2);
    showToast(`Signed in as: ${selected.name}`, 'success');
  };

  const loginWithCredentials = (email, password = '') => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      // If user saved password, check it (optional demo tolerance)
      if (existing.password && password && existing.password !== password) {
        showToast('Incorrect password. Please try again.', 'danger');
        return false;
      }
      setUser(existing);
      setCurrentWorkflowStep(2);
      showToast(`Welcome back, ${existing.name}! Signed in successfully.`, 'success');
      return true;
    } else {
      // User not found in registered database
      showToast(`No account found for "${email}". Please register first or use a demo account.`, 'warning');
      return false;
    }
  };

  const registerUser = (customUser) => {
    const cleanEmail = customUser.email.trim().toLowerCase();
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
    
    let updatedUsers;
    if (existingIndex >= 0) {
      // Update existing
      updatedUsers = users.map((u, i) => i === existingIndex ? { ...u, ...customUser } : u);
    } else {
      // Append new account
      updatedUsers = [...users, customUser];
    }
    
    setUsers(updatedUsers);
    setUser(customUser);
    setCurrentWorkflowStep(2);
    showToast(`Account created for ${customUser.name}! You are now signed in.`, 'success');
    return customUser;
  };

  const logoutUser = () => {
    setUser(null);
    showToast('Logged out of session.', 'info');
  };

  // Navigation helper
  const navigateTo = (view, extra = {}) => {
    setCurrentView(view);
    if (extra.productId) setSelectedProductId(extra.productId);
    if (extra.orderId) setSelectedOrderId(extra.orderId);
    if (extra.category) setSelectedCategory(extra.category);
    if (extra.step) setCurrentWorkflowStep(extra.step);
    if (extra.guidance !== undefined) setActiveFlowGuidance(extra.guidance);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset demo state
  const resetAllDemoData = () => {
    localStorage.removeItem('apex_products');
    localStorage.removeItem('apex_cart');
    localStorage.removeItem('apex_wishlist');
    localStorage.removeItem('apex_orders');
    localStorage.removeItem('apex_user');
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setWishlist([]);
    setOrders([]);
    setUser(DEMO_USERS[0]);
    setAppliedCoupon(null);
    setCompareList([]);
    setCurrentWorkflowStep(1);
    setActiveFlowGuidance(null);
    setCurrentView('home');
    showToast('All demo data reset to factory state!', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        products,
        cart,
        wishlist,
        orders,
        currentView,
        selectedProductId,
        selectedOrderId,
        compareList,
        appliedCoupon,
        searchQuery,
        selectedCategory,
        currentWorkflowStep,
        activeFlowGuidance,
        toastMessage,
        setSearchQuery,
        setSelectedCategory,
        setCurrentWorkflowStep,
        setActiveFlowGuidance,
        showToast,
        addToCart,
        buyNow,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        moveToCart,
        toggleCompare,
        clearCompare,
        applyCoupon,
        removeCoupon,
        placeDemoOrder,
        advanceOrderStatus,
        requestOrderReturn,
        advanceRefundStatus,
        submitReview,
        loginDemoUser,
        loginWithCredentials,
        registerUser,
        logoutUser,
        navigateTo,
        resetAllDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
