import express from "express";
import cors from "cors";
import dns from "dns/promises";
import getSslCertificate from "get-ssl-certificate";

const app = express();
app.use(cors());
app.use(express.json());

// Configure DNS resolvers with increased timeout
const createResolver = (server) => {
  const resolver = new dns.Resolver({
    timeout: 10000,
    tries: 3,
  });
  resolver.setServers([server]);
  return resolver;
};

const internalResolver = createResolver("4.2.2.1");
const externalResolver = createResolver("8.8.8.8");

// Helper function to format DNS records
const formatRecord = (name, ttl, type, value) => ({
  name: name.endsWith(".") ? name : `${name}.`,
  ttl: String(ttl),
  class: "IN",
  type,
  value: String(value),
});

const resolveDNSRecord = async (resolver, fqdn, type) => {
  try {
    let records = [];
    switch (type) {
      case "A":
        const aRecords = await resolver.resolve4(fqdn);
        records = aRecords.map((ip) => formatRecord(fqdn, 300, "A", ip));
        break;

      case "AAAA":
        const aaaaRecords = await resolver.resolve6(fqdn);
        records = aaaaRecords.map((ip) => formatRecord(fqdn, 300, "AAAA", ip));
        break;

      case "MX":
        const mxRecords = await resolver.resolveMx(fqdn);
        records = mxRecords.map(({ priority, exchange }) =>
          formatRecord(fqdn, 300, "MX", `${priority} ${exchange}`)
        );
        break;

      case "TXT":
        const txtRecords = await resolver.resolveTxt(fqdn);
        records = txtRecords.map((txtArray) =>
          formatRecord(fqdn, 300, "TXT", `"${txtArray.join(" ")}"`)
        );
        break;

      case "NS":
        const nsRecords = await resolver.resolveNs(fqdn);
        records = nsRecords.map((ns) => formatRecord(fqdn, 300, "NS", ns));
        break;

      case "CNAME":
        try {
          const cnameRecords = await resolver.resolveCname(fqdn);
          records = cnameRecords.map((cname) =>
            formatRecord(fqdn, 300, "CNAME", cname)
          );
        } catch (e) {
          records = [];
        }
        break;

      case "SOA":
        try {
          const soaRecord = await resolver.resolveSoa(fqdn);
          if (soaRecord) {
            records = [
              formatRecord(
                fqdn,
                300,
                "SOA",
                `${soaRecord.nsname} ${soaRecord.hostmaster} ${soaRecord.serial} ${soaRecord.refresh} ${soaRecord.retry} ${soaRecord.expire} ${soaRecord.minttl}`
              ),
            ];
          }
        } catch (e) {
          records = [];
        }
        break;
    }
    return records;
  } catch (error) {
    console.error(`Error resolving ${type} record for ${fqdn}:`, error);
    return [];
  }
};

const generateStats = (fqdn, server) => {
  const id = Math.floor(Math.random() * 65535);
  return [
    formatRecord(";", "<<>>", "DiG", `<<>> +stats @${server} ${fqdn}`),
    formatRecord(";;", "->>HEADER<<-", "QUERY,", `status: NOERROR, id: ${id}`),
    formatRecord(
      ";;",
      "flags:",
      "rd",
      "ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1"
    ),
    formatRecord(";", "EDNS:", "0,", "flags:; udp: 512"),
    formatRecord(";;", "Query", "time:", "5"),
    formatRecord(";;", "WHEN:", "Mon", "Dec"),
    formatRecord(";;", "MSG", "SIZE", "rcvd:"),
  ];
};

const resolveAllRecords = async (resolver, fqdn, server) => {
  const recordTypes = ["SOA", "NS", "MX", "AAAA", "CNAME", "A", "TXT"];
  const results = {};

  await Promise.all(
    recordTypes.map(async (type) => {
      try {
        results[type] = await resolveDNSRecord(resolver, fqdn, type);
      } catch (err) {
        console.error(`Failed to resolve ${type} records:`, err);
        results[type] = [];
      }
    })
  );

  results.Stats = generateStats(fqdn, server);
  return results;
};

app.post("/resolve", async (req, res) => {
  const { fqdn } = req.body;

  if (!fqdn || !/^[a-zA-Z0-9.-]+$/.test(fqdn)) {
    return res.status(400).json({ error: "Invalid or missing FQDN" });
  }

  try {
    const [internalResults, externalResults] = await Promise.all([
      resolveAllRecords(internalResolver, fqdn, "192.168.1.1"),
      resolveAllRecords(externalResolver, fqdn, "8.8.8.8"),
    ]);

    res.json({
      internal: internalResults,
      external: externalResults,
    });
  } catch (err) {
    console.error("Error resolving DNS:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.get("/getCertificate", async (req, res) => {
  const domain = req.query.domain;

  if (!domain || !/^[a-zA-Z0-9.-]+$/.test(domain)) {
    return res.status(400).json({ error: "Invalid or missing domain" });
  }

  try {
    const cert = await getSslCertificate.get(domain);
    const sans = cert.subjectaltname
      ? cert.subjectaltname
          .split(", ")
          .map((san) => san.replace("DNS:", "").trim())
      : [];

    res.json({
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      serialNumber: cert.serialNumber,
      pemEncoded: cert.pemEncoded,
      sans, // Include SANs in the response
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error fetching certificate", details: error.message });
  }
});

app.listen(5005, () => console.log("Server running on port 5005"));
