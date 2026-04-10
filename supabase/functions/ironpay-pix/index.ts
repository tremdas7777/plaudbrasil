import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const IRONPAY_BASE = "https://api.ironpayapp.com.br/api/public/v1";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      api_token,
      amount,        // in centavos
      customer_name,
      customer_email,
      customer_cpf,
      customer_phone,
      items,         // optional array of { name, quantity, price }
    } = body;

    if (!api_token) {
      return new Response(
        JSON.stringify({ success: false, error: "api_token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: "amount must be > 0 (in centavos)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer_name || !customer_email || !customer_cpf) {
      return new Response(
        JSON.stringify({ success: false, error: "customer_name, customer_email, and customer_cpf are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the transaction payload for IronPay
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

    console.log("Creating IronPay transaction:", JSON.stringify(transactionPayload));

    // Try with Authorization header first (most common REST pattern)
    let response = await fetch(`${IRONPAY_BASE}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${api_token}`,
      },
      body: JSON.stringify(transactionPayload),
    });

    // If Bearer auth fails with 401, retry with api_token only in body (some gateways use this)
    if (response.status === 401) {
      console.log("Bearer auth failed, retrying with api_token in body only...");
      response = await fetch(`${IRONPAY_BASE}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionPayload),
      });
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("IronPay error:", JSON.stringify(data));
      return new Response(
        JSON.stringify({
          success: false,
          error: data.message || data.error || `IronPay returned ${response.status}`,
          details: data,
        }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("IronPay transaction created:", JSON.stringify(data));

    // Return the PIX data (QR code, copy-paste code, etc.)
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
      JSON.stringify({ success: false, error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
