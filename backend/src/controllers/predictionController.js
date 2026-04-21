import fetch from 'node-fetch';

const FLASK_URL = process.env.FLASK_API_URL || 'http://localhost:5002';

export const getPredictions = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        let flaskUrl = `${FLASK_URL}/predict-all`;
        
        if (month && year) {
            flaskUrl += `?month=${month}&year=${year}`;
        }

        
        const response = await fetch(flaskUrl);
        
        if (!response.ok) {
            throw new Error('Flask API request failed');
        }
        
        const data = await response.json();
        
        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get predictions',
            error: error.message
        });
    }
};