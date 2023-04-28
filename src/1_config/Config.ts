import * as fs from 'fs'
import { IConfig } from './IConfig'
import { defaultConfig } from './defaultConfig';

export class Config {
    private static _config: IConfig;
    static get(): IConfig {
        if (!this._config) {
            this._config = this.read()
        }
        return this._config
    }
    private static read(path: string = 'config.json'): IConfig {
        const content = fs.readFileSync(path)
        const parsed = JSON.parse(content.toString())
        return Object.assign({}, defaultConfig, parsed)
    }
}