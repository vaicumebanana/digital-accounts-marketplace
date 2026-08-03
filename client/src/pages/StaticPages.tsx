import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

// ============================================================================
// FAQ PAGE
// ============================================================================

export function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "Como funciona a entrega das contas?",
      answer:
        "Após confirmar o pagamento, as contas são entregues automaticamente em sua conta do cliente. Você receberá um email com os detalhes de login.",
    },
    {
      question: "Qual é a garantia das contas?",
      answer:
        "Todas as contas vêm com garantia de funcionamento. Se houver problemas, entre em contato com nosso suporte para reembolso ou substituição.",
    },
    {
      question: "Quais são os métodos de pagamento aceitos?",
      answer:
        "Aceitamos PIX, PayPal (USD, EUR, BRL) e criptomoedas (BTC, ETH, USDT).",
    },
    {
      question: "Posso compartilhar a conta com outras pessoas?",
      answer:
        "As contas são para uso pessoal. Compartilhá-las pode violar os termos de serviço da plataforma.",
    },
    {
      question: "Como funciona o sistema de cupons?",
      answer:
        "Você pode aplicar cupons no checkout para obter descontos. Cada cupom tem suas próprias regras de uso.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-muted-foreground">
            Encontre respostas para as perguntas mais comuns
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card
              key={index}
              className="card-premium cursor-pointer"
              onClick={() => toggleItem(index)}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </div>
              {openItems.includes(index) && (
                <p className="text-muted-foreground mt-4">{faq.answer}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TERMS OF SERVICE PAGE
// ============================================================================

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao usar nossa plataforma, você concorda em cumprir estes termos e condições. Se não
              concordar, não use o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Uso da Plataforma</h2>
            <p>
              Você concorda em usar a plataforma apenas para fins legais e de acordo com estes
              termos. Você não deve usar a plataforma para atividades ilegais ou prejudiciais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Contas e Segurança</h2>
            <p>
              Você é responsável por manter a confidencialidade de suas credenciais de login. Você
              concorda em aceitar responsabilidade por todas as atividades que ocorrem em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Limitação de Responsabilidade</h2>
            <p>
              Não somos responsáveis por danos indiretos, incidentais ou consequentes resultantes do
              uso de nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Modificações dos Termos</h2>
            <p>
              Reservamos o direito de modificar estes termos a qualquer momento. Mudanças entram em
              vigor imediatamente após publicação.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRIVACY POLICY PAGE
// ============================================================================

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <div className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">1. Coleta de Dados</h2>
            <p>
              Coletamos informações que você nos fornece diretamente, como nome, email e endereço.
              Também coletamos dados sobre como você usa nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">2. Uso de Dados</h2>
            <p>
              Usamos seus dados para fornecer serviços, processar transações, enviar comunicações e
              melhorar nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">3. Proteção de Dados</h2>
            <p>
              Implementamos medidas de segurança para proteger seus dados pessoais contra acesso não
              autorizado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">4. Cookies</h2>
            <p>
              Usamos cookies para melhorar sua experiência. Você pode desabilitar cookies em seu
              navegador se desejar.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-3">5. Seus Direitos</h2>
            <p>
              Você tem o direito de acessar, corrigir ou deletar seus dados pessoais. Entre em
              contato conosco para exercer esses direitos.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONTACT PAGE
// ============================================================================

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send the form data to a server
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Entre em Contato</h1>
          <p className="text-muted-foreground">
            Tem dúvidas? Estamos aqui para ajudar. Entre em contato conosco.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="card-premium">
            <h2 className="text-2xl font-bold mb-6">Envie uma Mensagem</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Nome</label>
                <Input
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Assunto</label>
                <Input
                  placeholder="Assunto da mensagem"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Mensagem</label>
                <Textarea
                  placeholder="Sua mensagem..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="btn-premium gradient-primary text-white w-full">
                Enviar Mensagem
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="card-premium">
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground">support@digitalhub.com</p>
            </Card>

            <Card className="card-premium">
              <h3 className="font-semibold mb-2">Telefone</h3>
              <p className="text-muted-foreground">+55 (11) 9999-9999</p>
            </Card>

            <Card className="card-premium">
              <h3 className="font-semibold mb-2">Horário de Atendimento</h3>
              <p className="text-muted-foreground">
                Segunda a Sexta: 9h às 18h<br />
                Sábado: 10h às 14h<br />
                Domingo: Fechado
              </p>
            </Card>

            <Card className="card-premium">
              <h3 className="font-semibold mb-2">Redes Sociais</h3>
              <p className="text-muted-foreground">
                Siga-nos nas redes sociais para atualizações e promoções.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
