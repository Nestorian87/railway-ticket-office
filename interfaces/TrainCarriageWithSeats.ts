import { TrainCarriage } from "../models/TrainCarriage";
import {SeatInfo} from "./SeatInfo";

export interface TrainCarriageWithSeats extends TrainCarriage {
    seats: SeatInfo[]
}