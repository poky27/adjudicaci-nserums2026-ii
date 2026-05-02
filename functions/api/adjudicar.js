// POST /api/adjudicar
// Body: { candidato: {rank, apellidos_nombres, puntaje_final}, plaza: {index, ...}, oportunidades_usadas, numero_adjudicacion }
// Registra una adjudicación atómica con guard contra race conditions.

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { candidato, plaza, oportunidades_usadas = 1, numero_adjudicacion } = body;

    if (!candidato || !plaza || !numero_adjudicacion) {
      return jsonError('missing_fields', 'Faltan candidato, plaza o numero_adjudicacion', 400);
    }

    // Race condition check 1: ¿plaza ya tomada?
    const plazaExists = await env.DB
      .prepare('SELECT * FROM plazas_tomadas WHERE plaza_index = ?')
      .bind(plaza.index)
      .first();
    if (plazaExists) {
      return jsonError('plaza_taken', 'Esta plaza acaba de ser adjudicada por otro usuario', 409, plazaExists);
    }

    // Race condition check 2: ¿candidato ya procesado?
    const candExists = await env.DB
      .prepare('SELECT * FROM adjudicaciones WHERE candidato_rank = ?')
      .bind(candidato.rank)
      .first();
    if (candExists) {
      return jsonError('candidato_already_processed', 'Este candidato ya tiene una adjudicación registrada', 409, candExists);
    }

    // Race condition check 3: ¿numero_adjudicacion duplicado?
    const numExists = await env.DB
      .prepare('SELECT * FROM adjudicaciones WHERE numero_adjudicacion = ?')
      .bind(numero_adjudicacion)
      .first();
    if (numExists) {
      return jsonError('numero_duplicado', 'Ya existe una adjudicación con ese número', 409, numExists);
    }

    const ts = Date.now();

    // Insert atómico (D1 batch)
    await env.DB.batch([
      env.DB.prepare(`
        INSERT INTO adjudicaciones
        (numero_adjudicacion, candidato_rank, candidato_nombre, candidato_puntaje,
         estado, diresa, institucion, provincia, distrito, establecimiento,
         grado_dificultad, categoria, codigo_renipress, plaza_index,
         oportunidades_usadas, timestamp)
        VALUES (?, ?, ?, ?, 'adjudicado', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        numero_adjudicacion,
        candidato.rank,
        candidato.apellidos_nombres,
        candidato.puntaje_final ?? 0,
        plaza.diresa || '',
        plaza.institucion || '',
        plaza.provincia || '',
        plaza.distrito || '',
        plaza.nombre_establecimiento || '',
        plaza.grado_dificultad || '',
        plaza.categoria || '',
        plaza.codigo_renipress || '',
        plaza.index,
        oportunidades_usadas,
        ts
      ),
      env.DB.prepare(`
        INSERT INTO plazas_tomadas
        (plaza_index, adjudicado_por, candidato_rank, numero_adjudicacion, timestamp)
        VALUES (?, ?, ?, ?, ?)
      `).bind(
        plaza.index,
        candidato.apellidos_nombres,
        candidato.rank,
        numero_adjudicacion,
        ts
      ),
    ]);

    return new Response(JSON.stringify({
      ok: true,
      numero_adjudicacion,
      timestamp: ts,
    }), { headers: { 'Content-Type': 'application/json' } });
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
