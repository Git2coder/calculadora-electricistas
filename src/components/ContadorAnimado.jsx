import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

const ContadorAnimado = ({ valor }) => {
  const valorAnimado = useMotionValue(valor);
  const [valorMostrado, setValorMostrado] = useState(valor);

  useEffect(() => {
    const controls = animate(valorAnimado, valor, {
      duration: 1.2,
      ease: "easeInOut",
      onUpdate: (v) =>
        setValorMostrado(
          v.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        ),
    });
    return () => controls.stop();
  }, [valor]);

  return (
    <motion.div className="text-2xl font-bold text-green-700 bg-white p-4 rounded shadow text-center">
      Total: ${valorMostrado}
    </motion.div>
  );
};

export default ContadorAnimado;
