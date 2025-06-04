import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { Toast } from "../Toast";
import type { ErrorNotification } from "@/types/errors";

expect.extend(toHaveNoViolations);

describe("Toast component", () => {
  const notification: ErrorNotification = {
    id: "1",
    type: "toast",
    severity: "low",
    title: "Hello",
    message: "World",
    dismissible: true,
  };

  it("renders message and dismisses", async () => {
    const onDismiss = jest.fn();
    const user = userEvent.setup();
    render(<Toast notification={notification} onDismiss={onDismiss} />);

    expect(screen.getByText(/world/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledWith("1");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Toast notification={notification} onDismiss={jest.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
