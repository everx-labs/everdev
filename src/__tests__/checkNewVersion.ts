import { checkNewVersion } from "../everdev/checkNewVersion";
import { doneTests, initTests } from "./init";

beforeAll(initTests);
afterAll(doneTests);

test("Shoud see message of the day only once", async () => {
    const result1 = await checkNewVersion("everdev", "0.1.0");
    expect(result1.length).toBeGreaterThan(0);
    console.log(result1);
    const result2 = await checkNewVersion("everdev", "0.1.0");
    expect(result2.length).toEqual(0);
});
