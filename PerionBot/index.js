const pup = require("puppeteer");
const fs = require("fs");
const listClient = async () => {
  const browser = await pup.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://leiloeiros.jucesc.sc.gov.br/site/");
  const lista = await page.evaluate(() => {
    const clientes = document.querySelectorAll("tbody tr .nome");
    const clientesArray = [...clientes];
    const list = clientesArray.map((c) => ({
      nome: c.innerHTML,
    }));
    return list;
  });
  browser.close();
  return lista;
};
const searchClient = async (nomeDesejado) => {
  const browser = await pup.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://leiloeiros.jucesc.sc.gov.br/site/");
  const inputs = await page.$$("tr td input");
  await inputs[1].type(nomeDesejado, { delay: 300 });
  await page.click("tr.row:not(.filtered)", { delay: 200 });
  await page.waitForSelector("iframe.cboxIframe");
  const frameHandle = await page.$("iframe.cboxIframe");
  const frame = await frameHandle.contentFrame();

  const iframeContent = await frame.evaluate(() => {
    const tbodyElement = document.querySelectorAll("tbody tr td");
    const array = [...tbodyElement];
    let array2 = [];
    for (let c = 0; c < 3; c++) {
      array2.push(array[c].innerHTML);
    }
    return array2;
  });
  await browser.close();
  return iframeContent;
};

async function data() {
  const clientes = await listClient();
  for (let index = 0; index < 4; index++) {
    const search = await searchClient(clientes[index].nome);
    const result = search.map((item) => {
      const removeTags = item.replace(/<\/?[^>]+(>|$)/g, "");
      const textFormated = removeTags.trim();
      return textFormated;
    });
    let textSave = result.join("\n");
    if (fs.existsSync("PersonData.txt")) {
      let currentContent = fs.readFileSync("PersonData.txt", "utf-8");
      let newClient = currentContent + "\n" + "\n" + textSave;
  
      fs.writeFileSync("PersonData.txt", newClient, "utf-8");
    }
    else{
        fs.writeFileSync("PersonData.txt", textSave, "utf-8");
    }
   
    
  }
}

data();
