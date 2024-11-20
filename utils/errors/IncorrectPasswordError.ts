export class IncorrectPasswordError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IncorrectPasswordError";
    }
}