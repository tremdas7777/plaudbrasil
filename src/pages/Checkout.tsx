import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { ChevronLeft, QrCode, Shield, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Checkout = () => {
  const { items, totalPrice, totalOriginalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "confirmation">("form");

  const discount = totalOriginalPrice - totalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirmation");
  };

  if (items.length === 0 && step !== "confirmation") {
    return (
      <Layout>
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8">Adicione produtos antes de finalizar a compra.</p>
          <Link to="/" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity">
            Ver produtos
          </Link>
        </section>
      </Layout>
    );
  }

  if (step === "confirmation") {
    return (
      <Layout>
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Pedido realizado com sucesso!</h1>
          <p className="text-muted-foreground mb-2">Obrigado por sua compra.</p>
          {paymentMethod === "pix" && (
            <div className="bg-secondary rounded-2xl p-8 mt-8 max-w-sm mx-auto">
              <QrCode className="w-32 h-32 mx-auto mb-4 text-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Escaneie o QR Code para pagar</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
              <p className="text-xs text-muted-foreground mt-2">O código expira em 30 minutos</p>
            </div>
          )}
          {paymentMethod === "card" && (
            <p className="text-muted-foreground">Você receberá a confirmação por e-mail em breve.</p>
          )}
          <Link
            to="/"
            onClick={() => clearCart()}
            className="inline-block mt-8 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Voltar à loja
          </Link>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Continuar comprando
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
          {/* Left column — Form */}
          <div className="flex-1 space-y-8">
            {/* Personal info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Dados pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Nome completo" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="E-mail" type="email" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="CPF" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="Telefone" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Endereço de entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="CEP" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="Cidade" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="Rua" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:col-span-2" />
                <input required placeholder="Número" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input placeholder="Complemento" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="Bairro" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required placeholder="Estado" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Forma de pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "pix" as const, label: "PIX", icon: QrCode, desc: "10% de desconto" },
                  { id: "card" as const, label: "Cartão", icon: CreditCard, desc: "Até 10x sem juros" },
                  { id: "boleto" as const, label: "Boleto", icon: CreditCard, desc: "5% de desconto" },
                ].map((method) => (
                  <button
                    type="button"
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <method.icon className={`w-6 h-6 ${paymentMethod === method.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-semibold text-sm text-foreground">{method.label}</span>
                    <span className="text-xs text-muted-foreground">{method.desc}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4 mt-4 p-4 bg-secondary rounded-xl">
                  <input required placeholder="Número do cartão" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="grid grid-cols-2 gap-4">
                    <input required placeholder="Validade (MM/AA)" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input required placeholder="CVV" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <input required placeholder="Nome no cartão" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <select className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatCurrency(totalOriginalPrice / n)} sem juros
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Right column — Order summary */}
          <div className="lg:w-96">
            <div className="bg-secondary rounded-2xl p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Resumo do pedido</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-background rounded-lg flex items-center justify-center flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1 rounded-lg" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Cor: {item.color} · Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatCurrency(totalOriginalPrice)}</span>
                </div>
                {paymentMethod === "pix" && discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto PIX (10%)</span>
                    <span className="text-green-600 font-medium">- {formatCurrency(discount)}</span>
                  </div>
                )}
                {paymentMethod === "boleto" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto Boleto (5%)</span>
                    <span className="text-green-600 font-medium">- {formatCurrency(totalOriginalPrice * 0.05)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-foreground">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(
                        paymentMethod === "pix"
                          ? totalPrice
                          : paymentMethod === "boleto"
                          ? totalOriginalPrice * 0.95
                          : totalOriginalPrice
                      )}
                    </p>
                    {paymentMethod === "card" && (
                      <p className="text-xs text-muted-foreground">
                        ou 10x de {formatCurrency(installmentValue)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Finalizar pedido
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3 h-3" />
                Pagamento 100% seguro
              </div>
            </div>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default Checkout;
