import {CarriageCategoryRepository} from "../repositories/carriageCategoryRepository";
import {CarriageCategory} from "../models/CarriageCategory";
import {NotFoundError} from "../utils/errors/NotFoundError";

export const CarriageCategoryService = {

    async getCarriageCategory(carriageCategoryId: number): Promise<CarriageCategory | null> {
        const category = await CarriageCategoryRepository.findOne({
            where: {carriage_category_id: carriageCategoryId}
        });
        if (!category) {
            throw new NotFoundError("Carriage category not found");
        }
        return category;
    }
}