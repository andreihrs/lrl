var fs = require("fs");
const keys = require("./keys");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const perf = require("execution-time")();
const isOnline = require("is-online");
const { PerformanceObserver, performance } = require("perf_hooks");

// const { resolve } = require("path");
// const {
//   workerData: { write, hash },
// } = require("worker_threads");

const { convertArrayToCSV } = require("convert-array-to-csv");
puppeteer.use(StealthPlugin());
var indicate = "starting";
console.log(indicate);

var email = keys.email;
var pass = keys.pass;
var email_count = keys.email_count;
var head = keys.head;

var browser;
var page;
var t0 = performance.now();

var profiles = [];
indicate = "got all keys";
console.log(indicate);
async function lilookup() {
  function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  try {
    indicate = head
      ? "lauching browser headless(No GUI)"
      : "lauching browser normal";
    console.log(indicate);
    browser = await puppeteer.launch({
      headless: head,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--use-fake-ui-for-media-stream",
        "--disable-audio-output",
        "--disable-infobars",
        "--window-position=0,0",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"',
      ],
    });
    page = await browser.newPage();
    console.log("opening Login page");
    await page.goto("https://login.live.com/");

    // Login Start
    console.log("Typing email => " + email);

    await page.type("input#i0116", email, {
      delay: 0,
    });

    await page.click("input#idSIButton9");
    console.log("Waiting for 1 sec");

    await page.waitFor(1000);
    console.log("Typing password => ***********");
    await page.type("input#i0118", pass, {
      delay: 0,
    });
    await page.click("input#idSIButton9");
    await page.waitForSelector("input#idSIButton9");
    // await page.waitFor(5000)
    console.log("Clicking on login button");
    await page.click("input#idSIButton9");

    // await page.waitFor(5000)
    await page.waitForNavigation({
      waitUntil: "networkidle0",
    });
    // await page.click(".sign-in-link");
    console.log("Going to outlook contacts page");
    await page.goto("https://outlook.live.com/people/0/", {
      waitUntil: "load",
      timeout: 0,
    });

    console.log("inside contact list page");
    // await page.waitFor(6000)
    await page.waitForSelector("div._3qxq4FbPD_ovy_o1o8-N4E");
    console.log(
      "selecting first(dummy) contact (make sure this is a dummy contact)"
    );
    await page.click("div._3qxq4FbPD_ovy_o1o8-N4E");

    await page.waitForSelector('button[data-content="LinkedIn"]');
    // await page.waitFor(7000)
    console.log("selecting linkedin tab");
    await page.click('button[data-content="LinkedIn"]');

    await page.waitFor(4000);
    perf.start();
    var i = 1;
    for (i = 1; i <= email_count; i++) {
      console.log("going to " + i + " contact");
      await page.waitFor(5000);
      var isOn = await isOnline();
      if (isOn == false) {
        sleep(180000);
        isOn = await isOnline();
      }

      if (isOn) {
        await page.waitForSelector('i[data-icon-name="Down"]');
        await page.click('i[data-icon-name="Down"]');
        console.log("wait for page load for 2 seconds");

        await page.waitFor(5000);
        var mail = await page.evaluate(async () => {
          email = document.querySelector(
            '[data-log-name="PersonName"]'
          ).innerText;

          return email;
        });
        var Email = mail;
        try {
          await page.setDefaultTimeout(9000);
          await page.waitForSelector('button[data-content="LinkedIn"]');
        } catch (error) {
          // do as you wish with this error and then do your next actions

          try {
            console.log("Helloo from try");
            await page.click('button[class^="ms-Link"]');
          } catch (error) {
            throw new Error(error);
          }
        }
        await page.waitForSelector('button[data-content="LinkedIn"]');
        await page.click('button[data-content="LinkedIn"]', {
          waitUntil: [
            "load",
            "domcontentloaded",
            "networkidle0",
            "networkidle2",
          ],
        });

        await page.waitFor(4000);
        // await page.waitForXPath('//*[@id="app"]/div/div[2]/div/div[2]/div/div[2]/div/div[2]/div/div/div/div/div[2]/section/div[2]/div[2]')
        // await page.waitForXPath('//*[@id="app"]/div/div[2]/div/div[2]/div/div[2]/div/div[2]/div/div/div/div/div[2]/section/div[2]/div')
        console.log("scrapping starts");
        var data = await page.evaluate(async (i) => {
          var items = document.querySelectorAll('[class^="linkedInContainer"]');

          let body = {
            SNo: "",
            Head: "",
            Experience: "",
          };
          //If it isn't "undefined" and it isn't "null", then it exists.
          body.SNo = i;
          if (typeof items != "undefined" && items != null) {
            function itrt(ele) {
              body.Head = ele.textContent;
            }
            document
              .querySelectorAll('[class^="linkedInContainer"]')
              .forEach(itrt);

            function itrt1(ele) {
              body.Experience =
                typeof ele != "undefined" && ele != null
                  ? ele.innerText
                  : "Nothing in Experience";
            }

            document
              .querySelectorAll('[class^="contentContainer"]')
              .forEach(itrt1);
          } else {
            console.log("No linked ac found");
          }

          return body;
        }, i);
        console.log("scrapping ends");

        profiles.push({
          SNo: data.SNo,
          Email: Email,
          Head: data.Head,
          Experience: data.Experience,
        });
        // console.log(data);
        const csvFromArrayOfObjects = convertArrayToCSV(profiles);
        fs.writeFile(
          "FTprofiles8.csv",
          csvFromArrayOfObjects,
          "utf8",
          (err) => {
            if (err) throw err;
            console.log(`saved ${i} contact profile successfully`);
          }
        );
      } else {
        console.log("waiting for network connection");
      }
    }

    console.log(profiles.length);

    const results = perf.stop();
    console.log(results.time); // in milliseconds

    console.log("Successfully sraped liknedin contacts" + i);
    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
  } catch (err) {
    console.log(err);
    await browser.close();
  }
}

lilookup();
