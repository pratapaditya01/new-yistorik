import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isOpen: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
      };
    
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item =>
        item.product._id === action.payload.product._id &&
        JSON.stringify(item.selectedVariants) === JSON.stringify(action.payload.selectedVariants)
      );

      let newItems;
      if (existingItem) {
        newItems = state.items.map(item =>
          item.product._id === action.payload.product._id &&
          JSON.stringify(item.selectedVariants) === JSON.stringify(action.payload.selectedVariants)
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }

      const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
      const newTotalPrice = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
      const newTotalPrice = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      const newTotalItems = newItems.reduce((total, item) => total + item.quantity, 0);
      const newTotalPrice = newItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({
      items: state.items,
      totalItems: state.totalItems,
      totalPrice: state.totalPrice,
    }));
  }, [state.items, state.totalItems, state.totalPrice]);

  const addToCart = (product, quantity = 1, selectedVariants = []) => {
    const cartItem = {
      id: `${product._id}-${JSON.stringify(selectedVariants)}`,
      product,
      quantity,
      price: product.price,
      selectedVariants,
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (itemId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getItemQuantity = (productId, selectedVariants = []) => {
    const item = state.items.find(item => 
      item.product._id === productId &&
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
    );
    return item ? item.quantity : 0;
  };

  // Additional helper functions for the Cart component
  const getCartTotal = () => {
    return state.totalPrice;
  };

  const getTotalPrice = () => {
    return state.totalPrice;
  };

  const getCartCount = () => {
    return state.totalItems;
  };

  const value = {
    ...state,
    cartItems: state.items, // Alias for compatibility
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart,
    getItemQuantity,
    getCartTotal,
    getTotalPrice,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
