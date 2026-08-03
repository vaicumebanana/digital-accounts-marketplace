import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Heart, Download, LogOut, Loader2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: orders, isLoading: ordersLoading } = trpc.orders.getOrders.useQuery();
  const { data: favorites } = trpc.favorites.getFavorites.useQuery();
  const { data: notifications } = trpc.notifications.getNotifications.useQuery();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bem-vindo, {user.name}</h1>
            <p className="text-muted-foreground">Gerencie suas contas e pedidos</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="card-premium">
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
            <p className="text-3xl font-bold">{orders?.length || 0}</p>
          </Card>
          <Card className="card-premium">
            <p className="text-sm text-muted-foreground">Favoritos</p>
            <p className="text-3xl font-bold">{favorites?.length || 0}</p>
          </Card>
          <Card className="card-premium">
            <p className="text-sm text-muted-foreground">Notificações</p>
            <p className="text-3xl font-bold">
              {notifications?.filter((n) => !n.isRead).length || 0}
            </p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="downloads">Downloads</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-4">
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="card-premium">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {parseFloat(order.totalAmount.toString()).toFixed(2)}
                        </p>
                        <p className={`text-sm font-medium ${
                          order.status === "delivered"
                            ? "text-green-600"
                            : order.status === "paid"
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }`}>
                          {order.status === "delivered"
                            ? "Entregue"
                            : order.status === "paid"
                            ? "Pago"
                            : "Pendente"}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-premium text-center py-12">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum pedido realizado ainda</p>
              </Card>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {favorites && favorites.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {favorites.map((favorite) => (
                  <Card key={favorite.id} className="card-premium">
                    <p className="font-semibold">Produto #{favorite.productId}</p>
                    <p className="text-sm text-muted-foreground">
                      Adicionado em{" "}
                      {new Date(favorite.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-premium text-center py-12">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum favorito adicionado</p>
              </Card>
            )}
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-4">
            <Card className="card-premium text-center py-12">
              <Download className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum download disponível</p>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="card-premium space-y-4">
              <div>
                <label className="text-sm font-semibold">Nome</label>
                <p className="text-muted-foreground">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold">Email</label>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold">Membro desde</label>
                <p className="text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
