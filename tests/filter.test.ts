import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Photo } from "~/types";
import {
  DEFAULT_FILTER_OPTIONS,
  loadOptions,
  saveOptions,
} from "~/utils/filterImages";

const MOCK_DATA: Photo[] = [

];

describe("filter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2050, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should filter by prefix", () => {
    const result = filterImages(
      MOCK_DATA,
      { ...DEFAULT_FILTER_OPTIONS, prefix: "i/2024/01/14" },
      { enableFuzzySearch: false, fuzzySearchThreshold: 0.6 },
    );
    expect(result).toMatchSnapshot();
  });

  it("should filter by date range", () => {
    const result = filterImages(
      MOCK_DATA,
      {
        ...DEFAULT_FILTER_OPTIONS,
        dateRange: {
          start: new Date("2024-05-10T02:30:18.303Z"),
          end: new Date("2024-06-07T02:30:21.003Z"),
        },
      },
      { enableFuzzySearch: false, fuzzySearchThreshold: 0.6 },
    );
    expect(result).toMatchSnapshot();
  });
  it("should honor sort by option", () => {
    (["key", "date"] as const).forEach((by) => {
      const result = filterImages(
        MOCK_DATA.slice(0, 5),
        {
          ...DEFAULT_FILTER_OPTIONS,
          sort: {
            by,
            orderIsDesc: true,
          },
        },
        { enableFuzzySearch: false, fuzzySearchThreshold: 0.6 },
      );
      expect(result).toMatchSnapshot();
    });
  });
  it("should honor sort order option", () => {
    const results = [true, false].map((orderIsDesc) =>
      filterImages(
        MOCK_DATA.slice(0, 5),
        {
          ...DEFAULT_FILTER_OPTIONS,
          sort: {
            by: "key",
            orderIsDesc,
          },
        },
        { enableFuzzySearch: false, fuzzySearchThreshold: 0.6 },
      ),
    );
    expect(results[0]?.length).not.toBe(0);
    expect(results[0]).toEqual(results[1]?.reverse());
  });
  it("should use simple search if fuzzy search is disabled", () => {
    const result = filterImages(
      MOCK_DATA,
      {
        ...DEFAULT_FILTER_OPTIONS,
        searchTerm: "2.webp",
      },
      { enableFuzzySearch: false, fuzzySearchThreshold: 0.6 },
    );
    expect(result).toMatchSnapshot();
  });
  it("should use fuzzy search if enabled", () => {
    const result = filterImages(
      MOCK_DATA,
      {
        ...DEFAULT_FILTER_OPTIONS,
        searchTerm: "880o",
      },
      { enableFuzzySearch: true, fuzzySearchThreshold: 0.6 },
    );
    expect(result).toMatchSnapshot();
  });
  it("should honor fuzzy search threshold", () => {
    const result = filterImages(
      MOCK_DATA,
      {
        ...DEFAULT_FILTER_OPTIONS,
        searchTerm: "880o",
      },
      { enableFuzzySearch: true, fuzzySearchThreshold: 1 },
    );
    expect(result.length).toBe(MOCK_DATA.length);
  });
});

describe("persist filter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2050, 0));
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  it("should load", () => {
    const result = loadOptions(new URLSearchParams("prefix=i/2023"), {
      prefix: "i/2023",
    });
    expect(result).toEqual({
      ...DEFAULT_FILTER_OPTIONS,
      prefix: "i/2023",
    });
  });
  it("should save", () => {
    const result = saveOptions({ ...DEFAULT_FILTER_OPTIONS, prefix: "i/2023" });
    expect(result).toEqual({ prefix: "i/2023" });
  });
  it("should ignore invalid dateRange", () => {
    const result = loadOptions(new URLSearchParams("dateRange=invalid"), {
      dateRange: "invalid",
    });
    expect(result).toBeUndefined();
  });
  it("should load custom dateRange", () => {
    const result = loadOptions(
      new URLSearchParams(
        "dateRangeType=custom&dateRangeStart=2024-10-02T20:50:38.301Z&dateRangeEnd=2024-10-16T20:50:38.301Z",
      ),
      {
        dateRangeType: "custom",
        dateRangeStart: "2024-10-02T20:50:38.301Z",
        dateRangeEnd: "2024-10-16T20:50:38.301Z",
      },
    );
    expect(result).toEqual({
      ...DEFAULT_FILTER_OPTIONS,
      dateRange: {
        start: new Date("2024-10-02T20:50:38.301Z"),
        end: new Date("2024-10-16T20:50:38.301Z"),
      },
      dateRangeType: "custom",
    });
  });
});
