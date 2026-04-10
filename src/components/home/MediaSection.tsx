const mediaLogos = [
  {
    name: "The Verge",
    img: "https://www.plaud.ai/cdn/shop/files/verge.webp?height=156&v=1765790166",
    quote: "O Plaud Note Pro alterna automaticamente entre a gravação de chamadas e reuniões presenciais, eliminando a necessidade do botão físico presente no Plaud Note original.",
  },
  {
    name: "Forbes",
    img: "https://www.plaud.ai/cdn/shop/files/forbes_289f858d-89c0-4192-a7c6-0627aee4142c.webp?height=156&v=1765790169",
    quote: "O novo Plaud Note Pro consegue capturar áudio usando hardware de gravação de nível profissional e isolamento de ruído inteligente com tecnologia de inteligência artificial.",
  },
  {
    name: "TechCrunch",
    img: "https://www.plaud.ai/cdn/shop/files/tech.webp?height=156&v=1765790165",
    quote: "O Note Pro possui quatro microfones MEMS para melhor capturar áudio em um alcance de até 5 metros.",
  },
  {
    name: "Wired",
    img: "https://www.plaud.ai/cdn/shop/files/wired.webp?height=156&v=1765790166",
    quote: "Este dispositivo vestível com inteligência artificial para anotações irá transcrever suas reuniões — e, um dia, toda a sua vida.",
  },
  {
    name: "ZDNet",
    img: "https://www.plaud.ai/cdn/shop/files/zdnet.webp?height=156&v=1765790167",
    quote: "Este prático gravador de voz com IA mudou a minha forma de trabalhar.",
  },
  {
    name: "TechRadar",
    img: "https://www.plaud.ai/cdn/shop/files/trchradar.webp?height=156&v=1765790165",
    quote: "É como ter alguém anotando todos os aspectos da sua vida verbal.",
  },
];

const MediaSection = () => (
  <section className="py-16 md:py-24 bg-secondary px-6">
    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
      Destaque na mídia global
    </h2>
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mediaLogos.map((m) => (
        <div key={m.name} className="bg-background rounded-2xl p-6 space-y-4 shadow-sm">
          <img src={m.img} alt={m.name} className="h-8 object-contain" />
          <p className="text-sm text-muted-foreground leading-relaxed">"{m.quote}"</p>
        </div>
      ))}
    </div>
  </section>
);

export default MediaSection;
