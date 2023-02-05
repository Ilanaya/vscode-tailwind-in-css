/* eslint-disable @typescript-eslint/naming-convention */
import { rules, theme } from '@unocss/preset-wind'
import { RuleContext, createGenerator, DynamicMatcher } from '@unocss/core'
import { compact } from '@zardoy/utils'

const generator = createGenerator()

const context: RuleContext = {
    constructCSS(body, overrideSelector?) {
        return ''
    },
    currentSelector: '',
    generator,
    rawSelector: '',
    theme,
    variantHandlers: [],
    variantMatch: {} as any,
}

interface OptionalConfig {}

export const getCssAbreviationFromLine = async (lineText: string, config: OptionalConfig = {}): Promise<string | void> => {
    // eslint-disable-next-line curly
    for (const rule of rules) {
        if (rule[0] instanceof RegExp) {
            // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
            const match = lineText.match(rule[0])
            if (!match) continue
            // eslint-disable-next-line no-await-in-loop
            const result = await (rule[1] as unknown as DynamicMatcher)(match, context)
            if (!result) continue
            const valueInPx = /-(\d+)$/.exec(lineText)?.[1]

            const getInsertCss = (val: NonNullable<typeof result>) => {
                if (typeof val === 'string') return val
                const normalizeCssValue = (cssValue: any /* CSSValue */): string | undefined => {
                    if (typeof cssValue === 'string') return cssValue
                    if (!Array.isArray(cssValue)) cssValue = Object.entries(cssValue) as any
                    const vars: Record<string, boolean> = {}
                    return cssValue
                        .map(([prop, value]) => {
                            if (value === undefined) return undefined
                            if (prop.startsWith('--')) {
                                vars[prop] = value
                                return undefined
                            }

                            value = value.replace(/var\((--[\w\d-]+)\)/g, (_, v) => vars[v] ?? `var(${v})`)
                            const remRE = /^-?[.\d]+rem$/
                            if (valueInPx && remRE.test(value)) value = `${valueInPx}px`
                            return `${prop}: ${value};`
                        })
                        .filter(Boolean)
                        .join('\n')
                }

                const cssRules =
                    !Array.isArray(val) || typeof val[0] === 'string' || typeof val[0]?.[0] === 'string'
                        ? [normalizeCssValue(val as any)]
                        : (val as any[]).map(normalizeCssValue)
                return compact(cssRules).join('\n')
            }

            const insertCss = getInsertCss(result)
            if (!insertCss) return undefined
            return insertCss
        }
    }

    return undefined
}

// console.log(await getCssAbreviationFromLine(''))
