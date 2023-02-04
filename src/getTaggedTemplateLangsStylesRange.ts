import * as vscode from 'vscode'

export default async (document: vscode.TextDocument, position: vscode.Position) => {
    try {
        // Tokens explanation:
        // FirstTemplateToken (actually NoSubstitutionTemplateLiteral): css`text|`
        // TemplateHead: css`text|${...}`
        // TemplateMiddle: css`${...}text|${...}`
        // LastTemplateToken: (actually TemplateTail): css`${...}text|`
        const supportedSyntaxKinds = new Set(['FirstTemplateToken', 'TemplateHead', 'TemplateMiddle', 'LastTemplateToken'])

        type TsNode = {
            start: number
            end: number
            kindName: string
        }

        const nodes: TsNode[] = (await vscode.commands.executeCommand('tsEssentialPlugins.getNodePath', { offset: document.offsetAt(position) })) ?? []

        const lastNode = nodes[nodes.length - 1]
        if (!lastNode) return
        let { start, end, kindName } = lastNode
        if (!supportedSyntaxKinds.has(kindName)) return

        // include internal content of the template node
        start++
        end--
        // special handling, as ${ chars included into node range
        if (['TemplateHead', 'TemplateMiddle'].includes(kindName)) end--

        const templateNode = nodes.find(({ kindName }) => kindName === 'TemplateExpression' || kindName === 'FirstTemplateToken')
        if (!templateNode) return

        const templateExprStart = templateNode.start
        const templateStartPos = document.positionAt(templateExprStart)
        const isInTaggedTemplate = /(styled\.[\w\d]+|css)$/.test(document.getText(new vscode.Range(templateStartPos.with(undefined, 0), templateStartPos)))
        if (!isInTaggedTemplate) return

        return new vscode.Range(document.positionAt(start), document.positionAt(end))
    } catch {
        return undefined
    }
}
