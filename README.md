# 🇨🇱 Presupuesto Pro Chile - Control de Gastos Inteligente

Aplicación web moderna y ultra interactiva para el control de gastos personales y presupuestos automatizados por categorías en **Chile (Pesos Chilenos - CLP)**.

---

## 🚀 Características Principales

- **🇨🇱 Adaptada a Chile (CLP)**:
  - Formato chileno en pesos sin decimales (`$15.990`, `$45.000`, `$450.000`).
  - Medios de pago chilenos: Redcompra (Débito), CuentaRUT / Transferencia, Efectivo, Tarjeta de Crédito, Mach / Tenpo.
  - Reglas y sugerencias con comercios chilenos: Líder, Jumbo, Santa Isabel, Unimarc, PedidosYa, Uber Eats, Copec, Shell, Bip! / Metro, Enel, Aguas Andinas, Cruz Verde, Falabella, Mercado Libre, etc.

- **⚡ Registrador Rápido e Interactivo en 2 toques**:
  - Botonera táctil con tarjetas visuales de categorías.
  - Teclado numérico grande con incrementos rápidos (`+$2.000`, `+$5.000`, `+$10.000`, `+$20.000`, `+$50.000`).
  - Entrada alternativa por lenguaje natural (ej. *"Líder 35000"* o *"Carga Bip 5000"*).

- **💥 Alertas Visuales con Efecto WOW (80% y 100%)**:
  - Notificaciones flotantes animadas con `motion/react` (Framer Motion) y halo de iluminación neón.
  - Medidor de progreso animado en tiempo real que se expande visualmente al registrar un gasto que supera los límites.
  - Efectos de sonido sintetizados nativos con Web Audio API (campana armónica para 80% y alerta crítica para 100%).
  - Tarjetas de categoría con bordes vivos y distintivos flotantes pulsantes.

- **🤖 Motor de Reglas de Categorización Automática**:
  - 10 reglas preconfiguradas que clasifican automáticamente compras según palabras clave y comercios.
  - Simulador de reglas en tiempo real.
  - Botón para aplicar reglas de forma retroactiva a todo el historial.

- **📊 Analítica y Diagnóstico Financiero**:
  - Gráfico de dona SVG interactivo de distribución de gastos.
  - Comparativa de consumo vs límite presupuestado.
  - Ranking de comercios principales y diagnóstico según la regla 50/30/20.

- **💾 Privacidad y Respaldo Total**:
  - Datos 100% privados guardados localmente en el navegador (`localStorage`).
  - Exportación e importación de copias de seguridad en JSON y descarga en CSV para Excel.

---

## 🛠️ Tecnologías

- **React 19**
- **Vite 8**
- **TypeScript**
- **Tailwind CSS v4**
- **Motion (Framer Motion v12)**
- **Lucide React** (Iconos)

---

## 💻 Ejecución en Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TU_USUARIO/presupuesto-pro-chile.git
   cd presupuesto-pro-chile
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 📦 Cómo Subir el Proyecto a GitHub

Si aún no tienes el repositorio en GitHub, sigue estos sencillos pasos:

1. **Crea un nuevo repositorio en GitHub**:
   - Ve a [github.com/new](https://github.com/new).
   - Nómbralo por ejemplo: `presupuesto-pro-chile`.
   - Deja el repositorio **Público** o **Privado** (sin inicializar con README ni .gitignore, ya están creados aquí).

2. **En tu terminal, ejecuta los siguientes comandos**:
   ```bash
   git init
   git add .
   git commit -m "feat: Presupuesto Pro Chile - versión inicial completa"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/presupuesto-pro-chile.git
   git push -u origin main
   ```

*(Reemplaza `TU_USUARIO` por tu nombre de usuario en GitHub).*

---

## ☁️ Cómo Desplegar en Vercel (Gratis en 2 minutos)

El proyecto ya incluye el archivo `vercel.json` con la configuración de rewrites para Single Page Applications (SPA), por lo que está 100% listo para desplegar:

### Opción 1: Desde la Web de Vercel (Recomendada)
1. Inicia sesión en [vercel.com](https://vercel.com/) con tu cuenta de GitHub.
2. Haz clic en el botón **"Add New..."** → **"Project"**.
3. Selecciona tu repositorio recién subido (`presupuesto-pro-chile`) y haz clic en **"Import"**.
4. Vercel detectará automáticamente:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Haz clic en **"Deploy"**.
6. ¡Listo! En menos de 1 minuto tendrás tu enlace público de producción (ej. `https://presupuesto-pro-chile.vercel.app`).

### Opción 2: Usando Vercel CLI (Línea de comandos)
```bash
npm i -g vercel
vercel
```
Sigue las instrucciones en pantalla aceptando los valores por defecto.

---

## 📄 Licencia

Este proyecto es de código abierto bajo la licencia MIT.
