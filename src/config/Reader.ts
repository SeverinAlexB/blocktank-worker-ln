import * as fs from 'fs'
import { IConfig } from './IConfig'

export class ConfigReader {
    public static read(path: string = 'config.json'): IConfig {
        const content = fs.readFileSync(path)
        return JSON.parse(content.toString())
    }
}