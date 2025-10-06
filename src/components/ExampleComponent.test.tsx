import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExampleComponent } from "./ExampleComponent";

describe("ExampleComponent", () => {
  it("renders hello world text", () => {
    render(<ExampleComponent />);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });
});
