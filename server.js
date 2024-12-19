import express from "express";
import { exec } from "child_process";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/resolve", (req, res) => {
  const { fqdn } = req.body;

  if (!fqdn) {
    return res.status(400).json({ error: "FQDN is required" });
  }

  // Commands for Internal and External DNS lookups
  const internalCommands = {
    A: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} A`,
    AAAA: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} AAAA`,
    MX: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} MX`,
    TXT: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} TXT`,
    NS: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} NS`,
    CNAME: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} CNAME`,
    SOA: `dig +nocmd +noall +answer @192.168.1.1 ${fqdn} SOA`,
    Stats: `dig +stats @192.168.1.1 ${fqdn}`,
  };

  const externalCommands = {
    A: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} A`,
    AAAA: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} AAAA`,
    MX: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} MX`,
    TXT: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} TXT`,
    NS: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} NS`,
    CNAME: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} CNAME`,
    SOA: `dig +nocmd +noall +answer @8.8.8.8 ${fqdn} SOA`,
    Stats: `dig +stats @8.8.8.8 ${fqdn}`,
  };

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
