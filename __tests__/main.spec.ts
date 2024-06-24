import supertest from "supertest";

const request = supertest("http://localhost:4000");

describe("test sample", () => {
  it("should pass", () => {
    const t: Boolean = true;
    expect(t).toBe(true);
  });

  it("should validate the rest", async () => {
    const res = await request
      .get("/hello")
      .set("Accept", "application/json")
      .expect(200);
    expect(res.text).toBe("Hello World!!!");
  });

  it("should graphql query", async () => {
    const res = await request
      .post("/graphql")
      .send({
        query: `
          query {
            hello
          }
        `,
      })
      .expect(200);
    expect(res.body.data.hello).toBe("Hello World");
  });
});
//
