import { rules } from '@unocss/preset-wind'
import fs from 'fs'

fs.writeFileSync(
    './rules.css',
    rules
        .filter(rule => typeof rule[0] === 'string' && typeof rule[1] === 'object')
        .map(rule => `.${rule[0]} ${JSON.stringify(rule[1], undefined, 4)}`)
        .join('\n'),
)
