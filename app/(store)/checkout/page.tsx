"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCart } from "@/lib/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import StoreHeader from "@/components/store/store-header";
import StoreFooter from "@/components/store/store-footer";
import { Loader2, ShoppingCart, Plus, MapPin, CreditCard } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Address } from "@/types/address"; // ajusta la ruta según tu proyecto


// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}


type CheckoutFormProps = {
  userProfile: UserProfile;
};

const CheckoutForm: React.FC<CheckoutFormProps> = ({ userProfile }) => {
  
  

  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, getTotalPrice, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");

  const [newAddress, setNewAddress] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Colombia",
  });

  // Cargar perfil del usuario y direcciones
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (session?.user && isMounted) {
        try {
          // Cargar perfil del usuario
          const profileResponse = await fetch("/api/user/profile", {
            method: "GET",
            credentials: "include",
          });
          if (profileResponse.ok && isMounted) {
            const profile = await profileResponse.json();
            if (profile.user && isMounted) {
              userProfile = profile.user;

              // Crear dirección por defecto si existe en el perfil
              if (profile.user.address && isMounted) {
                const defaultAddress: Address = {
                  id: "default",
                  name: "Dirección principal",
                  address: profile.user.address,
                  city: profile.user.city || "",
                  state: profile.user.state || "",
                  postalCode: profile.user.postalCode || "",
                  country: "Colombia",
                  isDefault: true,
                };
                setAddresses([defaultAddress]);
                setSelectedAddress("default");
              }
            } else {
              throw new Error("Datos de perfil no encontrados");
            }
          } else {
            throw new Error("Error al cargar el perfil");
          }

          // Cargar direcciones adicionales del localStorage
          const savedAddresses = localStorage.getItem("userAddresses");
          if (savedAddresses && isMounted) {
            const parsedAddresses = JSON.parse(savedAddresses);
            // Filtrar duplicados basados en address, city, y postalCode
            const uniqueAddresses = parsedAddresses.filter(
              (addr: Address, index: number, self: Address[]) =>
                index === self.findIndex((a) => 
                  a.address === addr.address && a.city === addr.city && a.postalCode === addr.postalCode
                )
            );
            setAddresses((prev) => {
              const existingAddresses = prev.filter((a) => a.id === "default");
              return [...existingAddresses, ...uniqueAddresses];
            });
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          toast.error("No se pudo cargar tu información de perfil. Por favor, actualiza tu perfil.");
        }
      }
    };

    if (status === "authenticated") {
      loadUserData();
    }

    // Cleanup para evitar actualizaciones en un componente desmontado
    return () => {
      isMounted = false;
    };
  }, [session, status]);

  // Redirigir si no hay productos en el carrito
  useEffect(() => {
    if (items.length === 0) {
      toast.error("No hay productos en el carrito");
      router.push("/carrito");
    }
  }, [items, router]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.address || !newAddress.city) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: false,
    };

    // Verificar si la dirección ya existe
    const isDuplicate = addresses.some(
      (addr) =>
        addr.address === address.address &&
        addr.city === address.city &&
        addr.postalCode === address.postalCode
    );
    if (isDuplicate) {
      toast.error("Esta dirección ya está registrada");
      return;
    }

    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);

    // Guardar en localStorage (excluyendo la dirección por defecto)
    const addressesToSave = updatedAddresses.filter((addr) => addr.id !== "default");
    localStorage.setItem("userAddresses", JSON.stringify(addressesToSave));

    setSelectedAddress(address.id);
    setShowAddressDialog(false);
    setNewAddress({
      name: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Colombia",
    });
    toast.success("Dirección agregada correctamente");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (isLoading) return;
  
    if (!userProfile) {
      toast.error("Por favor completa tu perfil antes de continuar.");
      return;
    }
  
    if (items.length === 0) {
      toast.error("No hay productos en el carrito");
      return;
    }
  
    if (addresses.length === 0) {
      toast.error("Debes agregar al menos una dirección de envío.");
      return;
    }
  
    if (!selectedAddress) {
      toast.error("Por favor selecciona una dirección de envío");
      return;
    }
  
    const selectedAddr = addresses.find((addr) => addr.id === selectedAddress);
    if (!selectedAddr) {
      toast.error("La dirección seleccionada no es válida.");
      return;
    }
  
    if (!paymentMethod) {
      toast.error("Por favor selecciona un método de pago.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      if (paymentMethod === "stripe") {
        if (!stripe || !elements) {
          toast.error("Stripe no está disponible en este momento.");
          setIsLoading(false);
          return;
        }
  
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round((getTotalPrice() || 0) * 1.19 * 100),
            currency: "cop",
            items: items.map((item) => ({
              productId: item.id.split("-")[0],
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
            })),
            shippingAddress: selectedAddr,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Error al crear el payment intent");
        }
  
        const { clientSecret } = await response.json();
  
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Elemento de tarjeta no encontrado");
        }
  
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: userProfile.name,
              email: userProfile.email,
            },
          },
        });
  
        if (error) {
          throw new Error(error.message);
        }
  
        if (paymentIntent.status === "succeeded") {
          const orderResponse = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((item) => ({
                productId: item.id.split("-")[0],
                quantity: item.quantity,
                price: item.price,
                size: item.size || null,
              })),
              shippingAddress: `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.state}, ${selectedAddr.postalCode}, ${selectedAddr.country}`,
              paymentMethod: "stripe",
              paymentIntentId: paymentIntent.id,
              total: (getTotalPrice() || 0) * 1.19,
            }),
          });
  
          if (!orderResponse.ok) {
            throw new Error("Error al crear la orden");
          }
  
          const { orderId } = await orderResponse.json();
          clearCart();
          toast.success("¡Pago procesado exitosamente!");
          router.push(`/checkout/confirmacion?orderId=${orderId}`);
        }
      } else {
        // Pago alternativo sin Stripe
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.id.split("-")[0],
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
            })),
            shippingAddress: `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.state}, ${selectedAddr.postalCode}, ${selectedAddr.country}`,
            paymentMethod: paymentMethod,
            total: (getTotalPrice() || 0) * 1.19,
          }),
        });
  
        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || "Error al crear la orden");
        }
  
        const { orderId } = await orderResponse.json();
        clearCart();
        toast.success("¡Pedido creado exitosamente!");
        router.push(`/checkout/confirmacion?orderId=${orderId}`);
      }
    } catch (error: any) {
      console.error("Error al procesar el pedido:", error);
      toast.error(error.message || "Error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };
  

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
            <p>Cargando...</p>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
              <p className="mb-6">Agrega algunos productos antes de proceder al checkout</p>
              <Button asChild className="bg-gold hover:bg-gold/90 text-white">
                <Link href="/tienda">Ir a la tienda</Link>
              </Button>
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userProfile ? (
                      <div className="space-y-2">
                        <p><strong>Nombre:</strong> {userProfile.name}</p>
                        <p><strong>Email:</strong> {userProfile.email}</p>
                        {userProfile.phone && (
                          <p><strong>Teléfono:</strong> {userProfile.phone}</p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">
                          No se pudo cargar tu información de perfil
                        </p>
                        <Button asChild variant="outline">
                          <Link href="/cuenta/perfil">Actualizar Perfil</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Dirección de Envío</CardTitle>
                    <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Agregar Dirección
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nueva Dirección</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="addressName">Nombre de la dirección *</Label>
                            <Input
                              id="addressName"
                              value={newAddress.name}
                              onChange={(e) =>
                                setNewAddress((prev) => ({ ...prev, name: e.target.value }))
                              }
                              placeholder="Casa, Oficina, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor="addressLine">Dirección *</Label>
                            <Input
                              id="addressLine"
                              value={newAddress.address}
                              onChange={(e) =>
                                setNewAddress((prev) => ({ ...prev, address: e.target.value }))
                              }
                              placeholder="Calle 123 #45-67"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="addressCity">Ciudad *</Label>
                              <Input
                                id="addressCity"
                                value={newAddress.city}
                                onChange={(e) =>
                                  setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                                }
                                placeholder="Bogotá"
                              />
                            </div>
                            <div>
                              <Label htmlFor="addressState">Estado/Provincia</Label>
                              <Input
                                id="addressState"
                                value={newAddress.state}
                                onChange={(e) =>
                                  setNewAddress((prev) => ({ ...prev, state: e.target.value }))
                                }
                                placeholder="Cundinamarca"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="addressPostal">Código Postal</Label>
                            <Input
                              id="addressPostal"
                              value={newAddress.postalCode}
                              onChange={(e) =>
                                setNewAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                              }
                              placeholder="110111"
                            />
                          </div>
                          <Button onClick={handleAddAddress} className="w-full">
                            Agregar Dirección
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-muted-foreground mb-4">
                          No tienes direcciones guardadas. Por favor actualiza tu perfil o agrega
                          una nueva dirección.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button asChild variant="outline">
                            <Link href="/cuenta/perfil">Actualizar Perfil</Link>
                          </Button>
                          <Button onClick={() => setShowAddressDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Dirección
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className="flex items-start space-x-2 p-4 border rounded-lg"
                          >
                            <RadioGroupItem
                              value={address.id}
                              id={address.id}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <Label htmlFor={address.id} className="font-medium">
                                {address.name}
                                {address.isDefault && (
                                  <span className="ml-2 text-xs bg-gold text-white px-2 py-1 rounded">
                                    Principal
                                  </span>
                                )}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {address.address}, {address.city}
                                {address.state && `, ${address.state}`}
                                {address.postalCode && `, ${address.postalCode}`}, {address.country}
                              </p>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Tarjeta de Crédito/Débito (Stripe)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cash-on-delivery" id="cash-on-delivery" />
                        <Label htmlFor="cash-on-delivery">Pago Contra Entrega</Label>
                      </div>
                    </RadioGroup>

                    {paymentMethod === "stripe" && (
                      <div className="mt-6 p-4 border rounded-lg">
                        <Label className="text-sm font-medium mb-2 block">
                          Información de la Tarjeta
                        </Label>
                        <div className="p-3 border rounded">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#424770",
                                  "::placeholder": {
                                    color: "#aab7c4",
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Tu información de pago está protegida con encriptación SSL
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Link href="/carrito">
                    <Button variant="outline" type="button">
                      Volver al carrito
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    className="bg-gold hover:bg-gold/90 text-white"
                    disabled={isLoading || addresses.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Completar Pedido"
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <div className="bg-white rounded-lg shadow p-6 sticky top-20">
                <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>

                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{item.name}</span>
                        <div className="text-xs text-muted-foreground">
                          Cantidad: {item.quantity}
                          {item.size && ` | Talla: ${item.size}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Precio unitario: {formatPrice(item.price || 0)}
                        </div>
                      </div>
                      <span className="font-medium text-sm">
                        {formatPrice((item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice() || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (19%)</span>
                    <span>{formatPrice((getTotalPrice() || 0) * 0.19)}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice((getTotalPrice() || 0) * 1.19)}</span>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  <p>* Los precios incluyen IVA</p>
                  <p>* Envío gratuito a toda Colombia</p>
                  <p>* Pago seguro con Stripe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "CUSTOMER") {
      setLoading(true);
      fetch("/api/user/profile")
        .then(async (res) => {
          if (!res.ok) throw new Error("No autorizado o error al obtener perfil");
          const data = await res.json();
          setProfile(data.user);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setError("No estás autenticado.");
    }
  }, [status, session]);

  if (loading) return <p>Cargando perfil...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!profile) return <p>Perfil no disponible.</p>;

  

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm userProfile={profile as UserProfile} />
    </Elements>
  );
  
}