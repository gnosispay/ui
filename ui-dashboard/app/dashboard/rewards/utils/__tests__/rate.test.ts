import { calculateCashbackRate } from "../rate";

describe("rate", () => {
  describe("calculateCashbackRate", () => {
    it("returns 0 if gnoBalance is undefined", () => {
      expect(calculateCashbackRate()).toBe(0);
    });

    it("returns 0 if gnoBalance is 0", () => {
      expect(calculateCashbackRate(0)).toBe(0);
    });

    it("returns 1 if gnoBalance is 0.1", () => {
      expect(calculateCashbackRate(0.1)).toBe(1);
    });

    it("returns ±1.77 if gnoBalance is 0.8", () => {
      expect(calculateCashbackRate(0.8)).toBeCloseTo(1.777);
    });

    it("returns 2 if gnoBalance is 1", () => {
      expect(calculateCashbackRate(1)).toBe(2);
    });

    it("returns ±2.16 if gnoBalance is 2.5", () => {
      expect(calculateCashbackRate(2.5)).toBeCloseTo(2.1666);
    });

    it("returns 3 if gnoBalance is 10", () => {
      expect(calculateCashbackRate(10)).toBe(3);
    });

    it("returns ±3.34 if gnoBalance is 50", () => {
      expect(calculateCashbackRate(50)).toBeCloseTo(3.444444);
    });

    it("returns 4 if gnoBalance is 100", () => {
      expect(calculateCashbackRate(100)).toBe(4);
    });

    it("returns 5 if gnoBalance is 1000", () => {
      expect(calculateCashbackRate(1000)).toBe(5);
    });

    it("returns 5 if gnoBalance is 10000", () => {
      expect(calculateCashbackRate(10000)).toBe(5);
    });
  });
});
