const puppeteer = require("puppeteer-core");
const fs = require("fs");
const stringify = require("csv-stringify/lib/sync");

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    defaultViewport: null,
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://shotworks.jp/sw/list/a_01/mj_13/work?sv=");

  const rows = await page.$$(
    "#list > div > div.workinfo_inner > div.job_sum_wrapper > ul"
  );

  var datas = [];
  for (let i = 0; i < rows.length; i++) {
    const category = await rows[i].$("li.job");
    const categoryValue = await category.getProperty("textContent");
    const categoryJson = await categoryValue.jsonValue();

    const salary = await rows[i].$("li.salary");
    const salaryValue = await salary.getProperty("textContent");
    const salaryJson = await salaryValue.jsonValue();

    const workday = await rows[i].$("li.workday");
    const workdayValue = await workday.getProperty("textContent");
    const workdayJson = await workdayValue.jsonValue();

    let data = {
      category: categoryJson,
      salary: salaryJson,
      workday: workdayJson,
    };
    datas.push(data);
  }
  console.log(datas, "datas");
})();
