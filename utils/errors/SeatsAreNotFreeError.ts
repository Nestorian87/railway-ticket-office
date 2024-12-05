export class SeatsAreNotFreeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SeatsAreNotFreeError";
    }
}