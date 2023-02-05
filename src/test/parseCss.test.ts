import { parseCss } from '../parseCss'

import type {} from 'vitest/globals'

test('works', () => {
    const str = /*scss*/ `
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
test('works after calling suggestions after typing single line', () => {
    const str = /*scss*/ `
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
test('returns empty used rules with more then one css syntax error', () => {
    const str = /*scss*/ `
  .test {
      display: flex;
      flex|
      foo
  }`
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)
    const { usedRules } = parseCss(strToParse, pos)

    expect(usedRules).toStrictEqual(new Map())
})
