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
  await page.goto("https://shotworks.jp/sw/list/a_01/mj_13/work?sv=", {
    waitUntil: "networkidle0",
  });

  const results = await getResults(page);

  const datas = results.map((result) => {
    let re = /^(\d{1,2}\/\d{1,2})～【(\d{1,2}:\d{1,2})～(\d{1,2}:\d{1,2})/;
    const matched = re.exec(result.workday);
    let companyRE = /[^\s]+/;

    if (matched === null) return result;
    return {
      title: result.title,
      job: result.job,
      salary: result.salary,
      company: companyRE.exec(result.company)[0],
      workday: result.workday,
      date: matched[1],
      startTime: matched[2],
      endTime: matched[3],
    };
  });

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
  await browser.close();
})();

const getResults = async (page) => {
  return await getPageContent(page, []);
};

async function getPageContent(page, results) {
  const newResults = await parseResults(page);
  const nextPageButton = await page.$("#mainColumn > div.next_page > a");
  if (!nextPageButton) {
    return [...results, ...newResults];
  }
  await nextPageButton.click();
  await page.waitForNavigation({ waitUntil: ["load", "networkidle2"] });
  return getPageContent(page, [...results, ...newResults]);
}

const parseResults = async (page) => {
  let results = [];
  const elements = await page.$$("#list > div.workinfo_wrapper");

  for (let element of elements) {
    let workday = await element.$eval(
      "div.workinfo_inner > div.job_sum_wrapper > ul > li.workday",
      (node) => node.innerText.trim()
    );
    let job = await element.$eval(
      "div.workinfo_inner > div.job_sum_wrapper > ul > li.job",
      (node) => node.innerText.trim()
    );
    let salary = await element.$eval(
      "div.workinfo_inner > div.job_sum_wrapper > ul > li.salary",
      (node) => node.innerText.trim()
    );
    let title = await element.$eval("div.catch_copy > div > h2 > a", (node) =>
      node.innerText.trim()
    );
    let company = await element.$eval(
      "div.workinfo_inner > div.com_info > div",
      (node) => node.innerText.trim()
    );

    results.push({
      title,
      job,
      salary,
      workday,
      company,
    });
  }

  return results;
};
