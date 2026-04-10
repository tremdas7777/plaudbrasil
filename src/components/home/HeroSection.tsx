import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative bg-secondary overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 space-y-6 z-10">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
          Plaud Note
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md">
          Seu assistente profissional de anotações com IA para maximizar a produtividade
        </p>
        <Link
          to="/plaud-note"
          className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Comprar agora
        </Link>
      </div>
      <div className="flex-1">
        <img
          src="https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/slide/design-sem-nome-693066882af781.png"
          alt="Plaud Note"
          className="w-full max-w-lg mx-auto"
        />
      </div>
    </div>
  </section>
);

export default HeroSection;
