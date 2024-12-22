import axios from "axios";

export const resolveFqdn = async (fqdn) => {
  try {
    const response = await axios.post("http://localhost:5005/resolve", {
      fqdn,
    });
    return response.data;
  } catch (error) {
    console.error("Error resolving FQDN:", error);
    return {
      error: "Failed to resolve the FQDN. Please try again.",
    };
  }
};