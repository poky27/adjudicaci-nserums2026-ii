// POST /api/no-adjudico
// Body: { candidato, oportunidades_usadas, numero_adjudicacion }
// Registra que un candidato no logró adjudicar (después de 1, 2 o 3 oportunidades).

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { candidato, oportunidades_usadas = 3, numero_adjudicacion } = body;

    if (!candidato || !numero_adjudicacion) {
      return jsonError('missing_fields', 'Faltan candidato o numero_adjudicacion', 400);
    }

    // Check duplicado de candidato
    const candExists = await env.DB
      .prepare('SELECT * FROM adjudicaciones WHERE candidato_rank = ?')
      .bind(candidato.rank)
      .first();
    if (candExists) {
      return jsonError('candidato_already_processed', 'Este candidato ya tiene un registro', 409, candExists);
    }

    const ts = Date.now();
    await env.DB.prepare(`
      INSERT INTO adjudicaciones
      (numero_adjudicacion, candidato_rank, candidato_nombre, candidato_puntaje,
       estado, oportunidades_usadas, timestamp)
      VALUES (?, ?, ?, ?, 'no_adjudico', ?, ?)
    `).bind(
      numero_adjudicacion,
      candidato.rank,
      candidato.apellidos_nombres,
      candidato.puntaje_final ?? 0,
      oportunidades_usadas,
      ts
    ).run();

    return new Response(JSON.stringify({ ok: true, timestamp: ts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return jsonError('server_error', err.message, 500);
  }
}

function jsonError(code, message, status = 400, detail = null) {
  return new Response(JSON.stringify({ error: code, message, detail }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
