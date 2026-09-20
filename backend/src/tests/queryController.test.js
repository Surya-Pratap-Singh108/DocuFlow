import { jest } from "@jest/globals";
import { queryController } from "../controllers/query.controller.js";

describe("queryController", () => {

    test("returns 400 when query is missing", async () => {
        const req = {
            body: {}
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await queryController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Query is required"
        });
    });

});