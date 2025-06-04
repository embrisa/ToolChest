import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../Card";

expect.extend(toHaveNoViolations);

describe("Card component", () => {
  it("renders sections", () => {
    render(
      <Card>
        <CardHeader>Head</CardHeader>
        <CardTitle>Title</CardTitle>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Head")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Card>
        <CardHeader>Head</CardHeader>
        <CardContent>Body</CardContent>
      </Card>,
    );
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
