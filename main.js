const puppeteer = require("puppeteer-core");
const fs = require("fs");
const stringify = require("csv-stringify/lib/sync");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    defaultViewport: null,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto("https://shotworks.jp/sw/list/a_01/mj_13/work?sv=");

  const rows = await page.$$(
    "#list > div > div.workinfo_inner > div.job_sum_wrapper > ul"
  );

  var datas = [];
  for (let i = 0; i < rows.length; i++) {
    const categoryJson = await convertElementToJson(rows[i], "li.job");
    const salaryJson = await convertElementToJson(rows[i], "li.salary");
    const workdayJson = await convertElementToJson(rows[i], "li.workday");

    let data = {
      category: categoryJson,
      salary: salaryJson,
      workday: workdayJson,
    };
    datas.push(data);
  }
  console.log(datas, "datas");
})();

async function convertElementToJson(listItem, selector) {
  const el = await listItem.$(selector);
  const elValue = await el.getProperty("textContent");
  return await elValue.jsonValue();
}
