import { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { ChevronLeft, QrCode, Shield, Lock, Copy, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getPaymentGatewayConfig } from "@/lib/paymentGateway";
import { toast } from "sonner";

const EMAIL_DOMAINS = [
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com.br",
  "yahoo.com",
  "icloud.com",
  "live.com",
  "uol.com.br",
  "bol.com.br",
  "terra.com.br",
  "globo.com",
  "protonmail.com",
];

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

interface PixResult {
  transaction_hash: string;
  pix_qr_code: string | null;
  pix_qr_code_url: string | null;
  pix_copy_paste: string | null;
  status: string;
  amount: number;
  expires_at: string | null;
}

const Checkout = () => {
  const { items, totalPrice, totalOriginalPrice, clearCart } = useCart();
  const [step, setStep] = useState<"form" | "processing" | "pix" | "confirmation">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixData, setPixData] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Form fields
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [estado, setEstado] = useState("");

  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const emailRef = useRef<HTMLDivElement>(null);

  const discount = totalOriginalPrice - totalPrice;

  // Close email suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emailRef.current && !emailRef.current.contains(e.target as Node)) {
        setShowEmailSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Email autocomplete
  const handleEmailChange = (value: string) => {
    setEmail(value);
    const atIndex = value.indexOf("@");
    if (atIndex > 0) {
      const typed = value.slice(atIndex + 1).toLowerCase();
      const matches = EMAIL_DOMAINS.filter((d) => d.startsWith(typed) && d !== typed);
      setEmailSuggestions(matches.map((d) => value.slice(0, atIndex + 1) + d));
      setShowEmailSuggestions(matches.length > 0);
    } else {
      setShowEmailSuggestions(false);
    }
  };

  const selectEmailSuggestion = (suggestion: string) => {
    setEmail(suggestion);
    setShowEmailSuggestions(false);
  };

  // CEP auto-fill via ViaCEP
  const fetchCep = useCallback(async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.logradouro) setRua(data.logradouro);
        if (data.bairro) setBairro(data.bairro);
        if (data.localidade) setCidade(data.localidade);
        if (data.uf) setEstado(data.uf);
      }
    } catch {
      // silently fail
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleCepChange = (value: string) => {
    // Format CEP as 00000-000
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);
    if (digits.length === 8) {
      fetchCep(digits);
    }
  };

  const handleCopyPix = async () => {
    if (pixData?.pix_copy_paste) {
      await navigator.clipboard.writeText(pixData.pix_copy_paste);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneDigits = telefone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      toast.error("Telefone inválido. Use (DD) 00000-0000.");
      return;
    }

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      toast.error("CPF inválido. Digite 11 dígitos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const gatewayConfig = getPaymentGatewayConfig();

      const cleanCpf = cpf.replace(/\D/g, "");
      const cleanPhone = telefone.replace(/\D/g, "");

      // IronPay defaults - used when admin hasn't configured yet
      const IRONPAY_DEFAULT_TOKEN = "RUOkOpSr6bO7jIo6yAJkqKG7ASU2tXoEtpvJQnmaf8eX4uuEIK27vdOreVHv";
      const IRONPAY_DEFAULT_OFFER = "tlvh7fvagm";

      const apiToken = gatewayConfig.ironpay.apiToken || IRONPAY_DEFAULT_TOKEN;
      const offerHash = gatewayConfig.ironpay.offerHash || IRONPAY_DEFAULT_OFFER;

      console.log("Gateway config:", JSON.stringify(gatewayConfig));
      console.log("Using IronPay token:", apiToken ? "set" : "missing", "offer:", offerHash);

      // Always try IronPay PIX
      {
        setStep("processing");

        const amountInCentavos = Math.round(totalPrice * 100);

        const { data, error } = await supabase.functions.invoke("ironpay-pix", {
          body: {
            api_token: apiToken,
            offer_hash: offerHash,
            amount: amountInCentavos,
            customer_name: nome,
            customer_email: email,
            customer_cpf: cleanCpf,
            customer_phone: cleanPhone,
            items: items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: Math.round(item.price * 100),
            })),
          },
        });

        if (error) {
          throw new Error(error.message || "Erro ao processar pagamento");
        }

        if (!data?.success) {
          throw new Error(data?.error || "Erro ao gerar PIX");
        }

        setPixData(data);
        setStep("pix");

        // Save order to localStorage
        const order = {
          id: data.transaction_hash || crypto.randomUUID(),
          date: new Date().toISOString(),
          customer: { nome, email, cpf, telefone },
          items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total: totalPrice,
          status: "pending",
          gateway: "ironpay",
        };
        const existing = JSON.parse(localStorage.getItem("generated_orders") || "[]");
        existing.push(order);
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      toast.error(err.message || "Erro ao processar pagamento. Tente novamente.");
      setStep("form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step === "form") {
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

  // Processing state
  if (step === "processing") {
    return (
      <Layout>
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Gerando seu PIX...</h1>
          <p className="text-muted-foreground">Aguarde enquanto processamos seu pagamento.</p>
        </section>
      </Layout>
    );
  }

  // PIX payment screen (from IronPay)
  if (step === "pix" && pixData) {
    return (
      <Layout>
        <section className="max-w-2xl mx-auto px-6 py-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Pague com PIX</h1>
          <p className="text-muted-foreground mb-6">Escaneie o QR Code ou copie o código para pagar</p>

          <div className="bg-secondary rounded-2xl p-8 max-w-sm mx-auto space-y-4">
            {pixData.pix_copy_paste ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData.pix_copy_paste)}`}
                alt="QR Code PIX"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            ) : pixData.pix_qr_code_url ? (
              <img
                src={pixData.pix_qr_code_url}
                alt="QR Code PIX"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            ) : (
              <QrCode className="w-32 h-32 mx-auto text-foreground" />
            )}

            <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>

            {pixData.pix_copy_paste && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Código PIX copia e cola:</p>
                <div className="bg-background border border-border rounded-lg p-3 text-xs font-mono break-all text-foreground max-h-20 overflow-y-auto">
                  {pixData.pix_copy_paste}
                </div>
                <button
                  onClick={handleCopyPix}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copiado!" : "Copiar código"}
                </button>
              </div>
            )}

            {pixData.expires_at && (
              <p className="text-xs text-muted-foreground">
                Expira em: {new Date(pixData.expires_at).toLocaleString("pt-BR")}
              </p>
            )}
          </div>

          <Link
            to="/"
            onClick={() => clearCart()}
            className="inline-block mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Voltar à loja
          </Link>
        </section>
      </Layout>
    );
  }

  // Static confirmation (fallback for other gateways)
  if (step === "confirmation") {
    return (
      <Layout>
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Pedido realizado com sucesso!</h1>
          <p className="text-muted-foreground mb-2">Obrigado por sua compra.</p>
          <div className="bg-secondary rounded-2xl p-8 mt-8 max-w-sm mx-auto">
            <QrCode className="w-32 h-32 mx-auto mb-4 text-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Escaneie o QR Code para pagar</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
            <p className="text-xs text-muted-foreground mt-2">O código expira em 30 minutos</p>
          </div>
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
                <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <div ref={emailRef} className="relative">
                  <input
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onFocus={() => { if (emailSuggestions.length > 0) setShowEmailSuggestions(true); }}
                    placeholder="E-mail"
                    type="email"
                    autoComplete="off"
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {showEmailSuggestions && (
                    <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                      {emailSuggestions.slice(0, 5).map((s) => (
                        <li
                          key={s}
                          onClick={() => selectEmailSuggestion(s)}
                          className="px-4 py-2.5 text-sm text-foreground hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <input required value={cpf} onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                  let formatted = digits;
                  if (digits.length > 9) formatted = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6,9)}-${digits.slice(9)}`;
                  else if (digits.length > 6) formatted = `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
                  else if (digits.length > 3) formatted = `${digits.slice(0,3)}.${digits.slice(3)}`;
                  setCpf(formatted);
                }} placeholder="CPF" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required value={telefone} onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                  let formatted = digits;
                  if (digits.length > 6) formatted = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
                  else if (digits.length > 2) formatted = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
                  setTelefone(formatted);
                }} placeholder="Telefone (00) 00000-0000" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Endereço de entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input required value={cep} onChange={(e) => handleCepChange(e.target.value)} placeholder="CEP" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <input required value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 sm:col-span-2" />
                <input required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Complemento" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input required value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Estado" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            {/* Payment — PIX only */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Forma de pagamento</h2>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5">
                <QrCode className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-semibold text-sm text-foreground">PIX</span>
                  <p className="text-xs text-muted-foreground">10% de desconto</p>
                </div>
              </div>
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
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto PIX (10%)</span>
                    <span className="text-primary font-medium">- {formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-primary font-medium">Grátis</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-foreground">Total</span>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Pagar com PIX"
                )}
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
