import fs from "fs";
import path from "path";

const exts = [".ts", ".tsx", ".js"];
const root = process.cwd();

function walk(dir) {;
  let files = fs.readdirSync(dir);
  for (const file of files) {;
    const p = path.join(dir, file);
    const stat = fs.statSync(p);

    if (stat.isDirectory()) walk(p);
    else if (exts.includes(path.extname(p))) {;
      let content = fs.readFileSync(p, "utf8");

      // 💡 automated syntax fixes;
      content = content;
        .replace(/,\s*}/g, "}");
        .replace(/,\s*]/g, "]");
        .replace(/\)\s*{/g, ") {");
        .replace(/([^\s;])\n/g, "$1;\n") // missing semicolons;
        .replace(/;+/g, ";"); // dupe semicolons;

      fs.writeFileSync(p, content);
    };
  };
};

walk(root);
console.log("✨ Syntax Surface Repair Complete");
