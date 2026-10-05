---
name: clean-ui-design-rules
description: >-
  Directrices estrictas de diseño visual para interfaces web: prohíbe fondos y bordes coloridos ("slop"), prohíbe terminantemente el uso de emojis y exige una estética monocromática minimalista, sobria y profesional.
---

# Reglas Estrictas de Diseño UI y Prohibición de Emojis

Este documento establece las directrices obligatorias de diseño visual, interfaz y experiencia de usuario (UI/UX) para este proyecto.

## 1. Prohibición Absoluta de Emojis

- **Cero emojis**: Está estrictamente prohibido utilizar emojis en la interfaz gráfica, botones, títulos, tarjetas, insignias (badges), notificaciones, tooltips, modales, código fuente o documentación técnica.
- **Alternativa requerida**: Emplear únicamente iconos vectoriales limpios (como `lucide-react`) utilizados con moderación o texto tipográfico claro y conciso.

## 2. Prohibición de Fondos y Bordes Coloridos ("Visual Slop")

- **No a fondos saturados o translúcidos con tinte de color**: Prohibido usar `bg-amber-500/10`, `bg-sky-950`, `bg-indigo-950`, `bg-emerald-500/10`, `bg-rose-500/10`, etc.
- **No a bordes coloridos**: Prohibido usar `border-sky-500`, `border-amber-500/30`, `border-emerald-500`, `border-rose-500`, etc.
- **No a efectos brillantes o sombras coloreadas**: Prohibido `shadow-[0_0_..._rgba(color)]`, halos de neón o brillos saturados.
- **No a puntos pulsantes multicolores**: Prohibido `animate-pulse` con colores verde/rojo/azul en estados e indicadores.

## 3. Paleta Permitida: Monocromática, Sobria y Minimalista

- **Fondos (Dark Mode)**:
  - Fondo general: `#000000` (`bg-black`)
  - Paneles y tarjetas: `#0a0a0a` (`bg-neutral-950`), `#171717` (`bg-neutral-900`)
- **Bordes y Divisores**:
  - Bordes sutiles en escala de grises: `border-neutral-800`, `border-neutral-700`
- **Tipografía y Textos**:
  - Primario: `text-white`
  - Secundario: `text-neutral-300`, `text-neutral-400`
  - Terciario / Metadatos: `text-neutral-500`, `text-neutral-600`
- **Insignias y Etiquetas (Badges & Pills)**:
  - Fondo: `bg-neutral-900`
  - Borde: `border border-neutral-800`
  - Texto: `text-neutral-300` o `text-neutral-400`
  - Fuente: Monoespaciada (`font-mono`) en tamaño reducido (`text-[10px]` o `text-[11px]`)
- **Botones**:
  - Botón principal: Fondo blanco (`bg-white hover:bg-neutral-200 text-black`) con bordes limpios.
  - Botón secundario: `bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800`.
  - Botón destructivo / eliminación: `bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700` (evitar fondos rojos saturados).

## 4. Filosofía de Diseño

- La interfaz debe transmitir elegancia, sobriedad, alto rendimiento y calidad de software empresarial de misión crítica.
- La jerarquía visual se logra mediante pesos tipográficos, tamaños de fuente y niveles de escala de grises, no mediante colores saturados.
