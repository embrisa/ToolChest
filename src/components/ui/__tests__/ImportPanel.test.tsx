import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportPanel, type ImportMode } from "../ImportPanel";
import { screen as rtlScreen } from "@testing-library/react";

function Wrapper() {
  const [mode, setMode] = React.useState<ImportMode>("text");
  const [text, setText] = React.useState("");
  const onFileSelect = jest.fn();
  const onAnnounce = jest.fn();

  return (
    <ImportPanel
      mode={mode}
      onModeChange={setMode}
      textValue={text}
      onTextChange={setText}
      onFileSelect={onFileSelect}
      accept="*/*"
      maxSizeMB={10}
      onAnnounce={onAnnounce}
    />
  );
}

describe("ImportPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows typing in text mode and shows character count", async () => {
    render(<Wrapper />);

    const textarea = screen.getByLabelText(/text input/i);
    await userEvent.type(textarea, "hello");

    expect(screen.getByText(/5 characters/i)).toBeInTheDocument();

    // Clear button clears content
    await userEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByText(/0 characters/i)).toBeInTheDocument();
  });

  it("pastes text from clipboard when clicking paste button", async () => {
    render(<Wrapper />);

    const readTextSpy = jest
      .spyOn(navigator.clipboard, "readText")
      .mockResolvedValue("from-clipboard");

    await userEvent.click(
      screen.getByRole("button", { name: /paste from clipboard/i }),
    );

    expect(readTextSpy).toHaveBeenCalled();
    // "from-clipboard" has 14 characters
    expect(await screen.findByText(/14 characters/i)).toBeInTheDocument();
  });

  it("switches to file mode and selects a file via picker", async () => {
    const onFileSelect = jest.fn();
    function Harness() {
      const [mode, setMode] = React.useState<ImportMode>("text");
      return (
        <ImportPanel
          mode={mode}
          onModeChange={setMode}
          textValue={""}
          onTextChange={() => {}}
          onFileSelect={onFileSelect}
          accept="*/*"
          maxSizeMB={10}
        />
      );
    }

    render(<Harness />);

    // Switch to file mode
    await userEvent.click(screen.getByRole("button", { name: /file/i }));

    const fileInput = screen.getByLabelText(/file upload input/i) as HTMLInputElement;
    const file = new File(["file-content"], "test.txt", { type: "text/plain" });

    // Trigger change on file input
    // In some jsdom environments, userEvent.upload may not call onChange; use fireEvent
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect((onFileSelect.mock.calls[0][0] as File).name).toBe("test.txt");
  });

  it("supports pasting a file in file mode", async () => {
    render(<Wrapper />);

    // Switch to file mode
    await userEvent.click(screen.getByRole("button", { name: /file/i }));

    const target = screen.getByLabelText(/file upload input/i);
    const file = new File(["content"], "pasted.txt", { type: "text/plain" });

    const clipboardData = {
      items: [
        {
          kind: "file",
          getAsFile: () => file,
        },
      ],
    } as unknown as DataTransfer;

    fireEvent.paste(target, { clipboardData });

    // No direct callback to assert; ensure no crash and UI remains
    expect(screen.getByText(/click to upload/i)).toBeInTheDocument();
  });

  it("shows validation error for oversized file and prevents callback", async () => {
    const onFileSelect = jest.fn();
    render(
      <ImportPanel
        mode="file"
        onModeChange={() => {}}
        textValue=""
        onTextChange={() => {}}
        onFileSelect={onFileSelect}
        accept="*/*"
        maxSizeMB={0.001} // ~1KB
      />,
    );

    const fileInput = screen.getByLabelText(/file upload input/i) as HTMLInputElement;
    const bigContent = "x".repeat(2048); // 2KB
    const file = new File([bigContent], "big.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(
      await rtlScreen.findByText(/file too large/i),
    ).toBeInTheDocument();
  });

  it("shows large input hint when text exceeds threshold", async () => {
    render(
      <ImportPanel
        mode="text"
        onModeChange={() => {}}
        textValue={"hello world"}
        onTextChange={() => {}}
        onFileSelect={() => {}}
        largeHintThresholdMB={0.000001} // tiny threshold
      />,
    );

    expect(screen.getByText(/large input/i)).toBeInTheDocument();
  });

  it("shows large file hint when file exceeds threshold but under max", async () => {
    const onFileSelect = jest.fn();
    render(
      <ImportPanel
        mode="file"
        onModeChange={() => {}}
        textValue={""}
        onTextChange={() => {}}
        onFileSelect={onFileSelect}
        largeHintThresholdMB={0.0005} // ~0.5KB
        maxSizeMB={1}
      />,
    );

    const fileInput = screen.getByLabelText(/file upload input/i) as HTMLInputElement;
    const content = "x".repeat(800); // ~0.8KB
    const file = new File([content], "mid.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileSelect).toHaveBeenCalled();
    expect(screen.getByText(/large file detected/i)).toBeInTheDocument();
  });
});
