import { useCart } from "../context/CartContext";
import { FaTimes } from "react-icons/fa";

export default function CartDrawer() {
  const { cart, removeFromCart, total, open, setOpen } = useCart();

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-lg transform transition-transform z-50 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-lg font-bold">Carrito</h2>
        <FaTimes className="cursor-pointer" onClick={() => setOpen(false)} />
      </div>

      <div className="p-4 space-y-3 overflow-y-auto h-[70%]">
        {cart.length === 0 ? (
          <p className="text-gray-400">Vacío</p>
        ) : (
          cart.map((item, i) => (
            <div
              key={i}
              className="bg-gray-800 p-3 rounded flex justify-between items-center"
            >
              <div>
                <p className="text-sm">{item.nombre}</p>
                <p className="text-xs text-gray-400">${item.precio}</p>
              </div>
              <button
                onClick={() => removeFromCart(i)}
                className="text-red-400"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700">
        <p className="mb-2 font-bold">Total: ${total}</p>
        <button className="w-full bg-green-500 py-2 rounded text-black font-semibold">
          Finalizar compra
        </button>
      </div>
    </div>
  );
}