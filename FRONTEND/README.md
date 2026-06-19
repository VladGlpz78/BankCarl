# 🏦 BankCarl - Sistema de Gestión de Préstamos

BankCarl es una aplicación web Full-Stack diseñada para la administración integral de préstamos personales, control de clientes, seguimiento de cuotas y gestión de morosidad. 

El sistema cuenta con una arquitectura **Multi-Usuario (Socios)**, permitiendo que múltiples prestamistas operen sobre la misma infraestructura de base de datos, pero manteniendo la privacidad y responsabilidad de sus propias carteras de clientes y préstamos de forma aislada.

## 🚀 Tecnologías Utilizadas

### Frontend (Desplegado en Vercel)
* **React + Vite:** Para una interfaz de usuario rápida y reactiva.
* **CSS Puro:** Diseño 100% responsivo, optimizado para uso en dispositivos móviles (Mobile-First Dashboard).
* **Lucide-React:** Sistema de iconografía minimalista.

### Backend (Desplegado en Render)
* **Node.js + Express:** Creación de API RESTful robusta.
* **JWT (JSON Web Tokens):** Autenticación de usuarios y protección de rutas privadas.
* **CORS:** Políticas estrictas de seguridad para la comunicación entre Front y Back.
* **Node-Cron:** Automatización de tareas programadas (Ej: revisión diaria de morosos).

### Base de Datos
* **Supabase (PostgreSQL):** Almacenamiento relacional en la nube. Tablas principales: `usuarios`, `clientes`, `prestamos`, `cuotas`, `pagos` y `documentos_cliente`.

---

## ✨ Características Principales

* **📊 Dashboard en Tiempo Real:** Visualización instantánea del capital prestado ("Plata en la calle"), cantidad de clientes activos y alertas de cuotas vencidas.
* **👥 Arquitectura Multi-Socio:** * Inicio de sesión independiente.
  * Trazabilidad total: Cada préstamo y cliente se vincula automáticamente al socio que lo registró (`creado_por`).
  * Seguridad de datos: Un socio no puede ver, editar ni eliminar los préstamos otorgados por otro socio.
* **📱 Alertas de Morosidad:** Módulo especial que detecta cuotas atrasadas, calcula los días de mora y permite contactar al cliente directamente por WhatsApp con un solo clic.
* **🧮 Simulador Público:** Enlace dinámico para que los clientes puedan simular y calcular sus propias cuotas según la tasa de interés y frecuencia de pago.
* **⚙️ CRUD Completo:** Gestión total de clientes, historial de pagos, eliminación en cascada y manejo de estados (Activo, Pendiente, Finalizado).

---

## 🛠️ Instalación y Configuración Local

Si deseás correr este proyecto en tu entorno local, seguí estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/TuUsuario/BankCarl.git](https://github.com/TuUsuario/BankCarl.git)

cd backend
npm install

PORT=3000
SUPABASE_URL=tu_url_de_supabase
SUPABASE_SERVICE_KEY=tu_service_key_secreta
JWT_SECRET=tu_firma_secreta_para_tokens

npm run dev

Frontend:

cd frontend
npm install

VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica

npm run dev