import { Undo2, Wrench, Headphones } from "lucide-react";

const Footer = () => (
  <footer>
    <div className="border-t border-border bg-secondary">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <Undo2 size={32} className="text-primary" />
          <p className="font-bold text-sm">30 dias para devolução</p>
          <p className="text-xs text-muted-foreground">Grátis, sem burocracia</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Wrench size={32} className="text-primary" />
          <p className="font-bold text-sm">1 ano de garantia</p>
          <p className="text-xs text-muted-foreground">Consulte as condições</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Headphones size={32} className="text-primary" />
          <p className="font-bold text-sm">Suporte vitalício</p>
          <p className="text-xs text-muted-foreground">Mais tranquilidade para você</p>
        </div>
      </div>
    </div>
    <div className="bg-foreground text-background py-8 px-6 text-center text-xs text-muted-foreground">
      <p>© {new Date().getFullYear()} Plaud Oficial Brasil. Todos os direitos reservados.</p>
    </div>
  </footer>
);

export default Footer;
