import { Train } from "../models/Train";
import {TrainCarriageWithSeats} from "./TrainCarriageWithSeats";

export interface TrainWithCarriagesAndSeats extends Train {
    carriages: TrainCarriageWithSeats[]
}