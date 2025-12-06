import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { MultiSelect } from "../MultiSelect";
import { MultiSelectOption } from "@/types/admin/relationship";

expect.extend(toHaveNoViolations);

const options: MultiSelectOption[] = [
  { id: "1", label: "Alpha" },
  { id: "2", label: "Beta" },
  { id: "3", label: "Gamma" },
];

beforeAll(() => {
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    value: jest.fn(),
    writable: true,
  });
});

describe("MultiSelect", () => {
  it("associates label and description for accessibility", async () => {
    const { container } = render(
      <MultiSelect
        options={options}
        selectedIds={[]}
        onSelectionChange={jest.fn()}
        label="Select tools"
        description="Choose one or more items"
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /select tools/i });
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAccessibleDescription("Choose one or more items");

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("allows selecting options via pointer", async () => {
    const handleSelectionChange = jest.fn();
    const user = userEvent.setup();

    render(
      <MultiSelect
        options={options}
        selectedIds={[]}
        onSelectionChange={handleSelectionChange}
        label="Choose options"
      />,
    );

    const combobox = screen.getByRole("combobox", { name: /choose options/i });
    await user.click(combobox);

    const renderedOptions = await screen.findAllByRole("option");
    await user.click(renderedOptions[0]);

    expect(handleSelectionChange).toHaveBeenCalledWith(["1"]);
  });
});

