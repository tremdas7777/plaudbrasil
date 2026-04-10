import { Brain, Zap, BarChart3, Mic, Users, Shield } from "lucide-react";

const features = [
  {
    title: "Transcrição Multilíngue",
    description: "Transcreve áudio para texto em mais de 100 idiomas, eliminando barreiras linguísticas e facilitando a documentação em ambientes globais.",
    icon: Brain,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663527880093/FP3WmM5Us5RivxhvJSsBGy/feature-transcription-NhVRZy82CNCcXCu9mMqf3v.webp",
  },
  {
    title: "Resumos Inteligentes",
    description: "Imagine ter uma reunião de horas e receber um resumo conciso dos pontos-chave, decisões e itens de ação em poucos segundos.",
    icon: Zap,
  },
  {
    title: "Cancelamento de Ruído Profissional",
    description: "Tecnologias avançadas de isolamento de ruído garantem que apenas a voz seja capturada, mesmo em ambientes barulhentos.",
    icon: BarChart3,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663527880093/FP3WmM5Us5RivxhvJSsBGy/feature-noise-cancellation-8PebKXDeLKvo9Mk9KE57aY.webp",
  },
  {
    title: "Gravação de Chamadas",
    description: "Tecnologia de condução óssea permite gravar chamadas telefônicas diretamente do smartphone, sem cabos ou configurações complexas.",
    icon: Mic,
  },
  {
    title: "Diarização de Voz",
    description: "A IA identifica e separa diferentes oradores em uma conversa, atribuindo falas a indivíduos específicos de forma precisa.",
    icon: Users,
  },
  {
    title: "Design Ultra-Compacto",
    description: "Incrivelmente finos e portáteis, podem ser acoplados à parte traseira de um celular ou guardados discretamente em uma carteira.",
    icon: Shield,
  },
];

const curiosities = [
  "Podem reduzir o tempo de redação de atas de reunião em até 90%",
  "Alguns modelos são tão finos que cabem atrás do celular ou na carteira",
  "A tecnologia de condução óssea permite gravar chamadas sem cabos, apenas encostando o dispositivo no telefone",
  "São usados por jornalistas, médicos, advogados e estudantes para aumentar a produtividade",
  "A IA consegue distinguir diferentes vozes em uma conversa com alta precisão",
  "Oferecem suporte a mais de 100 idiomas diferentes",
];

const benefits = [
  { label: "Aumento de Produtividade", text: "Libera tempo valioso ao automatizar a transcrição e resumo de conteúdo" },
  { label: "Precisão Aprimorada", text: "Reduz erros de documentação através da IA avançada" },
  { label: "Flexibilidade", text: "Funciona em qualquer ambiente, mesmo com ruído de fundo" },
  { label: "Acessibilidade", text: "Facilita a documentação para pessoas com dificuldades de escrita" },
];

const SafePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Gravadores de Voz Inteligentes com IA
                </h1>
                <p className="text-xl text-muted-foreground">
                  Desvendando a tecnologia que transforma áudio em conhecimento
                </p>
              </div>
              <p className="text-foreground leading-relaxed text-lg">
                Dispositivos revolucionários que combinam hardware de gravação profissional com algoritmos avançados de IA para capturar, transcrever e resumir áudio com precisão incomparável.
              </p>
            </div>
            <div className="flex justify-center">
              <img
                alt="Gravador de voz inteligente com IA"
                className="w-full max-w-md h-auto rounded-lg shadow-lg"
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663527880093/FP3WmM5Us5RivxhvJSsBGy/hero-audio-tech-AMQPeaArwS3fVBCkUANxAH.webp"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* O Que São */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">O Que São?</h2>
          <p className="text-foreground leading-relaxed">
            Os gravadores de voz inteligentes, impulsionados pela Inteligência Artificial, são dispositivos compactos que vão muito além da simples gravação de áudio. Eles combinam hardware de gravação de alta qualidade com algoritmos avançados de IA para oferecer uma experiência de captura de áudio sem precedentes.
          </p>
          <p className="text-foreground leading-relaxed">
            Muitas vezes com um design discreto e elegante, estes assistentes pessoais transformam a maneira como interagimos com o som e a palavra falada, processando o áudio em tempo real para extrair o máximo de valor.
          </p>
        </section>

        {/* Características Principais */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Características Principais</h2>
            <p className="text-muted-foreground text-lg">Descubra as funcionalidades que transformam áudio em valor</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {feature.image && (
                  <img alt={feature.title} className="w-full h-40 object-cover" src={feature.image} />
                )}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <feature.icon className="w-6 h-6 text-primary flex-shrink-0" />
                    <h3 className="font-bold text-lg text-foreground">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Curiosidades */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Curiosidades Fascinantes</h2>
            <p className="text-muted-foreground text-lg">Fatos impressionantes sobre essa tecnologia revolucionária</p>
          </div>
          <div className="space-y-4">
            {curiosities.map((text, i) => (
              <div key={i} className="flex gap-4 bg-secondary/30 border border-border rounded-lg p-4">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {i + 1}
                </div>
                <p className="text-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefícios */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Benefícios para Profissionais</h2>
            <p className="text-muted-foreground text-lg">Como essa tecnologia impacta diferentes áreas de trabalho</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8 space-y-4">
            <p className="text-foreground leading-relaxed">
              Os gravadores de voz inteligentes com IA representam um salto significativo na tecnologia de áudio. Eles não são apenas ferramentas para registrar sons, mas sim assistentes poderosos que transformam o áudio em conhecimento acionável.
            </p>
            <ul className="space-y-3 text-foreground">
              {benefits.map((b) => (
                <li key={b.label} className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>{b.label}:</strong> {b.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Futuro */}
        <section className="space-y-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-foreground">O Futuro da Captura de Áudio</h2>
          <p className="text-foreground leading-relaxed text-lg">
            À medida que a IA continua a evoluir, podemos esperar ainda mais inovações que tornarão a comunicação e a documentação ainda mais eficientes e intuitivas. Os gravadores de voz inteligentes estão redefinindo como capturamos, processamos e compartilhamos informações faladas.
          </p>
        </section>
      </main>
    </div>
  );
};

export default SafePage;
