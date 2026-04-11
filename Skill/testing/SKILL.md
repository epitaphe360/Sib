---
description: "Test generation and TDD workflows: unit tests, integration tests, API endpoint testing, React component tests, test coverage analysis, test-driven development red-green-refactor cycle, edge case identification, mock generation."
---

# Testing Skill

## When to Activate
- User asks to write tests, generate test cases, or improve test coverage
- User mentions TDD, test-driven development, or red-green-refactor
- User asks about testing a specific feature or endpoint
- User mentions test coverage or test suite setup

## Instructions

### Test Strategy Selection

| Scenario | Test Type | Tools |
|----------|-----------|-------|
| Express API endpoints | Integration tests | supertest + vitest |
| Business logic functions | Unit tests | vitest |
| React components | Component tests | @testing-library/react + vitest |
| User flows | E2E tests | Playwright |
| Database operations | Integration tests | vitest + test DB |

### TDD Workflow (Red-Green-Refactor)

#### Phase 1: Red (Write Failing Tests)
1. Identify the feature or fix requirements
2. Write test cases that describe expected behavior
3. Include edge cases: empty inputs, invalid types, boundary values, concurrent access
4. Run tests to confirm they fail
5. Commit failing tests

#### Phase 2: Green (Minimal Implementation)
1. Write the minimum code to make tests pass
2. Do NOT optimize or refactor yet
3. Run tests to confirm they pass
4. Commit passing implementation

#### Phase 3: Refactor (Improve Code)
1. Refactor while keeping tests green
2. Extract helper functions if needed
3. Optimize performance
4. Run full test suite
5. Commit refactored code

### Test Generation Templates

#### Express API Endpoint Test
```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../server/index";

describe("POST /api/endpoint", () => {
  it("should return 200 with valid input", async () => {
    const res = await request(app)
      .post("/api/endpoint")
      .send({ field: "value" })
      .expect(200);
    expect(res.body).toHaveProperty("id");
  });

  it("should return 400 with invalid input", async () => {
    await request(app)
      .post("/api/endpoint")
      .send({})
      .expect(400);
  });

  it("should return 401 without authentication", async () => {
    await request(app)
      .post("/api/endpoint")
      .expect(401);
  });
});
```

#### React Component Test
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Updated Text")).toBeInTheDocument();
  });
});
```

### Edge Case Checklist
- [ ] Empty string inputs
- [ ] Null/undefined values
- [ ] Extremely long strings (>10000 chars)
- [ ] Special characters and HTML in inputs
- [ ] Concurrent requests to same endpoint
- [ ] Database connection failure scenarios
- [ ] Expired tokens and sessions
- [ ] Rate limit boundary (just under/over limit)
- [ ] File upload with wrong MIME type
- [ ] Pagination with offset > total count

### Coverage Analysis
After writing tests:
```bash
npx vitest run --coverage
```
Target: 80%+ line coverage for server routes, 70%+ for React components.
