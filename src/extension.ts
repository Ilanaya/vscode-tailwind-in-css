import * as vscode from 'vscode'
import stringDedent from 'string-dedent'

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
}

export const activate = () => {
    vscode.languages.registerCompletionItemProvider(['css', 'scss', 'less', 'vue'], {
        provideCompletionItems(document, position, token, context) {
            if (!position.character) return
            const line = document.lineAt(position)
            const match = /(.+)(\d+)/.exec(line.text.trim())
            if (!match) return
            const foundAbbreviation = tailwindNumberAbbreviations[match[1]!]
            if (!foundAbbreviation) return
            let insertText = foundAbbreviation(+match[2]!)
            insertText += '\n'
            return {
                items: [
                    {
                        label: match[0]!,
                        insertText,
                    },
                ],
            }
        },
    })
}
