import redis from "../config/redis.js";

const MAX_REQUESTS = 5;
const WINDOW_SECONDS = 10 * 60;

export const rateLimitMiddleware = async (req, res, next) => {
    try {
        const userId = req.userId;

        const key = `docuflow:rate:user:${userId}`;

        const requestCount = await redis.incr(key);

        if (requestCount === 1) {
            await redis.expire(key, WINDOW_SECONDS);
        }

        if (requestCount > MAX_REQUESTS) {
            return res.status(429).json({
                success: false,
                message: "Too many AI queries. Please try again later."
            });
        }

        next();

    } catch (error) {
        console.error("Rate limit error:", error);
        next();
    }
};