import {CarriageCategoryRepository} from "../repositories/carriageCategoryRepository";
import {CarriageCategorySearchResult} from "../interfaces/CarriageCategorySearchResult";
import {SearchQuery} from "../interfaces/SearchQuery";

export const CarriageCategoryService = {

    async getTrainCarriageCategories(trainId: number, searchQuery: SearchQuery): Promise<CarriageCategorySearchResult[]> {
        return await CarriageCategoryRepository.findForTrainsBetweenTwoStations(
            [trainId],
            searchQuery.fromStationId,
            searchQuery.toStationId,
            searchQuery.date
        );
    }
}