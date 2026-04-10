import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Plaud Note", href: "/plaud-note" },
  { label: "Plaud NotePin", href: "/plaud-notepin" },
  { label: "Acessórios", href: "/acessorios" },
  { label: "Sobre nós", href: "/sobre" },
  { label: "Como usar", href: "/como-usar" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center">
          <img
            src="https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/config/plaud-logo-white-691779b2f0dad1.png"
            alt="Plaud"
            className="h-6 invert"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-foreground hover:text-muted-foreground transition-colors">
            <Search size={20} />
          </button>
          <button className="text-foreground hover:text-muted-foreground transition-colors">
            <User size={20} />
          </button>
          <button className="text-foreground hover:text-muted-foreground transition-colors">
            <ShoppingBag size={20} />
          </button>
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
