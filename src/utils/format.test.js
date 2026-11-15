import { describe, expect, it } from "vitest";
import {
  formatCompact,
  isValidUsername,
  parseUsername,
  reposToCsv,
  resolveUsername,
  timeAgo
} from "./format";
import { parseHash, userPath } from "./router.pure";

describe("usernames", () => {
  it("accepts valid GitHub usernames", () => {
    expect(isValidUsername("octocat")).toBe(true);
    expect(isValidUsername("a-b-c")).toBe(true);
    expect(isValidUsername("user123")).toBe(true);
  });

  it("rejects invalid usernames", () => {
    expect(isValidUsername("-bad")).toBe(false);
    expect(isValidUsername("bad-")).toBe(false);
    expect(isValidUsername("double--hyphen")).toBe(false);
    expect(isValidUsername("has space")).toBe(false);
    expect(isValidUsername("a".repeat(40))).toBe(false);
  });

  it("parses @handles and profile URLs", () => {
    expect(parseUsername("  @octocat ")).toBe("octocat");
    expect(parseUsername("https://github.com/octocat")).toBe("octocat");
    expect(parseUsername("github.com/octocat/hello-world")).toBe("octocat");
  });

  it("returns friendly errors", () => {
    expect(resolveUsername("").error).toContain("enter");
    expect(resolveUsername("bad name!").error).toContain("valid");
    expect(resolveUsername("octocat")).toEqual({ name: "octocat", error: "" });
  });
});

describe("formatting", () => {
  it("formats compact numbers", () => {
    expect(formatCompact(950)).toBe("950");
    expect(formatCompact(14204)).toBe("14.2K");
    expect(formatCompact(1500000)).toBe("1.5M");
  });

  it("describes elapsed time", () => {
    const now = new Date("2026-11-14T12:00:00Z");

    expect(timeAgo("2026-11-14T08:00:00Z", now)).toBe("today");
    expect(timeAgo("2026-11-13T08:00:00Z", now)).toBe("yesterday");
    expect(timeAgo("2026-11-04T08:00:00Z", now)).toBe("10 days ago");
    expect(timeAgo("2026-08-01T08:00:00Z", now)).toBe("3 months ago");
    expect(timeAgo("2023-11-01T08:00:00Z", now)).toBe("3 years ago");
    expect(timeAgo("garbage", now)).toBe("unknown");
  });
});

describe("CSV export", () => {
  it("escapes quotes and neutralises spreadsheet formulas", () => {
    const csv = reposToCsv([
      {
        name: "demo",
        description: 'He said "hi", twice',
        language: "JS",
        stargazers_count: 1,
        forks_count: 2,
        open_issues_count: 0,
        fork: false,
        archived: false,
        created_at: "2024-01-01",
        pushed_at: "2024-02-01",
        html_url: "https://github.com/x/demo"
      },
      { name: "=cmd()", description: null, html_url: "u" }
    ]);

    const lines = csv.split("\n");

    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain('"name"'.replace(/"/g, ""));
    expect(lines[1]).toContain('"He said ""hi"", twice"');
    expect(lines[2]).toContain("\"'=cmd()\"");
  });
});

describe("hash routing", () => {
  it("parses routes", () => {
    expect(parseHash("")).toEqual({ name: "home" });
    expect(parseHash("#/user/octocat")).toEqual({ name: "user", username: "octocat", tab: "overview" });
    expect(parseHash("#/user/octocat/activity").tab).toBe("activity");
    expect(parseHash("#/compare/a/b")).toEqual({ name: "compare", a: "a", b: "b" });
    expect(parseHash("#/compare")).toEqual({ name: "compare", a: "", b: "" });
  });

  it("builds paths", () => {
    expect(userPath("octocat", "repositories")).toBe("/user/octocat/repositories");
  });
});
