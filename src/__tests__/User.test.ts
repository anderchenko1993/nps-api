import request from 'supertest';
import { app } from '../app';
import { getConnection } from 'typeorm';

import createConnection from "../database";

describe("Users", () => {
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.runMigrations(); 
    });

    // afterAll(async () => {
    //     const connection = getConnection();
    //     connection.dropDatabase();
    //     connection.close();
    // });

    it("Should be able to create a new user", async() => {
        const response = await request(app).post("/users").send({
            email: "user@example.com",
            name: "User Example"
        });

        expect(response.status).toBe(201);
    });

    it("Should not be able to create an user with exists email", async() => {
        const response = await request(app).post("/users").send({
            email: "user@example.com",
            name: "User Example"
        });

        expect(response.status).toBe(400);
    });

});