const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LEGACY_BASE = "https://api.legacyecombr.com.br";

interface CardInput {
  holderName: string;
  number: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
  installments?: number;
}

interface RequestBody {
  paymentMethod: "PIX" | "CREDIT_CARD";
  amount: number; // centavos
  referenceId?: string;
  isPhysicalProduct?: boolean;
  payerIp?: string;
  customer: {
    name: string;
    email: string;
    document: string;
    phone: string;
    address: {
      street: string;
      number: string;
      zipCode: string;
      city: string;
      state: string;
      complement?: string;
      neighborhood?: string;
    };
  };
  items: Array<{ title: string; quantity: number; unitPrice: number }>;
  card?: CardInput;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const publicKey = Deno.env.get("LEGACY_PUBLIC_KEY");
    const secretKey = Deno.env.get("LEGACY_SECRET_KEY");

    if (!publicKey || !secretKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Credenciais da Legacy não configuradas. Adicione LEGACY_PUBLIC_KEY e LEGACY_SECRET_KEY nos secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as RequestBody;

    if (!body?.paymentMethod || !body?.amount || !body?.customer || !body?.items?.length) {
      return new Response(
        JSON.stringify({ success: false, error: "Campos obrigatórios faltando." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (body.paymentMethod === "CREDIT_CARD" && !body.card) {
      return new Response(
        JSON.stringify({ success: false, error: "Dados do cartão obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Resolve IP if not provided
    let payerIp = body.payerIp;
    if (!payerIp) {
      payerIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        "0.0.0.0";
    }

    const cleanDoc = body.customer.document.replace(/\D/g, "");
    const cleanPhone = body.customer.phone.replace(/\D/g, "");

    const payload: Record<string, unknown> = {
      paymentMethod: body.paymentMethod,
      amount: body.amount,
      referenceId: body.referenceId || `pedido-${Date.now()}`,
      isPhysicalProduct: body.isPhysicalProduct ?? true,
      payerIp,
      customer: {
        name: body.customer.name,
        email: body.customer.email,
        document: cleanDoc,
        phone: cleanPhone,
        address: {
          street: body.customer.address.street,
          number: body.customer.address.number,
          zipCode: body.customer.address.zipCode,
          city: body.customer.address.city,
          state: body.customer.address.state,
          ...(body.customer.address.complement ? { complement: body.customer.address.complement } : {}),
          ...(body.customer.address.neighborhood ? { neighborhood: body.customer.address.neighborhood } : {}),
        },
      },
      items: body.items,
    };

    if (body.paymentMethod === "CREDIT_CARD" && body.card) {
      payload.card = {
        holderName: body.card.holderName,
        number: body.card.number.replace(/\s/g, ""),
        expirationMonth: body.card.expirationMonth.padStart(2, "0"),
        expirationYear: body.card.expirationYear.length === 2 ? `20${body.card.expirationYear}` : body.card.expirationYear,
        cvv: body.card.cvv,
        installments: body.card.installments || 1,
      };
    }

    const credentials = btoa(`${publicKey}:${secretKey}`);

    console.log("Legacy payin request", body.paymentMethod, "amount:", body.amount);

    const response = await fetch(`${LEGACY_BASE}/payin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log("Legacy response", response.status, text.slice(0, 500));

    let data: Record<string, any>;
    try {
      data = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: `Resposta inválida da Legacy: ${text.slice(0, 200)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || data.code || `Legacy retornou ${response.status}`;
      return new Response(
        JSON.stringify({ success: false, error: errorMsg, details: data }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pixCode = data?.pix?.qrcode || null;

    return new Response(
      JSON.stringify({
        success: true,
        transaction_hash: data.id || data.externalId,
        status: data.status,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        pix_copy_paste: pixCode,
        pix_qr_code: pixCode,
        pix_qr_code_url: null,
        expires_at: data.expiresAt || null,
        threeDSecurePending: data.threeDSecurePending || false,
        raw: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("legacy-payin error", err);
    return new Response(
      JSON.stringify({ success: false, error: (err as Error).message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
