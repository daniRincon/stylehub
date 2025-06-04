"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  size?: string
  quantity: number
  stock: number
}

interface CartState {
  items: CartItem[]
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> & { quantity?: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "UPDATE_STOCK"; payload: { id: string; stock: number } }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      // Validar que el item tenga productId
      if (!action.payload.productId) {
        console.error("Cannot add item without productId:", action.payload)
        return state
      }

      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const newQuantity = existingItem.quantity + (action.payload.quantity || 1)
        const maxAllowed = Math.min(newQuantity, existingItem.stock)

        return {
          ...state,
          items: state.items.map((item) => (item.id === action.payload.id ? { ...item, quantity: maxAllowed } : item)),
        }
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      }
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: Math.min(action.payload.quantity, item.stock) } : item,
        ),
      }

    case "UPDATE_STOCK":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                stock: action.payload.stock,
                quantity: Math.min(item.quantity, action.payload.stock),
              }
            : item,
        ),
      }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }

    case "LOAD_CART":
      // Filtrar items que no tengan productId válido
      const validItems = action.payload.filter((item) => {
        if (!item.productId) {
          console.warn("Removing invalid cart item without productId:", item)
          return false
        }
        return true
      })

      return {
        ...state,
        items: validItems,
      }

    default:
      return state
  }
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateItemQuantity: (id: string, quantity: number) => void
  updateItemStock: (id: string, stock: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })
  const [mounted, setMounted] = useState(false)

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: "LOAD_CART", payload: parsedCart })
      } catch (error) {
        console.error("Error al cargar el carrito:", error)
        // Limpiar localStorage si hay error
        localStorage.removeItem("cart")
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("cart", JSON.stringify(state.items))
    }
  }, [state.items, mounted])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    // Validar que el item tenga los campos requeridos
    if (!item.productId) {
      console.error("Cannot add item without productId:", item)
      return
    }

    if (!item.name || !item.price) {
      console.error("Cannot add item without name or price:", item)
      return
    }

    // Asegurarnos de que el stock sea un número válido
    const itemWithValidStock = {
      ...item,
      stock: typeof item.stock === "number" ? item.stock : 0,
    }

    dispatch({ type: "ADD_ITEM", payload: itemWithValidStock })
  }

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const updateItemStock = (id: string, stock: number) => {
    dispatch({ type: "UPDATE_STOCK", payload: { id, stock } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const value: CartContextType = {
    items: state.items,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemStock,
    clearCart,
    getTotalItems,
    getTotalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider")
  }
  return context
}
