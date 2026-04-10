const roles = [
  {
    title: "Executivos",
    desc: "Foque 100% nas conversas importantes",
    img: "https://www.plaud.ai/cdn/shop/files/Executives-pc.webp",
  },
  {
    title: "Vendedores",
    desc: "Gaste menos tempo fazendo anotações",
    img: "https://www.plaud.ai/cdn/shop/files/sales-pc.webp",
  },
  {
    title: "Profissionais de saúde",
    desc: "Nunca deixe uma grande ideia escapar",
    img: "https://www.plaud.ai/cdn/shop/files/Clinicians-pc.webp",
  },
  {
    title: "Advogados",
    desc: "Documente cada detalhe com precisão",
    img: "https://www.plaud.ai/cdn/shop/files/Lawyers-pc.webp",
  },
  {
    title: "Educadores",
    desc: "Capture conhecimento sem distrações",
    img: "https://www.plaud.ai/cdn/shop/files/Educators-pc.webp",
  },
  {
    title: "Criadores de conteúdo",
    desc: "Transforme ideias em conteúdo rápido",
    img: "http://www.plaud.ai/cdn/shop/files/Content_Creators-pc.webp",
  },
];

const ProductivitySection = () => (
  <section className="py-16 md:py-24 bg-secondary px-6">
    <div className="max-w-6xl mx-auto text-center space-y-4 mb-12">
      <h2 className="text-3xl md:text-4xl font-light">
        O assistente de anotações com IA nº 1 para{" "}
        <span className="font-bold">maximizar</span> sua produtividade
      </h2>
      <p className="text-muted-foreground text-sm">
        Economize até 260 horas por ano*
      </p>
    </div>
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roles.map((role) => (
        <div key={role.title} className="rounded-2xl overflow-hidden bg-background shadow-sm">
          <img src={role.img} alt={role.title} className="w-full h-48 object-cover" />
          <div className="p-5">
            <h3 className="font-semibold text-foreground">{role.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{role.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ProductivitySection;
