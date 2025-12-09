# Framer Motion (Motion)

Biblioteca de animação para React e JavaScript que oferece uma API declarativa e poderosa para criar animações suaves e interativas.

## Instalação

```bash
npm install motion
# ou
yarn add motion
# ou
pnpm add motion
```

## Importação

```javascript
import { animate, scroll } from "motion"
```

## Uso Básico com React

### Componente Motion Básico

```jsx
import { motion } from "motion/react"

function App() {
  return (
    <motion.button
      animate={{ scale: 1.1 }}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.95 }}
    >
      Clique em mim
    </motion.button>
  );
}
```

### Animações de Entrada

```jsx
<motion.button
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
/>
```

### Animações de Saída com AnimatePresence

```jsx
import { AnimatePresence, motion } from "motion/react"

<AnimatePresence>
  {show ? (
    <motion.div
      key="box"
      exit={{ opacity: 0 }}
    />
  ) : null}
</AnimatePresence>
```

## Animações com JavaScript

### Animar Elemento com Seletor CSS

```javascript
import { animate } from "motion"

animate(".box", { rotate: 360 })
```

### Animar com Opções Customizadas

```javascript
animate(
  element,
  { scale: [0.4, 1] },
  { ease: "circInOut", duration: 1.2 }
);
```

### Animações Spring

```javascript
animate(
  element,
  { rotate: 90 },
  { type: "spring", stiffness: 300 }
);
```

## Gestos

### Hover e Tap

```jsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  onHoverStart={() => console.log('hover started!')}
/>
```

### Drag

```jsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  onDragStart={(event, info) => console.log(info.delta.x)}
/>
```

## Animações de Scroll

### whileInView

```jsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
/>
```

### useScroll Hook

```jsx
import { useScroll } from "motion/react"

function Component() {
  const { scrollYProgress } = useScroll()

  return <motion.div style={{ scaleX: scrollYProgress }} />
}
```

## Sequências de Animação

### Sequência Simples

```javascript
const sequence = [
  ["nav", { opacity: 1 }],
  ["nav", { x: 100 }, { at: 0.5 }],
  ["li", { opacity: 1 }, { at: "<" }]
]

animate(sequence)
```

### Stagger

```javascript
import { animate, stagger } from "motion"

animate(
  "li",
  { y: 0, opacity: 1 },
  { delay: stagger(0.1) }
)
```

## Motion Values

### useMotionValue

```jsx
import { useMotionValue } from "motion/react"

const x = useMotionValue(0)

// Ler valor
x.get()

// Obter velocidade
x.getVelocity()
```

### useTransform

```jsx
import { useTransform } from "motion/react"

const y = useTransform(x, (value) => value * 2)
```

### useSpring

```jsx
import { useSpring } from "motion/react"

const dragX = useMotionValue(0)
const x = useSpring(dragX)
```

## Layout Animations

```jsx
<motion.div layout />
```

```jsx
<motion.div layoutId="underline" />
```

## Controles de Animação

```javascript
const animation = animate(element, { opacity: 1 })

// Pausar
animation.pause()

// Reproduzir
animation.play()

// Ajustar velocidade
animation.speed = 2

// Ajustar tempo
animation.time = 0.5
```

## Easing Functions

```javascript
animate(element, { x: 100 }, {
  ease: "easeInOut",
  duration: 1
})
```

Easing disponíveis: `linear`, `easeIn`, `easeOut`, `easeInOut`, `circIn`, `circOut`, `circInOut`, etc.

## Recursos Avançados

### Resize Observer

```javascript
import { resize } from "motion"

resize(({ width, height }) => {
  console.log(`Viewport: ${width}x${height}`);
});
```

### Press Gesture

```javascript
import { press } from "motion"

press("button", (element) => {
  animate(element, { scale: 0.9 })
  return () => animate(element, { scale: 1 })
})
```

### Hover Gesture

```javascript
import { hover } from "motion"

hover(".button", (element) => {
  console.log("hover started")
  return () => console.log("hover ended")
})
```

## Migração do GSAP

Motion oferece uma API declarativa alternativa ao GSAP:

```javascript
// GSAP
gsap.to("#box", { rotation: 360, duration: 1 })

// Motion
animate("#box", { rotate: 360 }, { duration: 1 })
```

## Performance

- Animações são otimizadas para 60fps
- Suporte a GPU acceleration
- Tree-shaking para reduzir bundle size
- Lazy loading de animações

## Documentação Oficial

- Website: https://motion.dev/
- GitHub: https://github.com/motiondivision/motion
- Documentação React: https://motion.dev/docs/react

