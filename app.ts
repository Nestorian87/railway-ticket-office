import express, {NextFunction} from 'express';
import {DataSource} from "typeorm";
import {User} from "./entity/User";
import {Passenger} from "./entity/Passenger";
import {Benefit} from "./entity/Benefit";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "reflect-metadata"
import {check, validationResult} from "express-validator";
import bcrypt from "bcryptjs";
import JWTService from "./utils/JWTService";

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

            res.redirect('/login');
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

            res.cookie("token", token, {httpOnly: true}).redirect("/");
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


AppDataSource.initialize()
    .catch((error) => console.log(error))

const port: number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

export interface UserRequest extends express.Request { //TODO extract
    userId?: number;
}
