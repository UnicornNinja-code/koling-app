import {
    getAllPoiCategoriesService,
    togglePoiCategoryStatusService,
    updatePoiCategoryTimeScoresService,
    bulkUpdatePoiCategoryTimeScoresService,
} from "../services/poiService.js";

export const getAllPoiCategories = async (req, res) => {
    try {
        const categories = await getAllPoiCategoriesService();
        return res.status(200).json({ categories });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const togglePoiCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await togglePoiCategoryStatusService(id);
        return res.status(200).json({
            msg: `POI category '${category.name}' is now ${category.is_active ? "active" : "inactive"}`,
            category,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const updatePoiCategoryTimeScores = async (req, res) => {
    try {
        const { id } = req.params;
        const { score_pagi, score_siang, score_sore, score_malam } = req.body;
        const category = await updatePoiCategoryTimeScoresService(id, {
            score_pagi,
            score_siang,
            score_sore,
            score_malam,
        });
        return res.status(200).json({
            msg: `Skor keramaian berbasis waktu untuk kategori '${category.name}' berhasil diperbarui`,
            category,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const bulkUpdatePoiCategoryTimeScores = async (req, res) => {
    try {
        const { categories } = req.body;
        const updated = await bulkUpdatePoiCategoryTimeScoresService(categories);
        return res.status(200).json({
            msg: `Berhasil memperbarui skor keramaian berbasis waktu untuk ${updated.length} kategori POI`,
            categories: updated,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

