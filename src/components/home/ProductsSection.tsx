import { useState } from "react";
import { Link } from "react-router-dom";

type ColorVariant = {
  name: string;
  cssColor: string;
  img: string;
};

type Product = {
  name: string;
  pixPrice: string;
  installment: string;
  href: string;
  available: boolean;
  colors: ColorVariant[];
};

const products: Product[] = [
  {
    name: "Plaud Note",
    pixPrice: "R$690,30",
    installment: "10x de R$69,03 sem juros",
    href: "/plaud-note",
    available: true,
    colors: [
      {
        name: "Cinza",
        cssColor: "bg-gray-400",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978e5f1c77c5.png",
      },
      {
        name: "Azul",
        cssColor: "bg-blue-800",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978e60606240.png",
      },
      {
        name: "Preto",
        cssColor: "bg-gray-900",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/692dac1110a94/2-6-6978f02bd18e8.png",
      },
    ],
  },
  {
    name: "Plaud NotePin",
    pixPrice: "R$1.439,10",
    installment: "10x de R$159,90 sem juros",
    href: "/plaud-notepin",
    available: true,
    colors: [
      {
        name: "Cinza",
        cssColor: "bg-gray-400",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/gray_1-6865433e16327-687a7dd827363.webp",
      },
      {
        name: "Roxo",
        cssColor: "bg-purple-600",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/purple1_900x-686567f000729-687a7f1c591c1.webp",
      },
      {
        name: "Prata",
        cssColor: "bg-gray-300",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/silver1_900x-68656836f108f-687a7e6157059.webp",
      },
    ],
  },
  {
    name: "Plaud Note Pro",
    pixPrice: "SOB CONSULTA",
    installment: "",
    href: "/plaud-note-pro",
    available: false,
    colors: [
      {
        name: "Preto",
        cssColor: "bg-gray-900",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/69ceb5d14dea9/plaud_note_pro-front-black_74a97c88-375f-4daa-9fc0-728d21b74fd9-69ceb6e7a2db2.webp",
      },
    ],
  },
  {
    name: "Plaud NotePin S",
    pixPrice: "SOB CONSULTA",
    installment: "",
    href: "/plaud-notepin-s",
    available: false,
    colors: [
      {
        name: "Preto",
        cssColor: "bg-gray-900",
        img: "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/69ceba7e9d194/plaunotepins-69cec0516998b.webp",
      },
    ],
  },
];

const ProductCard = ({ product }: { product: Product }) => {
  const [selectedColor, setSelectedColor] = useState(0);

  return (
    <div className="group bg-background border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
      <Link to={product.href}>
        <img
          src={product.colors[selectedColor].img}
          alt={product.name}
          className="w-40 h-40 object-contain mb-4 group-hover:scale-105 transition-transform"
        />
      </Link>
      <Link to={product.href}>
        <h3 className="font-bold text-foreground">{product.name}</h3>
      </Link>
      <p className="text-primary font-bold text-lg mt-2">{product.pixPrice}</p>
      {product.installment && (
        <p className="text-xs text-muted-foreground mt-1">{product.installment}</p>
      )}

      {product.colors.length > 1 && (
        <div className="flex gap-2 mt-3">
          {product.colors.map((color, i) => (
            <button
              key={color.name}
              onClick={() => setSelectedColor(i)}
              title={color.name}
              className={`w-6 h-6 rounded-full border-2 transition-colors ${color.cssColor} ${
                selectedColor === i ? "border-primary ring-2 ring-primary/30" : "border-border"
              }`}
            />
          ))}
        </div>
      )}

      {product.available && (
        <Link
          to={product.href}
          className="mt-4 bg-primary text-primary-foreground text-xs font-semibold px-6 py-2 rounded-full"
        >
          Comprar
        </Link>
      )}
    </div>
  );
};

const ProductsSection = () => (
  <section className="py-16 md:py-24 px-6">
    <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
      Conheça nossos produtos
    </h2>
    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product) => (
        <ProductCard key={product.name} product={product} />
      ))}
    </div>
  </section>
);

export default ProductsSection;
