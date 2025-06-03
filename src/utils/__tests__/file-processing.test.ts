import { base64ToBlob } from "../file-processing";

function blobToText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

describe("file processing utilities", () => {
  it("converts base64 to blob", async () => {
    const blob = base64ToBlob("dGVzdA==", "text/plain");
    expect(blob.type).toBe("text/plain");
    expect(await blobToText(blob)).toBe("test");
  });
});
