import jwt from 'jsonwebtoken';

class JWTService {

    private static readonly EXPIRES_IN = '30d'
    private static isDotenvConfigured = false

    private static getJwtSecret(): string {
        if (!this.isDotenvConfigured) {
            require('dotenv').config()
            this.isDotenvConfigured = true
        }
        return process.env.JWT_SECRET!
    }

    static generateToken(userId: number): string {
        return jwt.sign(
            {userId: userId} as Token,
            this.getJwtSecret(),
            {expiresIn: this.EXPIRES_IN}
        );
    }

    static verifyToken(token: string): Token {
        return jwt.verify(token, this.getJwtSecret()) as Token;
    }

}

type Token = {
    userId: number
}


export default JWTService;
