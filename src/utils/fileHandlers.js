import * as XLSX from "xlsx";

export const handleFileRead = (binaryStr, onSuccess, onError) => {
  try {
    const workbook = XLSX.read(binaryStr, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    let jsonData = XLSX.utils.sheet_to_json(sheet);

    if (jsonData.length === 0) {
      onError("The file is empty or invalid.");
      return;
    }

    // Convert boolean values to "true"/"false" strings
    jsonData = jsonData.map((row) =>
      Object.keys(row).reduce((acc, key) => {
        const value = row[key];
        acc[key] = typeof value === "boolean" ? value.toString() : value;
        return acc;
      }, {})
    );

    onSuccess(jsonData, Object.keys(jsonData[0]));
  } catch (err) {
    onError("Failed to parse the file.");
  }
};

export const downloadJson = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
