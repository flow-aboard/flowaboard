import { FunctionUnit } from './architecture.js'

class Database extends FunctionUnit{
    constructor(label, uniqueIdentifier, processIdentifiers) {
        super('Database', label, uniqueIdentifier)
        this.processIdentifiers = new Set(processIdentifiers)
    }
}
export {Database}