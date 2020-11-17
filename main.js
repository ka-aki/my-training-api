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

  const rows = await page.$$("#list > div.workinfo_wrapper");

  var datas = [];
  for (let i = 0; i < rows.length; i++) {
    const categoryJson = await convertElementToJson(
      rows[i],
      "div.workinfo_inner > div.job_sum_wrapper > ul > li.job"
    );
    const salaryJson = await convertElementToJson(
      rows[i],
      "div.workinfo_inner > div.job_sum_wrapper > ul > li.salary"
    );
    const workdayJson = await convertElementToJson(
      rows[i],
      "div.workinfo_inner > div.job_sum_wrapper > ul > li.workday"
    );
    const titleJson = await convertElementToJson(
      rows[i],
      "div.catch_copy > div > h2 > a"
    );
    const companyJson = await convertElementToJson(
      rows[i],
      "div.workinfo_inner > div.com_info > div"
    );

    let data = {
      index: i + 1,
      title: titleJson.trim(),
      company: companyJson.trim(),
      category: categoryJson,
      salary: salaryJson,
      workday: workdayJson,
    };
    datas.push(data);
  }

  const propertyNames = Object.getOwnPropertyNames(datas[0]);
  const columns = {};
  for (let name of propertyNames) {
    columns[name] = name;
  }

  const csvString = stringify(datas, {
    header: true,
    columns,
    quoted_string: true,
  });
  try {
    fs.writeFileSync("./main.csv", csvString);
    console.log("🎉 output complete!");
  } catch (error) {
    console.log("エラー：", error);
  }
})();

const convertElementToJson = async (listItem, selector) => {
  const el = await listItem.$(selector);
  const value = await el.getProperty("textContent");
  return await value.jsonValue();
};
