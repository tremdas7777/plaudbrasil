import { Link } from "react-router-dom";

const products = [
  {
    name: "Plaud Note",
    pixPrice: "R$1.259,10",
    installment: "10x de R$139,90 sem juros",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978e5f1c77c5.png",
    href: "/plaud-note",
    available: true,
  },
  {
    name: "Plaud NotePin",
    pixPrice: "R$1.439,10",
    installment: "10x de R$159,90 sem juros",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/slide/image-1-c0bb69cd-3073-4f70-9425-be44e3eccadc-2400x-1-68685598a69501.webp",
    href: "/plaud-notepin",
    available: true,
  },
  {
    name: "Plaud Note Pro",
    pixPrice: "SOB CONSULTA",
    installment: "",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978e5f1c77c5.png",
    href: "/plaud-note-pro",
    available: false,
  },
  {
    name: "Plaud NotePin S",
    pixPrice: "SOB CONSULTA",
    installment: "",
    img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/slide/image-1-c0bb69cd-3073-4f70-9425-be44e3eccadc-2400x-1-68685598a69501.webp",
    href: "/plaud-notepin-s",
    available: false,
  },
];

const ProductsSection = () => (
  <section className="py-16 md:py-24 px-6">
    <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
      Conheça nossos produtos
    </h2>
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <Link
          key={product.name}
          to={product.href}
          className="group bg-background border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
        >
          <img
            src={product.img}
            alt={product.name}
            className="w-40 h-40 object-contain mb-4 group-hover:scale-105 transition-transform"
          />
          <h3 className="font-bold text-foreground">{product.name}</h3>
          <p className="text-primary font-bold text-lg mt-2">{product.pixPrice}</p>
          {product.installment && (
            <p className="text-xs text-muted-foreground mt-1">{product.installment}</p>
          )}
          {product.available && (
            <span className="mt-4 bg-primary text-primary-foreground text-xs font-semibold px-6 py-2 rounded-full">
              Comprar
            </span>
          )}
        </Link>
      ))}
    </div>
  </section>
);

export default ProductsSection;
