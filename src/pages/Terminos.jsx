// src/components/Terminos.jsx
import React from "react";

export default function Terminos() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Términos y Condiciones de Uso y Suscripción
      </h1>

      <p className="mb-4">
        Al confirmar tu suscripción y utilizar el servicio{" "}
        <strong>Electricista+</strong>, aceptás los siguientes términos legales.
        Te recomendamos leerlos detenidamente antes de continuar.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        1. Descripción del Servicio
      </h2>
      <p className="mb-4">
        Electricista+ brinda acceso a herramientas digitales orientadas al
        cálculo de presupuestos eléctricos y funciones de asistencia
        profesional. Estas funcionalidades son de carácter orientativo y pueden
        actualizarse, modificarse o reemplazarse sin previo aviso.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        2. Pagos y Vigencia
      </h2>
      <p className="mb-4">
        La suscripción tiene una duración mensual. La renovación no es
        automática; el usuario deberá suscribirse nuevamente al vencimiento para
        mantener el acceso.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        3. Política de Reembolsos
      </h2>
      <p className="mb-4">
        No se emitirán reembolsos salvo que exista un error técnico comprobado
        que impida el acceso al servicio. En tales casos, el reclamo deberá
        presentarse dentro de las 72 horas posteriores al pago, adjuntando
        comprobante y detalles del problema.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        4. Responsabilidad del Usuario
      </h2>
      <p className="mb-4">
        El servicio es personal e intransferible. Está prohibido compartir
        credenciales o permitir accesos no autorizados. El usuario es
        responsable de verificar técnicamente los presupuestos generados y de su
        correcta aplicación profesional. <br />
        Electricista+ es una herramienta de apoyo y no sustituye la
        responsabilidad legal, técnica ni ética del profesional frente a sus
        clientes.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        5. Limitación de Responsabilidad
      </h2>
      <p className="mb-4">
        El servicio se ofrece “tal como está”. El desarrollador no será
        responsable por daños, pérdidas o perjuicios derivados del uso o
        interpretación de la herramienta, ni por decisiones técnicas o
        comerciales tomadas en base a ella. Los resultados deben considerarse
        estimativos y no constituyen un presupuesto definitivo ni vinculante.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        6. Datos y Registro
      </h2>
      <p className="mb-4">
        El sistema registrará electrónicamente la aceptación de estos términos,
        asociándola al usuario correspondiente en Firebase, como resguardo
        legal. No se recolectan datos sensibles; únicamente los necesarios para
        validar la suscripción y el uso de la plataforma.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        7. Modificaciones y Disponibilidad
      </h2>
      <p className="mb-4">
        Nos reservamos el derecho de modificar o actualizar estos términos,
        publicando la nueva versión en la plataforma. El acceso puede ser
        suspendido temporal o permanentemente por razones técnicas, de seguridad
        o mejoras del sistema.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        8. Consentimiento Expreso
      </h2>
      <p className="mb-4">
        Al confirmar el pago, el usuario declara haber leído, comprendido y
        aceptado expresamente los presentes términos y condiciones.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-blue-700">
        9. Contacto
      </h2>
      <p className="mb-4">
        Ante cualquier consulta, escribinos a 📩{" "}
        <strong>contacto@electricistaplus.com</strong>
      </p>

      <div className="mt-10 text-sm text-gray-500 italic">
        Última actualización: 31 de agosto de 2025.
      </div>
    </div>
  );
}
