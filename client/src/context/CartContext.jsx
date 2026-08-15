import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('vcet_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('vcet_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  // Add to cart with availability check
  const addToCart = (foodItem, quantityToAdd = 1) => {
    if (!foodItem) return { success: false, message: 'Invalid food item.' };

    // Prevent unavailable food from being ordered
    if (foodItem.isAvailable === false) {
      return { success: false, message: `${foodItem.name} is currently unavailable and cannot be added.` };
    }

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item._id === foodItem._id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            _id: foodItem._id,
            name: foodItem.name,
            price: foodItem.price,
            image: foodItem.image,
            category: foodItem.category,
            prepTimeMinutes: foodItem.prepTimeMinutes,
            isAvailable: foodItem.isAvailable,
            quantity: quantityToAdd,
          },
        ];
      }
    });

    return { success: true, message: `Added ${foodItem.name} to cart!` };
  };

  // Remove item from cart
  const removeFromCart = (foodItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== foodItemId));
  };

  // Increase item quantity
  const increaseQuantity = (foodItemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === foodItemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrease item quantity (removes if quantity reaches 0)
  const decreaseQuantity = (foodItemId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item._id === foodItemId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Clear all items in cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Subtotal calculation (display only)
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Total calculation (display only)
  const total = subtotal;

  // Total items count for badge
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    subtotal,
    total,
    totalItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
