// @ts-check
const fs = require("node:fs");
const child_process = require("node:child_process");
const path = require("node:path");
const base32 = require("hi-base32");
const { AsyncDatabase } = require("promised-sqlite3");
const inputJson = require("./freeotp.json");

let updatedCount = 0;
let newCount = 0;
async function run() {
  const sql = await AsyncDatabase.open("./databases");

  for (const tokenJson of inputJson.tokens) {
    const token = {
      title: inputJson.tokenOrder[inputJson.tokens.indexOf(tokenJson)],
      secret: base32.encode(Buffer.from(tokenJson.secret)).replace(/\=/g, ""),
    };

    try {
      const result = await sql.get(`SELECT secret FROM "accounts" WHERE secret = ('${token.secret}')`);
      if (result?.secret) {
        await sql.run(`UPDATE "main"."accounts" SET (email, original_name) = ('${token.title}','${token.title}') WHERE "secret"='${token.secret}'`);
        updatedCount++
        continue;
      }
      newCount++
      await sql.run(`INSERT INTO "main"."accounts"("_id","email","secret","type","original_name") VALUES (NULL,'${token.title}','${token.secret}',0,"${token.title}");`)
      // await sqlRunPromise();
    } catch (e) {
      console.error("Error running SQL");
      console.error(e);
    }
  }

  console.log(`Updated ${updatedCount} tokens and added ${newCount} new ones`)

  sql.close();
}



run();

