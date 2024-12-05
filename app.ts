import express from 'express';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "reflect-metadata"
import passengerRoutes from "./routes/passengerRoutes";
import userRoutes from "./routes/userRoutes";
import stationRoutes from "./routes/stationRoutes";
import trainRoutes from "./routes/trainRoutes";
import {AppDataSource} from "./config/database";
import ticketRoutes from "./routes/ticketRoutes";

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(userRoutes);
app.use(passengerRoutes);
app.use(stationRoutes);
app.use(trainRoutes);
app.use(ticketRoutes);

AppDataSource.initialize()
    .catch((error) => console.log(error))

const port: number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});