import { getHomeData } from '../services/dashboardService.js';

export const seeAllHomeData = async (req, res) => {
    try {
        const result = await getHomeData();
        res.status(200).json({
            message: 'Berhasil mendapatkan data dashboard',
            data: result,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
