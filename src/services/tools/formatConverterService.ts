import Papa from "papaparse";
import { js2xml, xml2js } from "xml-js";
import YAML from "js-yaml";
import {
  DataFormat,
  FormatConverterResult,
} from "@/types/tools/formatConverter";

/**
 * Service to convert data between JSON, XML, CSV and YAML formats
 * All conversions happen client-side
 */
export class FormatConverterService {
  public static convert(
    input: string,
    from: DataFormat,
    to: DataFormat,
  ): FormatConverterResult {
    const start = Date.now();
    try {
      let data: unknown;

      switch (from) {
        case "json":
          data = JSON.parse(input);
          break;
        case "yaml":
          data = YAML.load(input);
          break;
        case "xml":
          data = xml2js(input, { compact: true });
          break;
        case "csv":
          data = Papa.parse(input, { header: true }).data;
          break;
        default:
          throw new Error(`Unsupported input format: ${from}`);
      }

      let output: string;
      switch (to) {
        case "json":
          output = JSON.stringify(data, null, 2);
          break;
        case "yaml":
          output = YAML.dump(data);
          break;
        case "xml":
          output = js2xml(data as any, { compact: true, spaces: 2 });
          break;
        case "csv":
          output = Papa.unparse(data as any);
          break;
        default:
          throw new Error(`Unsupported output format: ${to}`);
      }

      return {
        success: true,
        output,
        processingTime: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Conversion failed",
        processingTime: Date.now() - start,
      };
    }
  }
}
