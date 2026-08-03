import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, ShoppingCart, DollarSign, Package, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

const COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="card-premium p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar o painel administrativo.
          </p>
          <Button onClick={() => navigate("/")} className="w-full">
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }

  // Mock data
  const revenueData = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 3000 },
    { month: "Mar", revenue: 2000 },
    { month: "Apr", revenue: 2780 },
    { month: "May", revenue: 1890 },
    { month: "Jun", revenue: 2390 },
  ];

  const salesData = [
    { month: "Jan", sales: 120 },
    { month: "Feb", sales: 132 },
    { month: "Mar", sales: 101 },
    { month: "Apr", sales: 98 },
    { month: "May", sales: 86 },
    { month: "Jun", sales: 99 },
  ];

  const categoryData = [
    { name: "Netflix", value: 400 },
    { name: "Spotify", value: 300 },
    { name: "Gaming", value: 300 },
    { name: "Streaming", value: 200 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie sua plataforma e visualize analytics</p>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="card-premium">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-3xl font-bold">R$ 15.234</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xs text-green-600 mt-2">+12% este mês</p>
          </Card>

          <Card className="card-premium">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Vendas</p>
                <p className="text-3xl font-bold">342</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xs text-green-600 mt-2">+8% este mês</p>
          </Card>

          <Card className="card-premium">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-3xl font-bold">1.234</p>
              </div>
              <Users className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xs text-green-600 mt-2">+5% este mês</p>
          </Card>

          <Card className="card-premium">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Estoque</p>
                <p className="text-3xl font-bold">456</p>
              </div>
              <Package className="w-8 h-8 text-accent" />
            </div>
            <p className="text-xs text-yellow-600 mt-2">Baixo em 2 categorias</p>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Receita</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="card-premium">
              <h3 className="text-lg font-semibold mb-4">Receita Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <Card className="card-premium">
              <h3 className="text-lg font-semibold mb-4">Vendas Mensais</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card className="card-premium">
              <h3 className="text-lg font-semibold mb-4">Vendas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Management Sections */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card className="card-premium">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gerenciar Produtos</h3>
                <Button className="btn-premium gradient-primary text-white text-sm">
                  + Novo Produto
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Adicione, edite ou remova produtos do seu catálogo
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="card-premium">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gerenciar Pedidos</h3>
                <Input placeholder="Buscar pedido..." className="max-w-xs" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Visualize e gerencie todos os pedidos
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="card-premium">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gerenciar Usuários</h3>
                <Input placeholder="Buscar usuário..." className="max-w-xs" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Visualize e gerencie todos os usuários
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-4">
            <Card className="card-premium">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Gerenciar Cupons</h3>
                <Button className="btn-premium gradient-primary text-white text-sm">
                  + Novo Cupom
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  Crie e gerencie cupons de desconto
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
