import { useState } from "react";
import Layout from "@/components/Layout";

const productImages = [
  "https://cdn.sistemawbuy.com.br/arquivos/d85030244e932a10635b1ae4c660c080/slide/image-1-c0bb69cd-3073-4f70-9425-be44e3eccadc-2400x-1-68685598a69501.webp",
];

const PlaudNotePin = () => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <Layout>
      <section className="max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1 bg-secondary rounded-2xl flex items-center justify-center p-8">
            <img
              src={productImages[selectedImage]}
              alt="Plaud NotePin"
              className="max-h-[400px] object-contain"
            />
          </div>

          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Plaud NotePin</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gravador de voz digital com IA e ChatGPT. 64GB de armazenamento, design vestível e discreto.
            </p>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Por <span className="line-through">R$1.599,00</span> ou
              </p>
              <p className="text-3xl font-bold text-primary">R$1.439,10</p>
              <p className="text-sm text-muted-foreground">no PIX</p>
              <p className="text-xs text-muted-foreground mt-1">
                10x de R$159,90 sem juros
              </p>
            </div>

            <button className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity">
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PlaudNotePin;
