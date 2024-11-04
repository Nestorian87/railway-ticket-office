import express from "express";

export interface UserRequest extends express.Request {
    userId?: number;
}
