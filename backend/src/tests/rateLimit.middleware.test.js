import { jest } from "@jest/globals";

jest.unstable_mockModule("../config/redis.js", () => ({
    default: {
        incr: jest.fn(),
        expire: jest.fn()
    }
}));

const { rateLimitMiddleware } = await import("../middlewares/rateLimitMiddleware.js");
const { default: redis } = await import("../config/redis.js");


describe("rateLimitMiddleware", () => {

    test("blocks request when limit is exceeded", async () => {

        redis.incr.mockResolvedValue(6);

        const req = {
            userId: "user123"
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const next = jest.fn();

        await rateLimitMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Too many AI queries. Please try again later."
        });
        expect(next).not.toHaveBeenCalled();
    });

    test("allows request when limit is not exceeded", async () => {
        redis.incr.mockResolvedValue(3);

        const req = {
            userId: "user123"
        };

        const res = {
            status: jest.fn(),
            json: jest.fn()
        };

        const next = jest.fn();

        await rateLimitMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
    });

});