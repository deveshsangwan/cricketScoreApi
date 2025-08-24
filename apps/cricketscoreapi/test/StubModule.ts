import sinon, { SinonStub, SinonSandbox } from 'sinon';
import * as mongo from '../app/src/core/BaseModel';

class StubModule {
    private sandbox: SinonSandbox;
    private moduleMap: Record<string, any>;

    constructor() {
        this.sandbox = sinon.createSandbox();
        this.moduleMap = {
            mongo: mongo,
        };
    }

    stubModuleMethod(
        moduleType: keyof typeof this.moduleMap,
        methodName: string
    ): SinonStub | never {
        const module = this.moduleMap[moduleType];
        if (!module) {
            throw new Error(`Unsupported module type: ${moduleType}`);
        }
        return this.sandbox.stub(module, methodName);
    }

    restoreStubs() {
        this.sandbox.restore();
    }
}

export { StubModule };
