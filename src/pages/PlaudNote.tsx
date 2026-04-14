import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { trackEvent } from "@/lib/funnelTracking";

const colorVariants = {
  Cinza: [
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978e5f1c77c5.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-3-6978e5c7388d4.jpg",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/3-6978f1b5c0c04.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/4-6978f1b5e15ee.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/8-6978f1b813d14.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/6-6978f1c2cf8ed.png",
  ],
  Azul: [
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978e60606240.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/navy-blue-plaud-note-dark-blue-case-phone-call-mode-male-executive-6978e5f959ff7.jpg",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/6-6978e622a0507.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/4-6978e61843c99.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/1-6978e61edcece.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/7-6978e61f12e0e.png",
  ],
  Preto: [
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978f02bd18e8.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/7-6978f12226bc5.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6978f1153f667.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/5-6978f115cf523.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/4-6978f11586e3d.png",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/6-6978f122cae2f.png",
  ],
};

const colorOptions = [
  { name: "Cinza", cssColor: "bg-gray-400" },
  { name: "Azul", cssColor: "bg-blue-800" },
  { name: "Preto", cssColor: "bg-gray-900" },
];

const specs = [
  { icon: "🔋", label: "Bateria de até 60 dias em standby" },
  { icon: "🎙️", label: "Gravação contínua por até 30 horas" },
  { icon: "⚖️", label: "Ultra leve com apenas 30g" },
  { icon: "📏", label: "Ultra fino com apenas 0,3cm" },
  { icon: "💾", label: "Armazenamento interno com 64GB" },
  { icon: "🧲", label: "Compatível com MagSafe" },
];

const features = [
  {
    title: "Plaud Intelligence",
    desc: "Transcrição por IA em 112 idiomas, com identificação de falantes e vocabulário personalizado.",
  },
  {
    title: "Segurança de dados",
    desc: "Compatível com SOC 2, HIPAA, GDPR e EN 18031.",
  },
  {
    title: "Input multimodal",
    desc: "Capture áudio, notas, imagens e destaques para fornecer um contexto mais rico.",
  },
  {
    title: "Resumos multidimensionais",
    desc: "Transforme uma única conversa em múltiplos resumos específicos para cada função.",
  },
  {
    title: "Ultrafino e potente",
    desc: "Com apenas 0,12\" de espessura e 1,06 oz, oferece 30 horas de gravação e 64 GB de armazenamento.",
  },
  {
    title: "Gravação em modo duplo",
    desc: "Alterne entre gravação de chamadas e gravação presencial.",
  },
  {
    title: "Plano Inicial Gratuito",
    desc: "300 minutos/mês de transcrição incluídos.",
  },
];

const useCases = [
  {
    title: "Chamadas",
    desc: "Grave chamadas sem esforço e não perca nenhum detalhe.",
    detail: "Chega de se esforçar para lembrar de uma informação crucial. O PLAUD NOTE grava e transcreve chamadas instantaneamente.",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/pc_-_calls_5abac52c-2beb-47dd-b11a-c0ff1c0a622f_1920x.png",
  },
  {
    title: "Reuniões",
    desc: "Pare de fazer anotações, comece a liderar a reunião.",
    detail: "Participe ativamente enquanto o PLAUD NOTE captura e organiza as principais decisões e insights.",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/pc_-_meetings_b5d9a22b-b155-4300-9137-4caec76cfceb_1920x.png",
  },
  {
    title: "Entrevistas",
    desc: "Mantenha o contato visual, esqueça as anotações.",
    detail: "Esteja totalmente presente enquanto o PLAUD NOTE entrega anotações profissionais com todos os pontos-chave.",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/pc_-_interviews_848babfb-b834-4c67-9c9c-529c8a282c21_1920x.png",
  },
  {
    title: "Aulas e palestras",
    desc: "Sua atenção no aprendizado, não no caderno.",
    detail: "O PLAUD NOTE cria anotações estruturadas e resumos visuais para facilitar seu entendimento.",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/pc_-_lectures_260ccfdb-7019-46d7-b7c6-e313a1727560_1920x.png",
  },
  {
    title: "Notas de voz",
    desc: "Fale suas ideias hoje, encontre-as para sempre.",
    detail: "Grave seus pensamentos e deixe que a IA transcreva, resuma e organize tudo.",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/pc_-_voice_memos_bc1db97a-aa09-43b5-8f34-e39bbccadb61_1200x.png",
  },
];

const PlaudNote = () => {
  useEffect(() => { window.scrollTo(0, 0); trackEvent('visitor'); trackEvent('product_view'); }, []);
  const [selectedColor, setSelectedColor] = useState<keyof typeof colorVariants>("Cinza");
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeUseCase, setActiveUseCase] = useState(0);
  const { addItem } = useCart();

  const currentImages = colorVariants[selectedColor];

  const handleColorChange = (color: keyof typeof colorVariants) => {
    setSelectedColor(color);
    setSelectedImage(0);
  };

  return (
    <Layout>
      {/* Product Hero */}
      <section className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Gallery */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-secondary rounded-2xl flex items-center justify-center p-8">
              <img
                src={currentImages[selectedImage]}
                alt="Plaud Note"
                className="max-h-[400px] object-contain"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {currentImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-colors ${
                    selectedImage === i ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt={`Plaud Note ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Plaud Note</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transcrição por IA em 112 idiomas, com identificação de falantes e vocabulário personalizado.
              Gere resumos com mais de 3.000 modelos, mapas mentais e integração com fluxos de trabalho.
            </p>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Por <span className="line-through">R$1.399,00</span> ou
              </p>
              <p className="text-3xl font-bold text-primary">R$1.259,10</p>
              <p className="text-sm text-muted-foreground">no PIX</p>
              <p className="text-xs text-muted-foreground mt-1">
                10x de R$139,90 sem juros
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">COR {selectedColor}</p>
              <div className="flex gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorChange(color.name as keyof typeof colorVariants)}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border-2 transition-colors ${color.cssColor} ${
                      selectedColor === color.name
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => { trackEvent('add_to_cart'); addItem({
                id: `plaud-note-${selectedColor}`,
                name: "Plaud Note",
                color: selectedColor,
                price: 1259.10,
                originalPrice: 1399.00,
                image: colorVariants[selectedColor][0],
              }); }}
              className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-secondary py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-background rounded-2xl p-6 space-y-2">
              <h3 className="font-bold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-5xl font-light">
            Grava. <span className="font-bold">Transcreve</span>. Resume.
          </h2>
          <p className="text-muted-foreground text-lg">
            O gravador profissional com IA que vai maximizar sua produtividade.
          </p>
        </div>
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {specs.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-2">
              <span className="text-3xl">{s.icon}</span>
              <p className="text-xs font-medium text-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recording Modes */}
      <section className="bg-secondary py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4">
            Dois modos de <span className="font-bold">gravação</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Capture cada detalhe sem esforço. O PLAUD NOTE integra os modos de gravação de chamadas e gravação presencial.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background rounded-2xl overflow-hidden">
              <img
                src="https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/pc_-_callmode_50ac8d54-52ec-459a-bb31-cc5e796b9b82.png"
                alt="Gravação de chamadas"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-foreground">Gravação de chamadas</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Encaixa ao celular através da capa magnética para gravar as ligações.
                </p>
              </div>
            </div>
            <div className="bg-background rounded-2xl overflow-hidden">
              <img
                src="https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/templates/plaud/assets/86_5f862078-5b83-4726-bc3a-9abeab4edad9.png"
                alt="Gravação presencial"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-foreground">Gravação presencial</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Captura o som ambiente, perfeito para gravar suas interações cara a cara.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-12">
            Um único assistente para <span className="font-bold">todas as situações</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col gap-2 md:w-48 shrink-0">
              {useCases.map((uc, i) => (
                <button
                  key={uc.title}
                  onClick={() => setActiveUseCase(i)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeUseCase === i
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {uc.title}
                </button>
              ))}
            </div>
            <div className="flex-1 bg-secondary rounded-2xl overflow-hidden">
              <img
                src={useCases[activeUseCase].img}
                alt={useCases[activeUseCase].title}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg text-foreground">{useCases[activeUseCase].desc}</h3>
                <p className="text-sm text-muted-foreground mt-2">{useCases[activeUseCase].detail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="bg-secondary py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light text-center mb-4">
            <span className="font-bold">Grátis</span> para começar, acessível para uso pesado
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "Grátis", minutes: "300 min.", templates: "Limitado" },
              { name: "Pro", price: "$6.60/mês", minutes: "1200 min.", templates: "Acesso total" },
              { name: "Unlimited", price: "$19.90/mês", minutes: "Ilimitado", templates: "Acesso total" },
            ].map((plan) => (
              <div key={plan.name} className="bg-background rounded-2xl p-6 text-center space-y-4 border border-border">
                <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                <p className="text-2xl font-bold text-primary">{plan.price}</p>
                {plan.price !== "Grátis" && (
                  <p className="text-xs text-muted-foreground">cobrado anualmente</p>
                )}
                <div className="border-t border-border pt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Transcrição: {plan.minutes}</p>
                  <p>Modelos: {plan.templates}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Pronto para maximizar sua produtividade?
          </h2>
          <Link
            to="/plaud-note"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Comprar agora
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default PlaudNote;
