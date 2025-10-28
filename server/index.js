import express from "express";
import cors from "cors";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

app.post("/run", async (req, res) => {
  const { language, code, input } = req.body;

  const codesDir = path.join(__dirname, "codes");
  if (!fs.existsSync(codesDir)) fs.mkdirSync(codesDir, { recursive: true });

  const codeFile = path.join(
    codesDir,
    `temp.${language === "cpp" ? "cpp" : "py"}`
  );
  const inputFile = path.join(codesDir, "input.txt");

  // Write files
  fs.writeFileSync(codeFile, code);
  fs.writeFileSync(inputFile, input || "");

  let command = "";

  if (language === "cpp") {
    const outputFile = path.join(codesDir, "a.out");

   
    command = `g++ "${codeFile}" -o "${outputFile}" && "${outputFile}" < "${inputFile}"`;
  } else if (language === "python") {
    command = `python "${codeFile}" < "${inputFile}"`;
  } else {
    return res.status(400).json({ error: "Unsupported language" });
  }

  exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
    if (error) {
      return res.json({ error: stderr || error.message });
    }
    res.json({ stdout, stderr });
  });
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
