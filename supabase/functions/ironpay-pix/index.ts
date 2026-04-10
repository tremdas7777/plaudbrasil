const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IRONPAY_BASE = "https://api.ironpayapp.com.br/api/public/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      api_token,
      amount,
      customer_name,
      customer_email,
      customer_cpf,
      customer_phone,
      items,
    } = body;

    if (!api_token) {
      return new Response(
        JSON.stringify({ success: false, error: "api_token é obrigatório. Configure no painel admin." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Valor inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer_name || !customer_email || !customer_cpf) {
      return new Response(
        JSON.stringify({ success: false, error: "Nome, email e CPF são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build payload per IronPay docs: api_token goes in the body
    const transactionPayload: Record<string, unknown> = {
      api_token,
      amount,
      payment_method: "pix",
      customer: {
        name: customer_name,
        email: customer_email,
        document: customer_cpf.replace(/\D/g, ""),
        phone: customer_phone?.replace(/\D/g, "") || "",
      },
    };

    if (items && items.length > 0) {
      transactionPayload.items = items.map((item: { name: string; quantity: number; price: number }) => ({
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));
    }

    console.log("IronPay request payload:", JSON.stringify(transactionPayload));

    // IronPay docs: api_token is sent as a body parameter
    const response = await fetch(`${IRONPAY_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(transactionPayload),
    });

    const responseText = await response.text();
    console.log("IronPay response status:", response.status);
    console.log("IronPay response body:", responseText);

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(responseText);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: `Resposta inválida da IronPay: ${responseText.slice(0, 200)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorMsg = (data.message as string) || (data.error as string) || `IronPay retornou status ${response.status}`;
      console.error("IronPay error:", errorMsg);
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMsg,
          details: data,
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("IronPay transaction created successfully");

    // Return the PIX data
    return new Response(
      JSON.stringify({
        success: true,
        transaction_hash: data.transaction_hash || data.hash || data.id,
        pix_qr_code: data.pix_qr_code || data.qr_code || data.qrcode,
        pix_qr_code_url: data.pix_qr_code_url || data.qr_code_url || data.qrcode_url,
        pix_copy_paste: data.pix_copy_paste || data.copy_paste || data.pix_code || data.emv,
        status: data.status,
        amount: data.amount,
        expires_at: data.expires_at || data.expiration,
        raw: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
