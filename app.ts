import express, {NextFunction} from 'express';
import {DataSource, Not} from "typeorm";
import {User} from "./entity/User";
import {Passenger} from "./entity/Passenger";
import {Benefit} from "./entity/Benefit";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "reflect-metadata"
import {check, validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import JWTService from "./utils/JWTService";
import {UserRequest} from "./interfaces/UserRequest";

require('dotenv').config()

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User, Passenger, Benefit],
    subscribers: [],
    migrations: [],
});

const app = express();


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

export const auth = (req: UserRequest, res: express.Response, next: NextFunction) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).redirect("/login");
    }

    const decodedToken = JWTService.verifyToken(token);
    if (!decodedToken) {
        return res.status(401).redirect("/login");
    }

    req.userId = decodedToken.userId;
    next();
};

app.get('/', auth, async (req: UserRequest, res: express.Response) => {
    res.render('index', {
        user: await User.findOne({where: {user_id: req.userId}})
    });
});

app.get('/profile', auth, async (req: UserRequest, res: express.Response) => {
    res.render('profile', {
        user: await User.findOne({where: {user_id: req.userId}, relations: ['passengers', 'passengers.benefit']}),
        benefits: await Benefit.find()
    });
});


app.get('/login', (req: express.Request, res: express.Response) => {
    res.render('login', {errors: [], formData: null});
})

app.get('/registration', (req: express.Request, res: express.Response) => {
    res.render('registration', {errors: [], formData: null});
})

app.post("/registration",
    [
        check("email", "Введіть правильну адресу електронної пошти").isEmail(),
        check("password", "Пароль не може бути пустим").not().isEmpty(),
        check("first_name", "Імʼя не може бути пустим").not().isEmpty(),
        check("last_name", "Прізвище не може бути пустим").not().isEmpty(),
        check("phone_number", "Введіть правильний номер телефону").isMobilePhone("uk-UA")
    ],
    async (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('registration', {errors: errors.array(), formData: req.body});
            return
        }

        const {email, password, first_name: firstName, last_name: lastName, phone_number: phoneNumber} = req.body;

        try {
            const existingUser = await User.findOne({where: {email}});
            if (existingUser) {
                res.render('registration', {
                    errors: [{msg: 'Користувач з такою електронною адресою вже існує'}],
                    formData: req.body
                });
                return
            }

            const user = new User();
            user.email = email;
            user.user_first_name = firstName;
            user.user_last_name = lastName;
            user.phone_number = phoneNumber;

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const token = JWTService.generateToken(user.user_id)

            res
                .cookie("token", token, {httpOnly: true})
                .redirect('/profile');

        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);

app.post("/login",
    [
        check("email", "Введіть правильну адресу електронної пошти").isEmail(),
        check("password", "Пароль не може бути пустим").not().isEmpty()
    ],
    async (req: express.Request, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login', {errors: errors.array(), formData: req.body});
            return
        }

        const {email, password} = req.body;

        try {
            const user = await User.findOne({where: {email}});
            if (!user) {
                return res.status(400).render("login", {errors: [{msg: "Акаунт не знайдено"}], formData: req.body});
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).render("login", {errors: [{msg: "Неправильний пароль"}], formData: req.body});
            }

            const token = JWTService.generateToken(user.user_id)

            res
                .cookie("token", token, {httpOnly: true})
                .redirect('/profile');
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.post("/add-passenger",
    [
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("benefitDocument", "Номер пільгового документа не може бути пустим").optional()
    ],
    auth,
    async (req: UserRequest, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
            return
        }

        const {firstName, lastName, benefitId, benefitDocument} = req.body;

        try {
            const passenger = new Passenger();
            passenger.passenger_first_name = firstName;
            passenger.passenger_last_name = lastName;
            passenger.benefit = benefitId ? await Benefit.findOne({where: {benefit_id: benefitId}}) : null;
            passenger.benefit_document = benefitDocument || null;

            passenger.user = await User.findOne({where: {user_id: req.userId}});

            await passenger.save();

            res.status(201).redirect('/profile');
        } catch (err) {
            console.error(err);
            res.status(500).json({errors: [{msg: "Помилка сервера"}]});
        }
    }
);

app.post("/edit-passenger",
    [
        check("passengerId", "ID пасажира є обов'язковим").not().isEmpty(),
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("benefitDocument", "Номер пільгового документа не може бути пустим")
            .optional({checkFalsy: true})
            .isLength({min: 1})
    ],
    auth,
    async (req: UserRequest, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({errors: errors.array()});
            return;
        }

        const {passengerId, firstName, lastName, benefitId, benefitDocument} = req.body;

        try {
            const passenger = await Passenger.findOne(
                {
                    where: {passenger_id: passengerId, user: {user_id: req.userId}}
                });
            if (!passenger) {
                res.status(404).json({errors: [{msg: "Пасажир не знайдений"}]});
                return
            }

            passenger.passenger_first_name = firstName;
            passenger.passenger_last_name = lastName;
            passenger.benefit = benefitId ? await Benefit.findOne({where: {benefit_id: benefitId}}) : null;
            passenger.benefit_document = benefitDocument || null;

            await passenger.save();

            res.status(200).redirect('/profile');
        } catch (err) {
            console.error(err);
            res.status(500).json({errors: [{msg: "Помилка сервера"}]});
        }
    }
);

app.delete("/delete-passenger/:id", auth, async (req: UserRequest, res: express.Response) => {
    try {
        const passengerId = +req.params.id;
        const passenger = await Passenger.findOne({
            where: {
                passenger_id: passengerId,
                user: {
                    user_id: req.userId
                }
            },
        });

        if (!passenger) {
            res.status(404).json({ error: "Пасажира не знайдено або ви не маєте дозволу на видалення цього пасажира" });
            return
        }

        await passenger.remove();
        res.status(200).json({ message: "Пасажира успішно видалено" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Помилка сервера" });
    }
});

app.delete("/delete-account", auth, async (req: UserRequest, res: express.Response) => {
    try {
        await User.delete({user_id: req.userId});
        res.clearCookie('token')
        res.status(200).json({ message: "Користувач успішно видалений" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Помилка сервера" });
    }
});

app.post("/edit-profile",
    [
        check("email", "Введіть правильну адресу електронної пошти").isEmail(),
        check("firstName", "Імʼя не може бути пустим").not().isEmpty(),
        check("lastName", "Прізвище не може бути пустим").not().isEmpty(),
        check("phoneNumber", "Введіть правильний номер телефону").isMobilePhone("uk-UA")
    ],
    auth,
    async (req: UserRequest, res: express.Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, firstName, lastName, phoneNumber } = req.body;

        try {
            const existingUser = await User.findOne({
                where: {
                    email,
                    user_id: Not(req.userId!)
                }
            });
            if (existingUser) {
                res.status(400).json({ errors: [{ msg: 'Користувач з такою електронною адресою вже існує' }] });
                return;
            }

            const updateData: any = { email, user_first_name: firstName, user_last_name: lastName, phone_number: phoneNumber };
            await User.update({ user_id: req.userId }, updateData);

            res.status(200).json({ msg: "Профіль успішно оновлено" });
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);

AppDataSource.initialize()
    .catch((error) => console.log(error))

const port: number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});