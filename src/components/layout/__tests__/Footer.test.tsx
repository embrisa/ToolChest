import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";

// Mock Next.js Link component to avoid navigation issues
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

describe("Footer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders current year", () => {
    const year = new Date().getFullYear().toString();
    render(<Footer />);
    expect(
      screen.getByText((content) => content.includes(year)),
    ).toBeInTheDocument();
  });
});
