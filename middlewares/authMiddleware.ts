import {UserRequest} from "../interfaces/UserRequest";
import express, {NextFunction} from "express";
import JwtService from "../services/jwtService";

export const auth = (req: UserRequest, res: express.Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).redirect("/login");
    }

    const decodedToken = JwtService.verifyToken(token);
    if (!decodedToken) {
        return res.status(401).redirect("/login");
    }

    req.userId = decodedToken.userId;
    next();
};