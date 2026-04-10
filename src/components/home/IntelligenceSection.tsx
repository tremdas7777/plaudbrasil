const features = [
  {
    title: "Input Multimodal",
    img: "https://www.plaud.ai/cdn/shop/files/Multimodal_input_fae984a3-4964-4bd0-bdd1-a8675b477ea7.webp",
  },
  {
    title: "Suporte para 112 idiomas",
    img: "https://www.plaud.ai/cdn/shop/files/MB_PC-Transcribe_in_112_languages.webp",
  },
  {
    title: "Modelos profissionais de resumo",
    img: "https://www.plaud.ai/cdn/shop/files/Multidimensional_summary.webp",
  },
  {
    title: "Ask Plaud",
    img: "https://www.plaud.ai/cdn/shop/files/Ask_Plaud_-_PC_e0b2a5ab-2282-4375-8291-334a63b6263a.webp",
  },
  {
    title: "Exporte. Compartilhe. Integre",
    img: "https://www.plaud.ai/cdn/shop/files/share.export.integrate.pc.webp",
  },
];

const IntelligenceSection = () => (
  <section className="py-16 md:py-24 bg-secondary px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center space-y-3 mb-12">
        <h2 className="text-3xl md:text-4xl font-semibold">
          PLAUD Intelligence<sup>TM</sup>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Transforme vozes e conversas em resumos, insights e ações com facilidade.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl overflow-hidden bg-background shadow-sm">
            <img src={f.img} alt={f.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default IntelligenceSection;
