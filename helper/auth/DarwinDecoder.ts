interface DarwinDecodedType {
  email: string;
  timestamp: number;
  hash: string;
  Uid: string;
  employee_no: string;
  company_name: string;
  firstname: string;
  lastname: string;
  office_location_city: string;
  office_location_pincode: string;
  token: string;
}

export async function decoderDarwin(encoded_payload: string): Promise<DarwinDecodedType | null> {
  try {
    const deciphXOR = require("base64-xor");
    const decodedURI = decodeURIComponent(encoded_payload);
    const decodedbase64_1 = Buffer.from(decodedURI, "base64");
    const keyXOR = "666666";

    const decoded = deciphXOR.decode(keyXOR, decodedbase64_1);
    const decodedbase64_2 = Buffer.from(decoded, "base64").toString("utf8");

    try {
      return JSON.parse(decodedbase64_2);
    } catch (jsonError) {
      console.error("JSON parsing failed:", (jsonError as Error).message);
      return null; // or return { error: "Invalid JSON" };
    }
  } catch (error) {
    console.error("Decoding failed:", (error as Error).message);
    return null; // or return { error: "Payload decoding failed" };
  }
}
