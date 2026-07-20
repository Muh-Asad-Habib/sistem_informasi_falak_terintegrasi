export class HisabError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'HisabError';
    }
}
//# sourceMappingURL=errors.js.map