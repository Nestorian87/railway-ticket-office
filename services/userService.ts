import {User} from "../models/User";
import {UserRepository} from "../repositories/userRepository";
import bcrypt from "bcryptjs";
import {UserExistsError} from "../utils/errors/UserExistsError";
import {NotFoundError} from "../utils/errors/NotFoundError";
import {IncorrectPasswordError} from "../utils/errors/IncorrectPasswordError";
import {Not} from "typeorm";

export const UserService = {

    async getUser(userId: number): Promise<User | null> {
        return UserRepository.findOneBy({user_id: userId});
    },

    async getUserWithPassengers(userId: number): Promise<User | null> {
        return UserRepository.findOneByIdWithPassengers(userId)
    },

    async addUser(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
        phoneNumber: string
    ): Promise<User> {
        const existingUser = await UserRepository.findOneBy({email});
        if (existingUser) {
            throw new UserExistsError("The user with this email already exists");
        }

        const user = new User();
        user.email = email;
        user.user_first_name = firstName;
        user.user_last_name = lastName;
        user.phone_number = phoneNumber;

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        return await UserRepository.save(user);
    },

    async login(email: string, password: string): Promise<User> {
        const user = await UserRepository.findOneBy({email});

        if (!user) {
            throw new NotFoundError("No user with this email found");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new IncorrectPasswordError("Password is incorrect");
        }

        return user
    },

    async updateUser(
        userId: number,
        email: string,
        firstName: string,
        lastName: string,
        phoneNumber: string
    ): Promise<void> {
        const existingUser = await UserRepository.findOneBy({email, user_id: Not(userId!)});
        if (existingUser) {
            throw new UserExistsError("The user with this email already exists");
        }

        const updateData: any = {
            email,
            user_first_name: firstName,
            user_last_name: lastName,
            phone_number: phoneNumber
        };

        await UserRepository.update({user_id: userId}, updateData);
    },

    async deleteUser(userId: number): Promise<void> {
        const result = await UserRepository.delete({user_id: userId});
        if (result.affected === 0) {
            throw new NotFoundError("User is not found");
        }
    }
}