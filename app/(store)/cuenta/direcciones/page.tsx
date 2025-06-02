"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, MapPin } from "lucide-react"
import { toast } from "sonner"

interface Address {
  id: string
  name: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export default function DireccionesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Colombia",
  })

  useEffect(() => {
    // Cargar direcciones guardadas
    const savedAddresses = localStorage.getItem("userAddresses")
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses))
    }
  }, [])

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses)
    localStorage.setItem("userAddresses", JSON.stringify(newAddresses))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.address || !formData.city) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    const newAddress: Address = {
      id: editingId || Date.now().toString(),
      ...formData,
      isDefault: addresses.length === 0, // Primera dirección es por defecto
    }

    let updatedAddresses
    if (editingId) {
      updatedAddresses = addresses.map((addr) => (addr.id === editingId ? newAddress : addr))
      toast.success("Dirección actualizada")
    } else {
      updatedAddresses = [...addresses, newAddress]
      toast.success("Dirección agregada")
    }

    saveAddresses(updatedAddresses)
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Colombia",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleEdit = (address: Address) => {
    setFormData({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    })
    setEditingId(address.id)
    setIsAdding(true)
  }

  const handleDelete = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id)
    saveAddresses(updatedAddresses)
    toast.success("Dirección eliminada")
  }

  const setAsDefault = (id: string) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    saveAddresses(updatedAddresses)
    toast.success("Dirección establecida como predeterminada")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mis Direcciones</h1>
        <Button onClick={() => setIsAdding(true)} className="bg-gold hover:bg-gold/90">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Dirección
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Editar" : "Agregar"} Dirección</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la dirección *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Casa, Oficina, etc."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bogotá"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección completa *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle 123 #45-67"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state">Departamento</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Cundinamarca"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="110111"
                  />
                </div>
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-gold hover:bg-gold/90">
                  {editingId ? "Actualizar" : "Guardar"} Dirección
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingId(null)
                    setFormData({
                      name: "",
                      address: "",
                      city: "",
                      state: "",
                      postalCode: "",
                      country: "Colombia",
                    })
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No tienes direcciones guardadas</h3>
              <p className="text-muted-foreground mb-4">Agrega una dirección para hacer tus compras más rápidas</p>
              <Button onClick={() => setIsAdding(true)} className="bg-gold hover:bg-gold/90">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Dirección
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id} className={address.isDefault ? "border-gold" : ""}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{address.name}</h3>
                      {address.isDefault && (
                        <span className="bg-gold text-white text-xs px-2 py-1 rounded">Predeterminada</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{address.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAsDefault(address.id)}
                    className="mt-2 text-gold hover:text-gold/80"
                  >
                    Establecer como predeterminada
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
