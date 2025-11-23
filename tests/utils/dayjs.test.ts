import { addMinutes, currentDate } from "../../src/utils/dayjs";

describe("dayjs utils", () => {
  describe("addMinutes", () => {
    it("should add the specified number of minutes to the current date", () => {
      const baseline = currentDate();
      const result = addMinutes(5);

      // Calculate expected time (in milliseconds)
      const expected = baseline.getTime() + 5 * 60 * 1000;
      // The result should be within 1 second of expected time to account for test execution time
      expect(Math.abs(result.getTime() - expected)).toBeLessThan(1000);
    });
  });
});
