import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { Loader2, Search, ShoppingCart, Heart, Zap, Shield, Truck, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const { data: categories } = trpc.products.getCategories.useQuery();
  const { data: announcements } = trpc.pages.getAnnouncements.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Banner */}
      {announcements && announcements.length > 0 && (
        <div
          className="w-full py-3 px-4 text-center text-sm font-semibold text-white"
          style={{
            backgroundColor: announcements[0].backgroundColor || '#FF6B6B',
            color: announcements[0].textColor || '#FFFFFF',
          }}
        >
          {announcements[0].content}
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-gradient">
              DigitalHub
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href="#products" className="text-sm font-medium hover:text-accent transition">
                Produtos
              </Link>
              <Link href="#categories" className="text-sm font-medium hover:text-accent transition">
                Categorias
              </Link>
              <Link href="/faq" className="text-sm font-medium hover:text-accent transition">
                FAQ
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="p-2 hover:bg-muted rounded-lg transition">
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <Link href="/profile" className="text-sm font-medium hover:text-accent transition">
                  {user?.name || "Perfil"}
                </Link>
              </>
            ) : (
              <Button onClick={() => startLogin()} className="btn-premium gradient-primary">
                Entrar
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-indigo-600/10 pointer-events-none" />

        <div className="container relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Acesso Instantâneo a Contas <span className="text-gradient">Premium</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Compre contas digitais verificadas com entrega automática. Netflix, Spotify, Gaming e muito mais.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="btn-premium gradient-primary text-white">
                  Explorar Produtos
                </Button>
                <Button variant="outline" className="btn-premium">
                  Saber Mais
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">10K+</p>
                  <p className="text-sm text-muted-foreground">Clientes Satisfeitos</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-muted-foreground">Plataformas</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">Suporte</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur-3xl opacity-20" />
              <div className="glass-card relative">
                <div className="space-y-4">
                  <div className="h-40 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg animate-float" />
                  <p className="text-sm text-muted-foreground text-center">
                    Compre com segurança e receba instantaneamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Por que nos escolher?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Oferecemos a melhor experiência em compra de contas digitais com segurança e confiabilidade
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Entrega Instantânea",
                description: "Receba suas contas imediatamente após a confirmação do pagamento",
              },
              {
                icon: Shield,
                title: "100% Seguro",
                description: "Criptografia de ponta a ponta e proteção total dos seus dados",
              },
              {
                icon: Truck,
                title: "Garantia",
                description: "Todas as contas vêm com garantia de funcionamento",
              },
            ].map((feature, i) => (
              <Card key={i} className="card-premium">
                <feature.icon className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Categorias Populares</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {categories?.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group">
                <Card className="card-premium h-32 flex items-center justify-center cursor-pointer">
                  <div className="text-center">
                    <p className="font-semibold group-hover:text-accent transition">
                      {category.name}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section id="products" className="py-16 bg-card/50">
        <div className="container">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Buscar Produtos</h2>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por plataforma, tipo ou categoria..."
                className="pl-12 h-12 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {searchQuery && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-4">Buscando produtos...</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-t border-b border-gray-200 dark:border-gray-800">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Pagamentos Seguros", icon: "🔒" },
              { label: "Suporte 24/7", icon: "💬" },
              { label: "Garantia de Reembolso", icon: "💰" },
              { label: "Verificado e Confiável", icon: "✓" },
            ].map((badge, i) => (
              <div key={i} className="space-y-2">
                <p className="text-3xl">{badge.icon}</p>
                <p className="font-semibold">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="glass-card text-center space-y-6">
            <h2 className="text-3xl font-bold">Pronto para começar?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Junte-se a milhares de clientes satisfeitos e acesse suas contas premium agora mesmo
            </p>
            <Button
              onClick={() => isAuthenticated ? undefined : startLogin()}
              className="btn-premium gradient-primary text-white"
            >
              {isAuthenticated ? "Ir para Loja" : "Criar Conta Agora"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-lg mb-4">DigitalHub</p>
              <p className="text-sm text-muted-foreground">
                Sua plataforma confiável para contas digitais premium
              </p>
            </div>
            <div>
              <p className="font-semibold mb-4">Links Rápidos</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-accent transition">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-accent transition">Termos</Link></li>
                <li><Link href="/privacy" className="hover:text-accent transition">Privacidade</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Suporte</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/tickets" className="hover:text-accent transition">Tickets</Link></li>
                <li><a href="mailto:support@digitalhub.com" className="hover:text-accent transition">Email</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DigitalHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
