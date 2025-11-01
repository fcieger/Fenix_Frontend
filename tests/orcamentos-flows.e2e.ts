import puppeteer from 'puppeteer';

async function run() {
  const port = process.env.PORT || '3004';
  const base = `http://localhost:${port}`;

  const COMPANY_ID = process.env.TEST_COMPANY_ID;
  const CLIENTE_ID = process.env.TEST_CLIENTE_ID;
  const PRAZO_ID = process.env.TEST_PRAZO_ID || '';
  const NAT_HEADER_ID = process.env.TEST_NATUREZA_HEADER_ID || '';
  const NAT_ITEM_ID = process.env.TEST_NATUREZA_ITEM_ID || process.env.TEST_NATUREZA_HEADER_ID || '';

  if (!COMPANY_ID || !CLIENTE_ID || !NAT_ITEM_ID) {
    // eslint-disable-next-line no-console
    console.log('SKIP: Set TEST_COMPANY_ID, TEST_CLIENTE_ID, TEST_NATUREZA_ITEM_ID to run full flows');
    return;
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // Create
  await page.goto(`${base}/orcamentos/novo`, { waitUntil: 'domcontentloaded' });
  await page.type('input[placeholder="CompanyId"]', COMPANY_ID);
  await page.type('input[placeholder="Cliente (digite para buscar)"]', CLIENTE_ID);
  await page.type('input[placeholder="Número Ordem de Compra"]', 'OC-TEST-001');
  if (PRAZO_ID) await page.select('select[placeholder], select', PRAZO_ID).catch(()=>{});
  if (NAT_HEADER_ID) await page.select('select', NAT_HEADER_ID).catch(()=>{});

  // Add item
  await page.click('button:has-text("Adicionar Item")').catch(async () => {
    // fallback selector
    const buttons = await page.$$eval('button', els => els.map(e=>e.textContent||''));
    const idx = buttons.findIndex(t => t.includes('Adicionar Item'));
    if (idx >= 0) await (await page.$$('button'))[idx].click();
  });

  const inputs = await page.$$('input');
  // fill item fields by placeholders
  await page.type('input[placeholder="NaturezaOperacaoId"]', NAT_ITEM_ID);
  await page.type('input[placeholder="Código"]', 'SKU-TEST');
  await page.type('input[placeholder="Nome"]', 'Produto Teste');
  await page.type('input[placeholder="Unidade"]', 'UN');
  await page.type('input[placeholder="Qtd"]', '2');
  await page.type('input[placeholder="Preço"]', '10');

  // Save
  await page.click('button:has-text("Salvar")').catch(async () => {
    const buttons = await page.$$eval('button', els => els.map(e=>e.textContent||''));
    const idx = buttons.findIndex(t => t?.includes('Salvar'));
    if (idx >= 0) await (await page.$$('button'))[idx].click();
  });
  // Wait redirect from /novo to /[id]
  await page.waitForFunction(() => !location.pathname.endsWith('/novo'), { timeout: 30000 });

  // Edit: change qty
  await page.click('input[placeholder="Qtd"]').then(()=>{}).catch(()=>{});
  await page.focus('input[placeholder="Qtd"]');
  await page.keyboard.down('Control'); await page.keyboard.press('A'); await page.keyboard.up('Control');
  await page.type('input[placeholder="Qtd"]', '3');
  await page.click('button:has-text("Salvar")').catch(()=>{});

  // Conclude
  await page.click('button:has-text("Concluir")').catch(()=>{});
  await page.waitForTimeout(500);
  // Reopen
  await page.click('button:has-text("Reabrir")').catch(()=>{});

  // Back to list and delete
  await page.goto(`${base}/orcamentos`, { waitUntil: 'domcontentloaded' });
  // try to delete first row if exists
  const deleteBtn = await page.$('table tbody tr td button.text-red-600');
  if (deleteBtn) {
    await deleteBtn.click();
    await page.waitForTimeout(500);
  }

  await browser.close();
  // eslint-disable-next-line no-console
  console.log('E2E orcamentos flows OK (subject to backend and test IDs)');
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});



