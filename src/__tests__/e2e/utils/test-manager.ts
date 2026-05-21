import request from "supertest"

export class TestManager {
    constructor(private app: any, private path: string) {
        this.app = app
        this.path = path
    }

    async createEntity(data: any, token: string | null, url: string = '') {
        let response
        if (token) {
            response = await request(this.app)
                .post(this.path + url)
                .set('Authorization', token)
                .send(data)
        } else {
            response = await request(this.app)
                .post(this.path + url)
                .send(data)
        }

        return response
    }

    async findEntity(token: string | null, url: string = '') {
        let response

        if (token) {
            response = await request(this.app)
                .get(this.path + url)
                .set('Authorization', token)
        } else {
            response = await request(this.app)
                .get(this.path + url)
        }

        return response
    }

    async updateEntity(data: any, token: string | null, url: string = '') {
        let response
        if (token) {
            response = await request(this.app)
                .put(this.path + url)
                .set('Authorization', token)
                .send(data)
        } else {
            response = await request(this.app)
                .put(this.path + url)
                .send(data)
        }

        return response
    }

    async deleteEntity(token: string | null, url: string = '') {
        let response

        if (token) {
            response = await request(this.app)
                .delete(this.path + url)
                .set('Authorization', token)
        } else {
            response = await request(this.app)
                .delete(this.path + url)
        }

        return response
    }
}
