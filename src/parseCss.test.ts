import { parseCss } from './parseCss'

import type {} from 'vitest/globals'

test('works', () => {
    const str = /* scss*/ `
.test {
    display: flex;
    |
}`
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)
    const { usedRules } = parseCss(strToParse, pos)
    expect(usedRules).toMatchInlineSnapshot(`
      Map {
        "display" => "flex",
      }
    `)
})
