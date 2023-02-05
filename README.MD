## Abbreviations

Some examples:

```css
.example {
    mx-5
    /* will suggest to insert */
    margin-top: 5px;
    margin-bottom: 5px;
    px-96
    padding-left: 96px;
    padding-right: 96px;
    z-5
    z-index: 5;
    op-50
    opacity: 0.5;
    w-full
    width: 100%;
    h-600
    height: 600px;
    min-h-screen
    min-height: 100vh;
}
```

And of course even more. You can use some advanced abbreviations, such as [ratio](https://tailwindcss.com/docs/aspect-ratio).
Default theme is from [wind preset](https://github.com/unocss/unocss/blob/main/packages/preset-wind/src/theme.ts) which is very close to default Tailwind CSS theme. This is important for colors (e.g. `color-red-900`)

### Why not Emmet Abbreviations?

Emmet abbreviations are cool for something like `w50`, `f12`. You can still use it, but it can't handle something more advanced like `mx-500`

### JS/TS support with [Typescript Essential Plugins](https://marketplace.visualstudio.com/items?itemName=zardoy.ts-essential-plugins) installed

Consider installing it if you're looking for writing styles in tailwind-like syntax when using css-in-js libs like [styled components](https://styled-components.com/)
