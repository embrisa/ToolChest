import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Input } from "../Input";

expect.extend(toHaveNoViolations);

describe("Input component", () => {
  it("renders label and associates input", () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText(/name/i);
    expect(input).toBeInTheDocument();
  });

  it("shows error state", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("supports helper text", () => {
    render(<Input label="Email" helperText="We'll never share" />);
    expect(screen.getByText(/never share/i)).toBeInTheDocument();
  });

  it("is marked required", () => {
    render(<Input label="Username" isRequired />);
    const star = screen.getByLabelText(/required/);
    expect(star).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Input label="Email" />);
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
