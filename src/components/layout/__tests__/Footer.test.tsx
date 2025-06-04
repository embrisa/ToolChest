import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders current year", () => {
    const year = new Date().getFullYear().toString();
    render(<Footer />);
    expect(
      screen.getByText((content) => content.includes(year)),
    ).toBeInTheDocument();
  });
});
