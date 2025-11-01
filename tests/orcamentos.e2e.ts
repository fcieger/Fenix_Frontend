import puppeteer from 'puppeteer';

async function run() {
  const port = process.env.PORT || '3004';
  const base = `http://localhost:${port}`;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(`${base}/orcamentos`, { waitUntil: 'domcontentloaded' });
  const title = await page.$eval('h1', el => el.textContent || '');
  if (!title.toLowerCase().includes('orçamento')) throw new Error('Página de Orçamentos não carregou');
  await page.goto(`${base}/orcamentos/novo`, { waitUntil: 'domcontentloaded' });
  const hasCompany = await page.$('input[placeholder="CompanyId"]');
  if (!hasCompany) throw new Error('Formulário de orçamento não abriu');
  await browser.close();
  // eslint-disable-next-line no-console
  console.log('E2E orcamentos OK');
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});



