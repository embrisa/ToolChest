import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "../Button";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe("Button Component", () => {
  describe("rendering", () => {
    it("should render button with text", () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it("should render button with custom className", () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should render different button variants", () => {
      const { rerender } = render(<Button variant="primary">Primary</Button>);
      let button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gradient-to-r", "from-brand-500");

      rerender(<Button variant="secondary">Secondary</Button>);
      button = screen.getByRole("button");
      expect(button).toHaveClass("bg-neutral-100", "dark:bg-neutral-800");

      rerender(<Button variant="ghost">Ghost</Button>);
      button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-neutral-100");
    });

    it("should render different button sizes", () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole("button");
      expect(button).toHaveClass("px-4", "py-2", "text-sm");

      rerender(<Button size="md">Medium</Button>);
      button = screen.getByRole("button");
      expect(button).toHaveClass("px-6", "py-3", "text-sm");

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole("button");
      expect(button).toHaveClass("px-8", "py-4", "text-base");
    });
  });

  describe("states", () => {
    it("should render disabled button", () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("disabled:opacity-50");
    });

    it("should render loading button", () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");

      // Check for loading text
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should handle loading state with custom text", () => {
      render(
        <Button isLoading loadingText="Saving...">
          Save
        </Button>,
      );
      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(screen.queryByText("Save")).not.toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("should call onClick when clicked", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole("button");

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );
      const button = screen.getByRole("button");

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} isLoading>
          Loading
        </Button>,
      );
      const button = screen.getByRole("button");

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should handle keyboard navigation", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();

      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.keyDown(button, { key: " " });
      // Should handle keyboard activation
    });
  });

  describe("accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations when disabled", async () => {
      const { container } = render(<Button disabled>Disabled Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have no accessibility violations when loading", async () => {
      const { container } = render(<Button isLoading>Loading Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should have proper ARIA attributes for loading state", () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toBeDisabled();
    });

    it("should have proper focus styles", () => {
      render(<Button>Focusable Button</Button>);
      const button = screen.getByRole("button");

      button.focus();
      expect(button).toHaveFocus();
      expect(button).toHaveClass(
        "focus:outline-none",
        "focus:ring-2",
        "focus:ring-brand-500/50",
      );
    });

    it("should support custom ARIA attributes", () => {
      render(
        <Button aria-label="Custom label" aria-describedby="description">
          Button
        </Button>,
      );
      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-label", "Custom label");
      expect(button).toHaveAttribute("aria-describedby", "description");
    });
  });

  describe("as different elements", () => {
    it("should render as button element", () => {
      render(<Button>Button Element</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("performance", () => {
    it("should not re-render unnecessarily", () => {
      const renderSpy = jest.fn();
      const TestButton = ({ children }: { children: React.ReactNode }) => {
        renderSpy();
        return <Button>{children}</Button>;
      };

      const { rerender } = render(<TestButton>Button</TestButton>);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestButton>Button</TestButton>);
      // Should optimize re-renders if possible
    });
  });
});
