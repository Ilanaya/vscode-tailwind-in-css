import * as vscode from 'vscode'

export interface SimpleVirtualDocument {
    fullText: string
    lineText: string
    position: vscode.Position
    offset: number
    startLine: number
    getWordRangeAtPosition: (position: vscode.Position, regex?: RegExp | undefined) => vscode.Range | undefined
}
