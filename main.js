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

  const results = await getResults(30, page);
  debugger;
  console.log(results, "results");
})();

const getResults = async (number, page) => {
  let results = [];
  do {
    let new_results = await parseResults(page);

    results = [...results, ...new_results];

    //numberがちょうど30件あったら、次へボタンを押す必要はないため
    if (results.length < number) {
      let nextPageButton = await page.$("#mainColumn > div.next_page > a");

      if (nextPageButton) {
        await nextPageButton.click();
        await page.waitForNavigation({ waitUntil: "networkidle0" });
      } else {
        break;
      }
    }
  } while (results.length < number);

  return results.slice(0, number);
};

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
      workday,
      job,
      salary,
      title,
      company,
    });
  }

  return results;
};
