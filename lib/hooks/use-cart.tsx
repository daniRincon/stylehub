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
  console.log("Cart reducer action:", action.type, "payload" in action ? action.payload : "no payload")

  switch (action.type) {
    case "ADD_ITEM": {
      // Validar que el item tenga productId
      if (!action.payload.productId) {
        console.error("Cannot add item without productId:", action.payload)
        return state
      }

      const existingItem = state.items.find((item) => item.id === action.payload.id)
      console.log("Existing item found:", existingItem)

      if (existingItem) {
        const newQuantity = existingItem.quantity + (action.payload.quantity || 1)
        const maxAllowed = Math.min(newQuantity, existingItem.stock)

        console.log("Updating existing item quantity:", { newQuantity, maxAllowed })

        const updatedState = {
          ...state,
          items: state.items.map((item) => (item.id === action.payload.id ? { ...item, quantity: maxAllowed } : item)),
        }

        console.log("Updated cart state:", updatedState)
        return updatedState
      }

      // Crear el nuevo item asegurándonos de que tenga todos los campos requeridos
      const newItem: CartItem = {
        id: action.payload.id,
        productId: action.payload.productId,
        name: action.payload.name,
        price: action.payload.price,
        image: action.payload.image,
        size: action.payload.size,
        quantity: action.payload.quantity || 1,
        stock: action.payload.stock,
      }

      console.log("Creating new cart item:", newItem)

      const newState = {
        ...state,
        items: [...state.items, newItem],
      }

      console.log("New cart state with added item:", newState)
      return newState
    }

    case "REMOVE_ITEM":
      console.log("Removing item:", action.payload)
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }

    case "UPDATE_QUANTITY":
      console.log("Updating quantity:", action.payload)
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: Math.min(action.payload.quantity, item.stock) } : item,
        ),
      }

    case "UPDATE_STOCK":
      console.log("Updating stock:", action.payload)
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
      console.log("Clearing cart")
      return {
        ...state,
        items: [],
      }

    case "LOAD_CART":
      console.log("Loading cart from localStorage:", action.payload)
      // Filtrar items que no tengan productId válido y migrar items antiguos
      const validItems = action.payload
        .map((item) => {
          // Si el item no tiene productId pero tiene id, intentar migrarlo
          if (!item.productId && item.id) {
            // Extraer productId del id del carrito (formato: productId-size o solo productId)
            const productId = item.id.includes("-") ? item.id.split("-")[0] : item.id
            if (productId) {
              console.log("Migrating cart item:", { old: item.id, productId })
              return { ...item, productId }
            }
          }
          return item
        })
        .filter((item) => {
          if (!item.productId) {
            console.warn("Removing invalid cart item without productId:", item)
            return false
          }
          return true
        })

      console.log("Valid items after filtering:", validItems)
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
    console.log("Loading cart from localStorage:", savedCart)

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log("Parsed cart data:", parsedCart)
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
      console.log("Saving cart to localStorage:", state.items)
      localStorage.setItem("cart", JSON.stringify(state.items))
    }
  }, [state.items, mounted])

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    console.log("addItem called with:", item)

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

    console.log("Adding item to cart with valid stock:", itemWithValidStock)

    dispatch({ type: "ADD_ITEM", payload: itemWithValidStock })
  }

  const removeItem = (id: string) => {
    console.log("removeItem called with id:", id)
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    console.log("updateItemQuantity called:", { id, quantity })
    if (quantity <= 0) {
      removeItem(id)
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
    }
  }

  const updateItemStock = (id: string, stock: number) => {
    console.log("updateItemStock called:", { id, stock })
    dispatch({ type: "UPDATE_STOCK", payload: { id, stock } })
  }

  const clearCart = () => {
    console.log("clearCart called")
    dispatch({ type: "CLEAR_CART" })
  }

  const getTotalItems = () => {
    const total = state.items.reduce((total, item) => total + item.quantity, 0)
    console.log("getTotalItems:", total)
    return total
  }

  const getTotalPrice = () => {
    const total = state.items.reduce((total, item) => total + item.price * item.quantity, 0)
    console.log("getTotalPrice:", total)
    return total
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

  // Log del estado actual del carrito
  console.log("Current cart state:", state.items)

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider")
  }
  return context
}
