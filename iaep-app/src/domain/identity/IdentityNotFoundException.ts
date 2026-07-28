export class IdentityNotFoundException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IdentityNotFoundException";
    }
}
