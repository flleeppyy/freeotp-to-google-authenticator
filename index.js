// @ts-check
const path = require("node:path");
const base32 = require("hi-base32");
const { AsyncDatabase } = require("promised-sqlite3");
const inputJson = require("./freeotp.json");

let tokensCount = 0;

async function run() {
  const sql = await AsyncDatabase.open("./databases");
  await sql.run(`DELETE FROM "main"."accounts"`);
  for (const tokenJson of inputJson.tokens) {
    const token = {
      title: inputJson.tokenOrder[inputJson.tokens.indexOf(tokenJson)],
      secret: base32.encode(Buffer.from(tokenJson.secret)).replace(/\=/g, ""),
    };

    try {
      tokensCount++
      await sql.run(`INSERT INTO "main"."accounts"("_id","email","secret","type","original_name") VALUES (NULL,'${token.title}','${token.secret}',0,"${token.title}");`)
    } catch (e) {
      console.error("Error running SQL");
      console.error(e);
    }
  }

  console.log(`Cleared tokens in database and added ${tokensCount} new ones.`)
  sql.close();
}

run();
