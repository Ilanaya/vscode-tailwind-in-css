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
        "display" => {
          "offset": 13,
          "value": "flex",
        },
      }
    `)
})
test('works with incorrect syntax', () => {
    const str = /* scss*/ `
.test {
    display: flex;
    flex|
}`
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)
    const { usedRules } = parseCss(strToParse, pos)
    expect(usedRules).toMatchInlineSnapshot(`
    Map {
        "display" => {
          "offset": 13,
          "value": "flex",
        },
      }
    `)
})
test('throws with incorrent syntax', () => {
    const str = /* scss*/ `
.test {
    display: flex;
    flex|
}`
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)
    expect(parseCss(strToParse, pos)).not.toThrowErrorMatchingInlineSnapshot(`"expected is not a function"`)
})
