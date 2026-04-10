import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const slides = [
  {
    href: "/plaud-note",
    alt: "Plaud Note",
    desktop: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/slide/design-sem-nome-693066882af781.png",
  },
  {
    href: "/plaud-notepin",
    alt: "Plaud NotePin",
    desktop: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/slide/image-1-c0bb69cd-3073-4f70-9425-be44e3eccadc-2400x-1-68685598a69501.webp",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      <Link to={slides[current].href} className="block">
        <img
          src={slides[current].desktop}
          alt={slides[current].alt}
          className="w-full h-auto object-cover transition-opacity duration-700"
          style={{ minHeight: "300px" }}
        />
      </Link>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === i ? "bg-primary scale-110" : "bg-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 hover:bg-background/80 flex items-center justify-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-5 h-5 text-foreground">
          <path fill="currentColor" d="M37.9 46 24.1 32.3l13.8-13.7 2 2-11.8 11.7L39.9 44l-2 2" />
        </svg>
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/60 hover:bg-background/80 flex items-center justify-center transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-5 h-5 text-foreground">
          <path fill="currentColor" d="m26.1 18 2-2 13.8 13.7L28.1 43.4l-2-2 11.8-11.7L26.1 18" />
        </svg>
      </button>
    </section>
  );
};

export default HeroSection;
