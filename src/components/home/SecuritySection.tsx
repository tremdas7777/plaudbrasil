const certs = [
  { name: "ISO 27001", img: "https://www.plaud.ai/cdn/shop/files/ISO_27001.webp?v=1763368308&width=250", desc: "Reconhecido mundialmente pela segurança da informação." },
  { name: "ISO 27701", img: "https://www.plaud.ai/cdn/shop/files/ISO_27701.webp?v=1763368309&width=250", desc: "Padrão global de gestão de privacidade." },
  { name: "GDPR", img: "https://www.plaud.ai/cdn/shop/files/plaud_get_GDPR.png?v=1756227327&width=250", desc: "Proteções rigorosas de privacidade europeias." },
  { name: "HIPAA", img: "https://www.plaud.ai/cdn/shop/files/plaud_get_HIPAA.png?v=1756227362&width=250", desc: "Salvaguardas em nível de saúde." },
  { name: "SOC 2", img: "https://www.plaud.ai/cdn/shop/files/plaud_get_SOC2.png?v=1756227339&width=250", desc: "Sistemas verificados de forma independente." },
  { name: "EN 18031", img: "https://www.plaud.ai/cdn/shop/files/plaud_get_EN18031-1.png?v=1756227362&width=250", desc: "Padrões europeus de cibersegurança." },
];

const SecuritySection = () => (
  <section className="py-16 md:py-24 px-6">
    <div className="max-w-6xl mx-auto text-center space-y-4 mb-12">
      <h2 className="text-3xl md:text-4xl font-bold">Segurança de nível empresarial</h2>
      <p className="text-muted-foreground">Construída com a privacidade no centro.</p>
    </div>
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {certs.map((c) => (
        <div key={c.name} className="flex flex-col items-center text-center gap-3 p-4">
          <img src={c.img} alt={c.name} className="h-16 object-contain" />
          <h3 className="font-bold text-sm text-foreground">{c.name}</h3>
          <p className="text-xs text-muted-foreground">{c.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default SecuritySection;
