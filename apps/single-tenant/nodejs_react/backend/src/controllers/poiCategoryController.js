import {
    getAllPoiCategoriesService,
    togglePoiCategoryStatusService,
    updatePoiCategoryTimeScoresService,
    bulkUpdatePoiCategoryTimeScoresService,
} from "../services/poiService.js";
import { poiTimeCrowdService } from "../services/poi/POITimeCrowdService.js";

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

/**
 * Standard B-09 GET /api/poi-categories/crowd-scores
 */
export const getCrowdScores = async (req, res) => {
    try {
        const data = await poiTimeCrowdService.getCrowdScoresStandard();
        return res.status(200).json(data);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

/**
 * Standard B-09 PUT /api/poi-categories/crowd-scores
 */
export const updateBulkCrowdScores = async (req, res) => {
    try {
        const items = req.body.scores || req.body.categories || req.body;
        if (!Array.isArray(items)) {
            return res.status(400).json({ msg: "Payload 'scores' harus berupa array berisi penilaian kategori POI." });
        }
        const updated = await poiTimeCrowdService.bulkUpdateCategoryTimeScores(items, req.user);
        return res.status(200).json({
            status: "success",
            msg: `Berhasil memperbarui skor keramaian berbasis waktu untuk ${updated.length} kategori POI`,
            total_updated: updated.length,
            categories: updated,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

/**
 * Standard B-09 PUT /api/poi-categories/:id/crowd-scores
 */
export const updateSingleCrowdScores = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await poiTimeCrowdService.updateCategoryTimeScores(id, req.body, req.user);
        return res.status(200).json({
            status: "success",
            msg: `Skor keramaian berbasis waktu untuk kategori '${updated.name}' berhasil diperbarui`,
            category: updated,
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
        }, req.user);
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
        const updated = await bulkUpdatePoiCategoryTimeScoresService(categories, req.user);
        return res.status(200).json({
            msg: `Berhasil memperbarui skor keramaian berbasis waktu untuk ${updated.length} kategori POI`,
            categories: updated,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};


