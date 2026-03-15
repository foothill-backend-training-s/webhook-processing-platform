import { Request, Response, NextFunction } from "express"
import { HTTPError } from "../errors/class_error.js";

export function errorHandlerMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (err instanceof HTTPError) {
        res.status(err.statusCode).json({ error: err.message });
    } else {
        console.error(err);
        res.status(500).json({ error: "Something went wrong on our end" });
    }
}