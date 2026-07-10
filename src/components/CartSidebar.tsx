import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const CartSidebar = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalOriginalPrice } = useCart();
  const navigate = useNavigate();

  const discount = totalOriginalPrice - totalPrice;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Seu carrinho
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <ShoppingBag className="w-16 h-16 opacity-30" />
            <p>Seu carrinho está vazio</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-border pb-4">
                  <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1 rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">Cor: {item.color}</p>
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground line-through mr-2">
                        {formatCurrency(item.originalPrice)}
                      </span>
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto PIX</span>
                  <span className="text-green-600 font-medium">- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">{formatCurrency(totalPrice)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                em até 10x sem juros
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/checkout");
                }}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Finalizar compra
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
