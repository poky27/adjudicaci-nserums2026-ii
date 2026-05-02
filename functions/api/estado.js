// GET /api/estado
// Devuelve todas las adjudicaciones nuevas (#651+) y plazas tomadas desde D1
// El frontend hace polling cada 3 segundos a este endpoint.

export async function onRequestGet({ env }) {
  try {
    const [adjsRes, plazasRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM adjudicaciones ORDER BY numero_adjudicacion ASC').all(),
      env.DB.prepare('SELECT * FROM plazas_tomadas').all(),
    ]);

    const plazas_tomadas = {};
    for (const p of plazasRes.results || []) {
      plazas_tomadas[String(p.plaza_index)] = {
        adjudicado_por: p.adjudicado_por,
        candidato_rank: p.candidato_rank,
        numero_adjudicacion: p.numero_adjudicacion,
        timestamp: p.timestamp,
      };
    }

    return new Response(JSON.stringify({
      adjudicaciones: adjsRes.results || [],
      plazas_tomadas,
      server_time: Date.now(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
