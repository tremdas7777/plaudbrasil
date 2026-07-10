import { useState, useRef, useEffect, useCallback } from "react";
import { useCart } from "@/contexts/CartContext";
import Layout from "@/components/Layout";
import { ChevronLeft, QrCode, CreditCard, Lock, Copy, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { saveOrderToStorage } from "@/lib/ordersStorage";
import { toast } from "sonner";
import QRCode from "qrcode";
import { trackEvent } from "@/lib/funnelTracking";

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
  const [step, setStep] = useState<"form" | "processing" | "pix" | "card_success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixData, setPixData] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");

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

  // Card fields
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardInstallments, setCardInstallments] = useState(1);

  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const emailRef = useRef<HTMLDivElement>(null);

  // PIX: 10% off (usa totalPrice). Cartão: preço cheio (totalOriginalPrice).
  const amountToCharge = paymentMethod === "pix" ? totalPrice : totalOriginalPrice;
  const discount = paymentMethod === "pix" ? totalOriginalPrice - totalPrice : 0;

  useEffect(() => { trackEvent('checkout'); }, []);

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

  useEffect(() => {
    let active = true;

    const generateQrCode = async () => {
      const qrSource = pixData?.pix_copy_paste || pixData?.pix_qr_code;

      if (!qrSource) {
        setQrCodeDataUrl(null);
        return;
      }

      try {
        const dataUrl = await QRCode.toDataURL(qrSource, {
          width: 320,
          margin: 1,
        });

        if (active) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (error) {
        console.error("QR generation error:", error);
        if (active) {
          setQrCodeDataUrl(null);
        }
      }
    };

    void generateQrCode();

    return () => {
      active = false;
    };
  }, [pixData]);

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

    // Card validation
    let cardPayload: {
      holderName: string;
      number: string;
      expirationMonth: string;
      expirationYear: string;
      cvv: string;
      installments: number;
    } | undefined;

    if (paymentMethod === "card") {
      const numDigits = cardNumber.replace(/\s/g, "");
      const [mm, yy] = cardExpiry.split("/").map((s) => s?.trim() ?? "");
      if (!cardHolder.trim()) return toast.error("Informe o nome no cartão.");
      if (numDigits.length < 13) return toast.error("Número do cartão inválido.");
      if (!mm || !yy) return toast.error("Validade inválida. Use MM/AA.");
      if (cardCvv.length < 3) return toast.error("CVV inválido.");
      cardPayload = {
        holderName: cardHolder.trim().toUpperCase(),
        number: numDigits,
        expirationMonth: mm,
        expirationYear: yy,
        cvv: cardCvv,
        installments: cardInstallments,
      };
    }

    setIsSubmitting(true);

    try {
      const amountInCentavos = Math.round(amountToCharge * 100);

      setStep("processing");

      const { data, error } = await supabase.functions.invoke("legacy-payin", {
        body: {
          paymentMethod: paymentMethod === "pix" ? "PIX" : "CREDIT_CARD",
          amount: amountInCentavos,
          referenceId: `pedido-${Date.now()}`,
          isPhysicalProduct: true,
          customer: {
            name: nome,
            email,
            document: cpfDigits,
            phone: `55${phoneDigits}`,
            address: {
              street: rua,
              number: numero,
              zipCode: cep,
              city: cidade,
              state: estado,
              complement: complemento || undefined,
              neighborhood: bairro || undefined,
            },
          },
          items: items.map((i) => ({
            title: `${i.name} - ${i.color}`,
            quantity: i.quantity,
            unitPrice: Math.round((paymentMethod === "pix" ? i.price : i.originalPrice) * 100),
          })),
          card: cardPayload,
        },
      });

      if (error) throw new Error(error.message || "Erro ao processar pagamento");
      if (!data?.success) throw new Error(data?.error || "Erro na Legacy");

      const orderId = data.transaction_hash || crypto.randomUUID();

      try {
        saveOrderToStorage({
          id: orderId,
          created_at: new Date().toISOString(),
          buyer_name: nome,
          buyer_email: email,
          buyer_document: cpf,
          buyer_phone: telefone,
          buyer_address: rua,
          buyer_address_number: numero,
          buyer_complement: complemento,
          buyer_neighborhood: bairro,
          buyer_city: cidade,
          buyer_state: estado,
          buyer_cep: cep,
          items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: paymentMethod === "pix" ? i.price : i.originalPrice })),
          items_description: items.map((i) => `${i.quantity}x ${i.name}`).join(", "),
          amount_cents: amountInCentavos,
          pix_code: data.pix_copy_paste || null,
          status: data.status === "APPROVED" ? "paid" : "pending",
          gateway: "legacy",
          shipping_method: paymentMethod,
        });
      } catch (storageError) {
        console.warn("Failed to persist order:", storageError);
      }

      if (paymentMethod === "pix") {
        setPixData({
          transaction_hash: orderId,
          pix_qr_code: data.pix_qr_code || null,
          pix_qr_code_url: data.pix_qr_code_url || null,
          pix_copy_paste: data.pix_copy_paste || data.pix_qr_code || null,
          status: data.status || "PENDING",
          amount: data.amount || amountInCentavos,
          expires_at: data.expires_at || null,
        });
        setStep("pix");
      } else {
        if (data.status === "APPROVED") {
          toast.success("Pagamento aprovado!");
          setStep("card_success");
        } else if (data.status === "REFUSED") {
          throw new Error("Cartão recusado. Tente outro cartão ou pague com PIX.");
        } else {
          toast.info("Pagamento em análise. Você receberá a confirmação por e-mail.");
          setStep("card_success");
        }
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
          <h1 className="text-2xl font-bold mb-2 text-foreground">Processando pagamento...</h1>
          <p className="text-muted-foreground">Aguarde enquanto validamos com a operadora.</p>
        </section>
      </Layout>
    );
  }

  // Card success
  if (step === "card_success") {
    return (
      <Layout>
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-foreground">Pedido recebido!</h1>
          <p className="text-muted-foreground mb-8">
            Enviaremos a confirmação por e-mail assim que o pagamento for aprovado.
          </p>
          <Link
            to="/"
            onClick={() => clearCart()}
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Voltar à loja
          </Link>
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
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
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

            {/* Payment method */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Forma de pagamento</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("pix")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                    paymentMethod === "pix" ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <QrCode className={`w-6 h-6 ${paymentMethod === "pix" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <span className="font-semibold text-sm text-foreground block">PIX</span>
                    <span className="text-xs text-primary font-medium">10% de desconto</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                    paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"
                  }`}
                >
                  <CreditCard className={`w-6 h-6 ${paymentMethod === "card" ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <span className="font-semibold text-sm text-foreground block">Cartão de crédito</span>
                    <span className="text-xs text-muted-foreground">Em até 10x sem juros</span>
                  </div>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-3 pt-2">
                  <input required value={cardHolder} onChange={(e) => setCardHolder(e.target.value.toUpperCase())} placeholder="Nome impresso no cartão" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <input required value={cardNumber} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 19); setCardNumber(d.replace(/(\d{4})(?=\d)/g, "$1 ")); }} placeholder="Número do cartão" inputMode="numeric" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="grid grid-cols-2 gap-3">
                    <input required value={cardExpiry} onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCardExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d); }} placeholder="Validade (MM/AA)" inputMode="numeric" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input required value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVV" inputMode="numeric" className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                  <select value={cardInstallments} onChange={(e) => setCardInstallments(Number(e.target.value))} className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>{n}x de {formatCurrency(amountToCharge / n)} sem juros</option>
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
                  <p className="text-2xl font-bold text-primary">{formatCurrency(amountToCharge)}</p>
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
                  paymentMethod === "pix" ? "Pagar com PIX" : "Pagar com Cartão"
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
