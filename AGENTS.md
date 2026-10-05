# Workspace Guidelines & Design Rules

## Directrices Obligatorias de Diseño UI

1. **PROHIBICIÓN TOTAL DE EMOJIS**:
   - Queda terminantemente prohibido utilizar emojis en interfaces de usuario, componentes, botones, modales, etiquetas, notificaciones, código fuente o documentación técnica.
   - Utilizar únicamente iconos vectoriales limpios (como Lucide React) o texto conciso.

2. **PROHIBICIÓN DE FONDOS Y BORDES COLORIDOS ("VISUAL SLOP")**:
   - Queda prohibido el uso de fondos saturados o translúcidos con tinte de color (`bg-amber-500/10`, `bg-sky-950`, `bg-emerald-500/10`, `bg-rose-500/10`, etc.).
   - Queda prohibido el uso de bordes de color (`border-sky-500`, `border-amber-500`, `border-emerald-500`, etc.).
   - Queda prohibido el uso de sombras brillantes de color (`shadow-[0_0_..._rgba(...)]`) o puntos pulsantes de colores llamativos.

3. **ESTÉTICA MONOCROMÁTICA EMPRESARIAL**:
   - Fondo general: `#000000` (`bg-black`).
   - Paneles y modales: `bg-neutral-950`, `bg-neutral-900`.
   - Bordes: `border-neutral-800`, `border-neutral-700`.
   - Textos: `text-white`, `text-neutral-300`, `text-neutral-400`, `text-neutral-500`.
   - Badges e insignias: `bg-neutral-900 border border-neutral-800 text-neutral-300` con fuente monoespaciada (`font-mono`).
