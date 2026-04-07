import { 
  FaBolt, 
  FaHome, 
  FaNetworkWired, 
  FaProjectDiagram, 
  FaCogs, 
  FaTools 
} from "react-icons/fa";

export const categoriasConfig = {
  obra_electrica: {
    icono: FaBolt,
    color: "text-yellow-500",
    bg: "bg-yellow-100"
  },
  electricidad_domestica: {
    icono: FaHome,
    color: "text-blue-500",
    bg: "bg-blue-100"
  },
  tableros_protecciones: {
    icono: FaNetworkWired,
    color: "text-green-500",
    bg: "bg-green-100"
  },
  canalizaciones_cableado: {
    icono: FaProjectDiagram,
    color: "text-purple-500",
    bg: "bg-purple-100"
  },
  automatizacion_industrial: {
    icono: FaCogs,
    color: "text-orange-500",
    bg: "bg-orange-100"
  },
  servicios_tecnicos: {
    icono: FaTools,
    color: "text-gray-500",
    bg: "bg-gray-200"
  },
};