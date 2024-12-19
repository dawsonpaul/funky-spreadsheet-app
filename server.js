import express from "express";
import { exec } from "child_process";
import cors from "cors";
import shellEscape from "shell-escape";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/resolve", (req, res) => {
  const { fqdn } = req.body;

  if (!fqdn || !/^[a-zA-Z0-9.-]+$/.test(fqdn)) {
    return res.status(400).json({ error: "Invalid or missing FQDN" });
  }

  // Generate dig commands dynamically with escaped arguments
  const generateCommands = (dnsServer) => ({
    A: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "A"]),
    AAAA: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "AAAA"]),
    MX: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "MX"]),
    TXT: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "TXT"]),
    NS: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "NS"]),
    CNAME: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "CNAME"]),
    SOA: shellEscape(["dig", "+nocmd", "+noall", "+answer", `@${dnsServer}`, fqdn, "SOA"]),
    Stats: shellEscape(["dig", "+stats", `@${dnsServer}`, fqdn]),
  });

  const internalCommands = generateCommands("192.168.1.1");
  const externalCommands = generateCommands("8.8.8.8");

  const parseDigOutput = (output) => {
    if (!output) return [];
    return output
      .split("\n")
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          return {
            name: parts[0],
            ttl: parts[1],
            class: parts[2],
            type: parts[3],
            value: parts.slice(4).join(" "),
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  const runCommand = (cmd, key) =>
    new Promise((resolve) => {
      exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error running command for ${key}:`, stderr || err.message);
          resolve({ key, error: `Failed to resolve ${key}: ${stderr || err.message}` });
        } else {
          resolve({ key, data: parseDigOutput(stdout) });
        }
      });
    });

  const resolveDns = (commands) =>
    Promise.all(
      Object.entries(commands).map(([key, cmd]) => runCommand(cmd, key))
    ).then((responses) => {
      const results = {};
      responses.forEach(({ key, data, error }) => {
        results[key] = error ? { error } : data;
      });
      return results;
    });

  // Run both internal and external DNS resolutions
  Promise.all([resolveDns(internalCommands), resolveDns(externalCommands)])
    .then(([internalResults, externalResults]) => {
      res.json({ internal: internalResults, external: externalResults });
    })
    .catch((err) => {
      console.error("Error resolving DNS:", err.message);
      res.status(500).json({ error: "Internal server error", details: err.message });
    });
});

app.listen(5005, () => console.log("Server running on port 5005"));
