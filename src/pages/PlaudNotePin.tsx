import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { trackEvent } from "@/lib/funnelTracking";

const colorVariants = {
  Cinza: [
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/gray_1-6865433e16327-687a7dd827363.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/gray1_900x-6865686151127-687a7d4442b16.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/gray4_900x-686568604497e.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/59d454e0daaac7b1df41eacf26360649_900x-68656862e0efa.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/45_900x-6865685fa3818.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/pin_8a1be513-1169-40d7-a740-353fc15044f1_900x-68656865e3e53.webp",
  ],
  Roxo: [
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/purple1_900x-686567f000729-687a7f1c591c1.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/purple2_900x-686567f19ed16-1-687a7ed7488d5.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/purple3_900x-686567fc62e07.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/1_71dc9608-3f00-483c-ac60-f6e822df5567_900x-686567f0cdf8a.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/45_231c7439-30a4-4467-b056-b7e776dba43d_900x-686567f3594e5.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/pin_2ad9d7d7-d8f2-45e8-a694-542ee5b4a92a_900x-686567f95b980.webp",
  ],
  Prata: [
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/silver1_900x-68656836f108f-687a7e6157059.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/silver2_900x-68656833f0758-687a7e620f22c.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/silver4_900x-6865684703494.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/6d35c92690c63d30d4f02059474e1cd4_900x-68656830cd646.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/45_61fd2b44-cde0-4995-8eee-d747271ae1ba_900x-686568318ecb8.webp",
    "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/produtos/685573935ce4f/pin_0349772b-d12a-4fe9-aa6b-a1d38ef73d1b_900x-686568325dba1.webp",
  ],
};

const colorOptions = [
  { name: "Cinza", cssColor: "bg-gray-400" },
  { name: "Roxo", cssColor: "bg-purple-600" },
  { name: "Prata", cssColor: "bg-gray-300" },
];

const PlaudNotePin = () => {
  useEffect(() => { window.scrollTo(0, 0); trackEvent('visitor'); trackEvent('product_view'); }, []);
  const [selectedColor, setSelectedColor] = useState<keyof typeof colorVariants>("Cinza");
  const [selectedImage, setSelectedImage] = useState(0);

  const currentImages = colorVariants[selectedColor];

  const handleColorChange = (color: keyof typeof colorVariants) => {
    setSelectedColor(color);
    setSelectedImage(0);
  };

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Gallery */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-secondary rounded-2xl flex items-center justify-center p-8">
              <img
                src={currentImages[selectedImage]}
                alt="Plaud NotePin"
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
                  <img src={img} alt={`Plaud NotePin ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Plaud NotePin</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O Plaud NotePin é um gravador de voz com IA vestível. Projetado para gravar, transcrever e resumir conversas, ideal para profissionais que precisam organizar informações de reuniões, entrevistas ou palestras.
            </p>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-primary">R$997,00</p>
              <p className="text-xs text-muted-foreground mt-1">
                10x de R$99,70 sem juros
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

            <a
              href="https://seguro.plaudnotepro.com/api/public/shopify?product=3238735192544&store=32387"
              onClick={() => { trackEvent('add_to_cart'); }}
              className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity block text-center"
            >
              Comprar agora
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PlaudNotePin;
