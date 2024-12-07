import {UserRequest} from "../interfaces/UserRequest";
import express from "express";
import {UserService} from "../services/userService";
import {StationService} from "../services/stationService";
import {BenefitService} from "../services/benefitService";
import {validationResult} from "express-validator";
import {UserExistsError} from "../utils/errors/UserExistsError";
import JwtService from "../services/jwtService";
import {IncorrectPasswordError} from "../utils/errors/IncorrectPasswordError";
import {NotFoundError} from "../utils/errors/NotFoundError";
import {TicketService} from "../services/ticketService";
import helpers from "../utils/helpers";
import {PassengerService} from "../services/passengerService";

export async function renderIndex(req: UserRequest, res: express.Response) {
    res.render('index', {
        user: await UserService.getUser(req.userId!),
        stations: await StationService.getAllStations(),
        popularRoutes: await TicketService.getPopularRoutes()
    });
}

export async function renderProfile(req: UserRequest, res: express.Response) {
    res.render('profile', {
        user: await UserService.getUser(req.userId!),
        benefits: await BenefitService.getAllBenefits(),
        stations: await StationService.getAllStations(),
        statistics: await UserService.getUserStatistics(req.userId!),
        helpers
    });
}

export async function renderRegistration(_req: express.Request, res: express.Response) {
    res.render('registration', {errors: [], formData: null});
}

export async function register(req: express.Request, res: express.Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('registration', {errors: errors.array(), formData: req.body});
        return
    }

    const {email, password, first_name: firstName, last_name: lastName, phone_number: phoneNumber} = req.body;

    try {
        const user = await UserService.addUser(email, password, firstName, lastName, phoneNumber);
        const token = JwtService.generateToken(user.user_id)

        res.cookie("token", token, {httpOnly: true}).redirect('/profile');
    } catch (err) {
        if (err instanceof UserExistsError) {
            res.render('registration', {
                errors: [{msg: 'Користувач з такою електронною адресою вже існує'}],
                formData: req.body
            });
            return
        }
        console.error(err);
        res.status(500).send("Server error");
    }
}

export async function renderLogin(_req: express.Request, res: express.Response) {
    res.render('login', {errors: [], formData: null});
}

export async function login(req: express.Request, res: express.Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('login', {errors: errors.array(), formData: req.body});
        return
    }

    const {email, password} = req.body;

    try {
        const user = await UserService.login(email, password)
        const token = JwtService.generateToken(user.user_id)

        res
            .cookie("token", token, {httpOnly: true})
            .redirect('/');
    } catch (err) {
        if (err instanceof NotFoundError) {
            res.status(400).render("login", {errors: [{msg: "Акаунт не знайдено"}], formData: req.body});
            return
        }
        if (err instanceof IncorrectPasswordError) {
            res.status(400).render("login", {errors: [{msg: "Неправильний пароль"}], formData: req.body});
            return
        }

        console.error(err);
        res.status(500).send("Server error");
    }
}

export async function logout(_req: express.Request, res: express.Response) {
    res.clearCookie('token');
    res.redirect('/login');
}

export async function editProfile(req: UserRequest, res: express.Response){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }

    const {email, firstName, lastName, phoneNumber} = req.body;

    try {
        await UserService.updateUser(req.userId!, email, firstName, lastName, phoneNumber);
        res.status(200).json({msg: "Профіль успішно оновлено"});
    } catch (err) {
        if (err instanceof UserExistsError) {
            res.status(400).json({errors: [{msg: 'Користувач з такою електронною адресою вже існує'}]});
            return;
        }

        console.error(err);
        res.status(500).send("Server error");
    }
}

export async function deleteProfile(req: UserRequest, res: express.Response) {
    try {
        await UserService.deleteUser(req.userId!)
        res.clearCookie('token')
        res.status(200).json({message: "Акаунт успішно видалено"});
    } catch (err) {
        if (err instanceof NotFoundError) {
            res.status(404).json({message: "Користувач не знайдений"});
        }
        console.error(err);
        res.status(500).json({message: "Помилка сервера"});
    }
}