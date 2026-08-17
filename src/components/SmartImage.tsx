import { useEffect, useState } from "react";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
  wrapperClassName?: string;
}

/**
 * Imagem com skeleton e fade-in para evitar "saltos" de layout
 * e melhorar a percepção de velocidade no carregamento.
 */
const SmartImage = ({
  src,
  alt,
  priority = false,
  className = "",
  wrapperClassName = "",
  ...rest
}: SmartImageProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={`relative ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse rounded-[inherit] bg-muted" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        // @ts-expect-error fetchpriority é válido em HTML mas ainda não tipado
        fetchpriority={priority ? "high" : "low"}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        {...rest}
      />
    </div>
  );
};

export default SmartImage;
