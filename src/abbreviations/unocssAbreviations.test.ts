import { getCssAbreviationFromLine } from './unocssAbreviations'

test('basic', async () => {
    expect(await getCssAbreviationFromLine('mx-50')).toMatchInlineSnapshot(`
      "margin-left: 50px;
      margin-right: 50px;"
    `)
    expect(await getCssAbreviationFromLine('h-600')).toMatchInlineSnapshot('"height: 600px;"')
    expect(await getCssAbreviationFromLine('w-full')).toMatchInlineSnapshot('"width: 100%;"')
    expect(await getCssAbreviationFromLine('op-50')).toMatchInlineSnapshot('"opacity: 0.5;"')
    expect(await getCssAbreviationFromLine('b-1')).toMatchInlineSnapshot(`
      "border-width: 1px;
      border-style: solid;"
    `)
})
test('that retuns undefined in prop', async () => {
    expect(await getCssAbreviationFromLine('bg-transparent')).toMatchInlineSnapshot('"background-color: transparent;"')
    expect(await getCssAbreviationFromLine('bg-transparen')).toMatchInlineSnapshot('undefined')
})
test.todo('basic colors', async () => {
    expect(await getCssAbreviationFromLine('c-black')).toMatchInlineSnapshot(`
      "--un-text-opacity: 1;
      color: rgba(0,0,0,var(--un-text-opacity));"
    `)
    expect(await getCssAbreviationFromLine('bg-black')).toMatchInlineSnapshot(`
      "--un-bg-opacity: 1;
      background-color: rgba(0,0,0,var(--un-bg-opacity));"
    `)
})
test.skip('colors', async () => {
    expect(await getCssAbreviationFromLine('c-black')).toMatchInlineSnapshot()
})
