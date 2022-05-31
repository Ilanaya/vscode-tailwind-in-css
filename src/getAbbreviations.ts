import * as vscode from 'vscode'
import stringDedent from 'string-dedent'
import { rules } from '@unocss/preset-wind'

export const abbreviationShorthand = /(.+?)(\d+)/

const tailwindNumberAbbreviations: Record<string, (number: number) => string> = {
    px(number) {
        return stringDedent`
        padding-left: ${number}px;
        padding-right: ${number}px;
        `
    },
    py(number) {
        return stringDedent`
        padding-top: ${number}px;
        padding-bottom: ${number}px;
        `
    },
    mx(number) {
        return stringDedent`
        margin-left: ${number}px;
        margin-right: ${number}px;
        `
    },
    my(number) {
        return stringDedent`
        margin-top: ${number}px;
        margin-bottom: ${number}px;
        `
    },
}

export default (position: vscode.Position, document: vscode.TextDocument) => {
    const line = document.lineAt(position)
    const rule = [...rules].reverse().find(([regex, getProps]) => regex instanceof RegExp && line.text.trim().match(regex))
    if (!rule) return
    const match = line.text.trim().match(rule[0])!
    console.log('match', rule[0].toString(), match[0], match[1])
    return []
    // const foundAbbreviation = tailwindNumberAbbreviations[match[1]!]
    // if (!foundAbbreviation) return
    // let insertText = foundAbbreviation(+match[2]!)
    // insertText += '\n'
    // return [
    //     {
    //         label: match[0]!,
    //         insertText,
    //     },
    // ]
}
