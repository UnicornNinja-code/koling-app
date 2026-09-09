import {
    syncCityPoisService,
    reprocessLocalPoisService,
    getPoisByZoneService,
    getAllOperationalPoisService,
    getDensitasDanDiversitasC1C2Service,
    reclusterExistingPoisService,
    getLeakageReportService,
    getPendingPoisService,
    approveOrRejectPoiService,
    getApprovalLogsService,
    triggerCronDetectionService,
    getZoneC3ScoreService,
    getZoneC4ScoreService,
    getZoneC5ScoreService,
} from "../services/poiService.js";

export const syncCityPois = async (req, res) => {
    try {
        const result = await syncCityPoisService();
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const reprocessLocalPois = async (req, res) => {
    try {
        const result = await reprocessLocalPoisService();
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getPoisByZone = async (req, res) => {
    try {
        const { zone_id } = req.params;
        const pois = await getPoisByZoneService(zone_id);
        return res.status(200).json({ pois, count: pois.length });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getOperationalAreaPois = async (req, res) => {
    try {
        const pois = await getAllOperationalPoisService();
        return res.status(200).json({ pois, count: pois.length });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getDensitasDanDiversitasC1C2 = async (req, res) => {
    try {
        const { zone_id } = req.params;
        const result = await getDensitasDanDiversitasC1C2Service(zone_id);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getZoneC3Score = async (req, res) => {
    try {
        const { zone_id } = req.params;
        const { time } = req.query; // optional query param e.g. ?time=14:30 or ?time=pagi
        const result = await getZoneC3ScoreService(zone_id, time);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getZoneC4Score = async (req, res) => {
    try {
        const { zone_id } = req.params;
        const { time } = req.query;
        const result = await getZoneC4ScoreService(zone_id, time);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getZoneC5Score = async (req, res) => {
    try {
        const { zone_id } = req.params;
        const { lat, lon } = req.query;
        const result = await getZoneC5ScoreService(zone_id, lat, lon);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};



export const reclusterPois = async (req, res) => {
    try {
        const result = await reclusterExistingPoisService();
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getLeakageReport = async (req, res) => {
    try {
        const report = await getLeakageReportService();
        return res.status(200).json({ report, count: report.length });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getPendingPois = async (req, res) => {
    try {
        const pendingPois = await getPendingPoisService();
        return res.status(200).json({ pois: pendingPois, count: pendingPois.length });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const approveOrRejectPoi = async (req, res) => {
    try {
        const { poi_id, status, notes } = req.body;
        const userId = req.user?.id || req.user?.userId;
        const result = await approveOrRejectPoiService(poi_id, status, userId, notes);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const getApprovalLogs = async (req, res) => {
    try {
        const logs = await getApprovalLogsService();
        return res.status(200).json({ logs, count: logs.length });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

export const triggerCronDetection = async (req, res) => {
    try {
        const { hub_city } = req.body || {};
        const result = await triggerCronDetectionService(hub_city);
        return res.status(200).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({ msg: error.message || "Internal server error" });
    }
};

