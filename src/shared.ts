import * as vscode from 'vscode'

export interface SimpleVirtualDocument {
    fullText: string
    lineText: string
    position: vscode.Position
    offset: number
    startLine: number
}
