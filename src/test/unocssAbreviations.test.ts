import { getCssAbreviationFromLine } from '../abbreviations/unocssAbreviations'

test('basic', async () => {
    expect(await getCssAbreviationFromLine('mx-50')).toMatchInlineSnapshot(`
      "margin-left: 50px;
      margin-right: 50px;"
    `)
    expect(await getCssAbreviationFromLine('h-600')).toMatchInlineSnapshot('"height: 600px;"')
    expect(await getCssAbreviationFromLine('w-full')).toMatchInlineSnapshot('"width: 100%;"')
    expect(await getCssAbreviationFromLine('op-50')).toMatchInlineSnapshot('"opacity: 0.5;"')
    expect(await getCssAbreviationFromLine('b-1')).toMatchInlineSnapshot('"border-width: 1px;"')
})
test('that retuns undefined in prop', async () => {
    expect(await getCssAbreviationFromLine('bg-transparent')).toMatchInlineSnapshot('"background-color: transparent;"')
    expect(await getCssAbreviationFromLine('bg-transparen')).toMatchInlineSnapshot('undefined')
})
test('variables gets inlined', async () => {
    expect(await getCssAbreviationFromLine('c-black')).toMatchInlineSnapshot('"color: rgba(0,0,0,1);"')
    expect(await getCssAbreviationFromLine('bg-black')).toMatchInlineSnapshot('"background-color: rgba(0,0,0,1);"')
})
test.skip('colors', async () => {
    expect(await getCssAbreviationFromLine('c-black')).toMatchInlineSnapshot()
})
