import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function getValidSupabaseUrl(): string {
  const envUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/^["']|["']$/g, '');
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }
  return 'https://vndgeizmqworbwwgyihl.supabase.co';
}

function getValidSupabaseKey(): string {
  const envKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (envKey.length > 20) {
    return envKey;
  }
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZGdlaXptcXdvcmJ3d2d5aWhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjkwMDI4NSwiZXhwIjoyMDYyNDc2Mjg1fQ.7qft-9dAVnKcJqcMV7scLCAk7C5sJCsyl0dc76_w4ls';
}

const SUPABASE_URL = getValidSupabaseUrl();
const SUPABASE_SERVICE_ROLE_KEY = getValidSupabaseKey();

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

app.use(express.json());

// Helper to format Date & Time nicely
function formatDataHora(isoOrString: string | null | undefined): {
  iso: string;
  formatted: string;
} {
  if (!isoOrString) {
    const now = new Date();
    return {
      iso: now.toISOString(),
      formatted: `${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }

  try {
    const d = new Date(isoOrString);
    if (isNaN(d.getTime())) {
      return { iso: isoOrString, formatted: isoOrString };
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return {
      iso: d.toISOString(),
      formatted: `${day}/${month}/${year} · ${hours}:${minutes}`,
    };
  } catch {
    return { iso: isoOrString, formatted: isoOrString };
  }
}

// 1. Health check & Supabase connection test
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const { count, error } = await supabase
      .from('movimentacao')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({
        status: 'error',
        connected: false,
        message: error.message,
      });
    }

    return res.json({
      status: 'ok',
      connected: true,
      provider: 'Supabase',
      totalRecords: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      connected: false,
      message: err.message || 'Falha ao conectar no Supabase',
    });
  }
});

// 2. Fetch dispatches from Supabase
app.get('/api/dispatches', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Number(req.query.offset) || 0;
    const motorista = req.query.motorista as string | undefined;
    const placa = req.query.placa as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    let query = supabase
      .from('view_carregamento_expedicao')
      .select('*', { count: 'exact' })
      .order('movimentacao_id', { ascending: false })
      .range(offset, offset + limit - 1);

    if (motorista && motorista !== 'Todos os Motoristas' && motorista !== 'todos') {
      query = query.ilike('motorista', `%${motorista.trim()}%`);
    }

    if (placa) {
      query = query.ilike('placa', `%${placa.trim()}%`);
    }

    if (startDate) {
      query = query.gte('data_criacao', startDate);
    }
    if (endDate) {
      query = query.lte('data_criacao', endDate);
    }

    const { data: viewData, count, error } = await query;

    if (error) {
      console.error('Supabase view_carregamento_expedicao query error:', error);
      return res.status(500).json({ error: error.message });
    }

    const ids = (viewData || []).map((row: any) => row.movimentacao_id);

    // Fetch related products and movement details in parallel
    let produtosMap: Record<number, any[]> = {};
    let movMap: Record<number, any> = {};

    if (ids.length > 0) {
      const [prodRes, movRes] = await Promise.all([
        supabase.from('produtos').select('*').in('id_item', ids),
        supabase.from('movimentacao').select('id, destino, data_entrada, nota_fiscal1, numero_lacre').in('id', ids),
      ]);

      if (prodRes.data) {
        prodRes.data.forEach((p: any) => {
          if (!produtosMap[p.id_item]) produtosMap[p.id_item] = [];
          produtosMap[p.id_item].push(p);
        });
      }

      if (movRes.data) {
        movRes.data.forEach((m: any) => {
          movMap[m.id] = m;
        });
      }
    }

    // Transform into frontend domain model
    const dispatches = (viewData || []).map((row: any) => {
      const movDetail = movMap[row.movimentacao_id] || {};
      const produtosList = produtosMap[row.movimentacao_id] || [];

      const dt = formatDataHora(movDetail.data_entrada || row.data_criacao);

      const nfList = Array.isArray(movDetail.nota_fiscal1)
        ? movDetail.nota_fiscal1.map((n: any) => `NF-e ${n}`).join(', ')
        : movDetail.nota_fiscal1
        ? `NF-e ${movDetail.nota_fiscal1}`
        : 'NF-e Emitida';

      const lacreList = Array.isArray(movDetail.numero_lacre)
        ? movDetail.numero_lacre.map((l: any) => `#${l}`).join(', ')
        : movDetail.numero_lacre
        ? `#${movDetail.numero_lacre}`
        : 'Sem lacre';

      const mappedItens = produtosList.map((p: any, idx: number) => ({
        id: `prod-${p.id || idx}`,
        sku: p.lote ? `LOTE-${p.lote}` : `SKU-${idx + 1}`,
        descricao: p.produto || 'Item de Carga',
        categoria: p.produto?.toLowerCase().includes('gás') || p.produto?.toLowerCase().includes('gota')
          ? 'Bebidas & Águas'
          : p.produto?.toLowerCase().includes('tyffany') || p.produto?.toLowerCase().includes('lt')
          ? 'Embalagens & Garrafões'
          : 'Geral',
        paletes: Number(p.qtd_Plt) || 0,
        pacotes: Number(p.qtd_pct) || 0,
        unidades: Number(p.somatotalproduto) || 0,
        pesoKg: (Number(p.somatotalproduto) || 0) * 1.5,
        notaFiscal: nfList,
        destinatario: movDetail.destino ? `Destino ${movDetail.destino}` : 'Centro de Distribuição',
        cidadeUf: 'Logística Regional / BR',
      }));

      const totalPaletes = Number(row.total_plt) || 0;
      const totalPacotes = Number(row.total_pct) || 0;
      const totalUnidades = Number(row.total_unidades) || 0;

      return {
        id: row.movimentacao_id,
        formattedId: row.movimentacao_id.toLocaleString('pt-BR'),
        motorista: (row.motorista || 'Não Informado').trim(),
        placa: (row.placa || '---').trim().toUpperCase(),
        dataHora: dt.iso,
        dataHoraFormatada: dt.formatted,
        totalPaletes,
        totalPacotes,
        totalUnidades,
        pesoTotalKg: totalUnidades * 1.5,
        status: 'concluido',
        doca: movDetail.destino ? `Doca ${movDetail.destino}` : 'Doca Operacional',
        conferente: 'Alexandre Vieira',
        transportadora: `Transportes ${((row.motorista || 'Express').trim())}`,
        itens: mappedItens,
        numeroLacre: lacreList,
      };
    });

    return res.json({
      data: dispatches,
      totalCount: count ?? dispatches.length,
    });
  } catch (err: any) {
    console.error('API /api/dispatches failure:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Cache of distinct products from view_saldo_produto_loteatualizado
let cachedAllProducts: string[] = [];
let lastProductsFetchTime = 0;

async function getAllDistinctProducts(): Promise<string[]> {
  const now = Date.now();
  if (cachedAllProducts.length > 0 && now - lastProductsFetchTime < 60000) {
    return cachedAllProducts;
  }
  try {
    const [p1, p2, p3] = await Promise.all([
      supabase.from('view_saldo_produto_loteatualizado').select('produto').range(0, 999),
      supabase.from('view_saldo_produto_loteatualizado').select('produto').range(1000, 1999),
      supabase.from('view_saldo_produto_loteatualizado').select('produto').range(2000, 2999),
    ]);
    const all = [...(p1.data || []), ...(p2.data || []), ...(p3.data || [])];
    const unique = Array.from(new Set(all.map((r: any) => (r.produto || '').trim()).filter(Boolean))).sort();
    if (unique.length > 0) {
      cachedAllProducts = unique;
      lastProductsFetchTime = now;
    }
    return cachedAllProducts;
  } catch (err) {
    return cachedAllProducts;
  }
}

// 2.1 Fetch real-time stock balance by lot from view_saldo_produto_loteatualizado
app.get(['/api/inventory', '/api/saldo-estoque'], async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 2500, 3000);
    const offset = Number(req.query.offset) || 0;
    const search = (req.query.search as string || '').trim().toLowerCase();
    const produto = (req.query.produto as string || '').trim();
    const ano = (req.query.ano as string || '').trim();
    const somenteComSaldo = req.query.somenteComSaldo === 'true';

    let query = supabase
      .from('view_saldo_produto_loteatualizado')
      .select('*', { count: 'exact' });

    if (produto && produto !== 'todos' && produto !== 'Todos os Produtos') {
      query = query.eq('produto', produto);
    }

    if (ano && ano !== 'todos' && ano !== 'Todos os Anos') {
      query = query.eq('ano', ano);
    }

    if (somenteComSaldo) {
      query = query.gt('saldo', 0);
    }

    // Supabase / PostgREST limits single queries to 1000 rows.
    // Fetch in parallel chunks to retrieve the entire view (1995+ rows)
    let rows: any[] = [];
    let totalExactCount = 0;

    const applyFilters = (q: any) => {
      if (produto && produto !== 'todos' && produto !== 'Todos os Produtos') q = q.eq('produto', produto);
      if (ano && ano !== 'todos' && ano !== 'Todos os Anos') q = q.eq('ano', ano);
      if (somenteComSaldo) q = q.gt('saldo', 0);
      return q.order('produto', { ascending: true }).order('ano', { ascending: false }).order('lote', { ascending: true });
    };

    const [res1, res2, res3] = await Promise.all([
      applyFilters(supabase.from('view_saldo_produto_loteatualizado').select('*', { count: 'exact' }).range(0, 999)),
      applyFilters(supabase.from('view_saldo_produto_loteatualizado').select('*').range(1000, 1999)),
      applyFilters(supabase.from('view_saldo_produto_loteatualizado').select('*').range(2000, 2999)),
    ]);

    if (res1.error) throw res1.error;
    rows = [...(res1.data || []), ...(res2.data || []), ...(res3.data || [])];
    totalExactCount = res1.count ?? rows.length;

    // Retrieve full list of all 28 products across entire database
    const allProducts = await getAllDistinctProducts();



    // Apply in-memory search if requested (handles partial substring on produto or lote)
    let filteredRows = rows;
    if (search) {
      filteredRows = rows.filter((r: any) =>
        (r.produto && r.produto.toLowerCase().includes(search)) ||
        (r.lote && r.lote.toString().toLowerCase().includes(search)) ||
        (r.ano && r.ano.toString().includes(search))
      );
    }

    // Compute summary statistics
    const summary = filteredRows.reduce(
      (acc: any, r: any) => {
        acc.totalPaletes += Number(r.total_qtd_plt) || 0;
        acc.totalPacotes += Number(r.total_qtd_pct) || 0;
        acc.totalProduzido += Number(r.total_produzido) || 0;
        acc.totalSaida += Number(r.total_saida) || 0;
        acc.totalSaldo += Number(r.saldo) || 0;
        acc.totalLotes += 1;
        return acc;
      },
      {
        totalPaletes: 0,
        totalPacotes: 0,
        totalProduzido: 0,
        totalSaida: 0,
        totalSaldo: 0,
        totalLotes: 0,
      }
    );

    return res.json({
      success: true,
      data: filteredRows,
      allProducts,
      totalCount: totalExactCount || filteredRows.length,
      summary,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('API /api/inventory exception:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. Create a new dispatch directly in Supabase
app.post('/api/dispatches', async (req: Request, res: Response) => {
  try {
    const {
      motorista,
      placa,
      doca,
      itens,
    } = req.body;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    // 1. Insert into movimentacao
    const { data: movData, error: movError } = await supabase
      .from('movimentacao')
      .insert({
        motosrista: motorista || 'Motorista',
        placa: placa || 'BRA2E19',
        hora_Inicio: timeStr,
        hora_final: timeStr,
        destino: doca?.replace('Doca ', '') || 'D01',
        data_entrada: now.toISOString(),
        created_at: now.toISOString(),
        nota_fiscal1: [Math.floor(550000 + Math.random() * 1000)],
        numero_lacre: [Math.floor(1725000 + Math.random() * 1000)],
      })
      .select()
      .single();

    if (movError) {
      console.error('Failed to insert into movimentacao:', movError);
      return res.status(500).json({ error: movError.message });
    }

    const newMovId = movData.id;

    // 2. Insert items into produtos
    if (Array.isArray(itens) && itens.length > 0) {
      const produtosToInsert = itens.map((item: any, idx: number) => ({
        id_item: newMovId,
        produto: item.descricao || 'Item de Carga',
        lote: Number(item.sku?.replace(/\D/g, '')) || Math.floor(100 + Math.random() * 900),
        qtd_Plt: Number(item.paletes) || 0,
        qtd_pct: Number(item.pacotes) || 0,
        somatotalproduto: Number(item.unidades) || 0,
        created_at: now.toISOString(),
      }));

      const { error: prodError } = await supabase.from('produtos').insert(produtosToInsert);
      if (prodError) {
        console.warn('Warning: error inserting items into produtos:', prodError);
      }
    }

    // Fetch the newly created record with its products
    const { data: fullRecord, error: fetchError } = await supabase
      .from('movimentacao')
      .select('id, motosrista, placa, hora_Inicio, hora_final, destino, created_at, data_entrada, nota_fiscal1, numero_lacre, produtos(*)')
      .eq('id', newMovId)
      .single();

    if (fetchError || !fullRecord) {
      return res.json({ success: true, id: newMovId });
    }

    const dt = formatDataHora(fullRecord.data_entrada);
    const prodList = fullRecord.produtos || [];
    const totalPaletes = prodList.reduce((sum: number, p: any) => sum + (Number(p.qtd_Plt) || 0), 0);
    const totalPacotes = prodList.reduce((sum: number, p: any) => sum + (Number(p.qtd_pct) || 0), 0);
    const totalUnidades = prodList.reduce((sum: number, p: any) => sum + (Number(p.somatotalproduto) || 0), 0);

    return res.status(201).json({
      success: true,
      dispatch: {
        id: fullRecord.id,
        formattedId: fullRecord.id.toLocaleString('pt-BR'),
        motorista: fullRecord.motosrista?.trim(),
        placa: fullRecord.placa?.trim().toUpperCase(),
        dataHora: dt.iso,
        dataHoraFormatada: dt.formatted,
        totalPaletes,
        totalPacotes,
        totalUnidades,
        pesoTotalKg: totalUnidades * 1.5,
        status: 'concluido',
        doca: fullRecord.destino ? `Doca ${fullRecord.destino}` : 'Doca 01',
        conferente: 'Alexandre Vieira',
        transportadora: `Transportes ${fullRecord.motosrista?.trim()}`,
        itens: prodList.map((p: any, idx: number) => ({
          id: `prod-${p.id || idx}`,
          sku: `LOTE-${p.lote || idx}`,
          descricao: p.produto,
          categoria: 'Bebidas & Alimentos',
          paletes: Number(p.qtd_Plt) || 0,
          pacotes: Number(p.qtd_pct) || 0,
          unidades: Number(p.somatotalproduto) || 0,
          pesoKg: (Number(p.somatotalproduto) || 0) * 1.5,
          notaFiscal: `NF-e ${fullRecord.nota_fiscal1?.[0] || '001'}`,
          destinatario: 'Centro de Distribuição',
          cidadeUf: 'Logística Regional / BR',
        })),
      },
    });
  } catch (err: any) {
    console.error('Failed to create dispatch:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Configure Vite integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Logistics Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
