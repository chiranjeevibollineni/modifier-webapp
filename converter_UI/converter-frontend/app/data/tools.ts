export interface ToolConfig {
  slug: string;
  title: string;
  description: string;
  apiRoute: string; // Maps directly to your production FastAPI endpoint paths
  accentColor: string;
}

export const conversionToolsIndex: ToolConfig[] = [
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF documents into a single optimized file container.",
    apiRoute: "merge-pdf",
    accentColor: "text-red-600 bg-red-50 border-red-100"
  },
  {
    slug: "heic-to-jpg",
    title: "HEIC to JPG",
    description: "Convert iPhone HEIC photos into universal web-ready JPG streams.",
    apiRoute: "heic-to-jpg",
    accentColor: "text-blue-600 bg-blue-50 border-blue-100"
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce document files down to strict target KB thresholds cleanly.",
    apiRoute: "compress-pdf",
    accentColor: "text-emerald-600 bg-emerald-50 border-emerald-100"
  },
  {
    slug: "csv-to-json",
    title: "CSV to JSON",
    description: "Parse tabular spreadsheet rows into structured web data arrays.",
    apiRoute: "csv-to-json",
    accentColor: "text-amber-600 bg-amber-50 border-amber-100"
  },
  {
    slug: "parquet-to-csv",
    title: "Parquet to CSV",
    description: "Convert compressed Apache Parquet binary files into flat CSV data spreadsheets.",
    apiRoute: "parquet-to-csv",
    accentColor: "text-purple-600 bg-purple-50 border-purple-100"
  }
];
