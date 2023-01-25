import { parseCss } from '../parseCss'

import type {} from 'vitest/globals'

test('works', () => {
    const str = `
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
    const str = `
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
    const str = `
.test {
    display: flex;
    flex|
}`
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)
    expect(parseCss(strToParse, pos)).not.toThrowErrorMatchingInlineSnapshot(`"expected is not a function"`)
})
test('handles template syntax (FirstTemplateToken sytax kind)', () => {
    const str = `
const Button = styled.button\`
  display: flex;
  flex|    
\``
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)

    const { usedRules } = parseCss(strToParse, pos)

    expect(usedRules).toMatchInlineSnapshot(`
      Map {
        "display" => {
          "offset": 3,
          "value": "flex",
        },
      }
    `)
})
test('works in TemplateHead node kind case', () => {
    const str = `
const Button = styled.button\`
  display: flex;
  flex|
  \${props =>
    props.primary
  };
\``

    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)

    const { usedRules } = parseCss(strToParse, pos)

    expect(usedRules).toMatchInlineSnapshot(`
      Map {
        "display" => {
          "offset": 3,
          "value": "flex",
        },
      }
    `)
})
test('works in TemplateMiddle node kind case', () => {
    const str = `
const Button2 = styled.button\`
  display: flex;
  \${props =>
      props.primary}
    flex|
  \${props =>
      props.primary &&
    css\`
      padding-right: 1px;
    \`}
\``

    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)

    const { usedRules } = parseCss(strToParse, pos)

    expect(usedRules).toMatchInlineSnapshot(`
      Map {
        "display" => {
          "offset": 3,
          "value": "flex",
        },
      }
    `)
})
test('works in LastTemplateToken node kind case', () => {
    const str = `
const Button5 = styled.button\`
  display: flex;
  \${props =>
      props.primary
    }
  \${props =>
      props.primary &&
      css\`
      padding-left: 1px;
    \`}
    flex|
\``
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)

    const { usedRules } = parseCss(strToParse, pos)

    expect(usedRules).toMatchInlineSnapshot(`
      Map {
        "display" => {
          "offset": 3,
          "value": "flex",
        },
      }
    `)
})
test('fails on big style blocks with PostCSS syntax errors', () => {
    const str = `
const Button2 = styled.button\`
    display: flex;
    \${props =>
      props.primary}
    flex
    \${props =>
        props.primary
        && props.secondary
        && props.tertiary
        && css\`
        flex-direction: column;
        padding-right: 1px;
    \`}
    justify-content: space-around;
\``
    const pos = str.indexOf('|')
    const strToParse = str.slice(0, pos) + str.slice(pos + 1)

    const { usedRules } = parseCss(strToParse, pos)

    expect(usedRules).toMatchInlineSnapshot('Map {}')
})
