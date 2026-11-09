import {measurement, json, tokenHash, saveSQL, dailySteps, saveStepsSQL} from './measurements.mjs';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/measurements') return json({error: 'Not found'}, 404);
    if (request.method !== 'POST') return json({error: 'POST required'}, 405);
    const token = request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_-]{43})$/)?.[1];
    if (!token) return json({error: 'Unauthorized'}, 401);
    try {
      const authorized = await env.DB.prepare('SELECT id FROM sync_tokens WHERE id = 1 AND token_hash = ?').bind(await tokenHash(token)).first();
      if (!authorized) return json({error: 'Unauthorized'}, 401);
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return json({error: 'JSON required'}, 415);
      // Bound streaming bodies as well as Content-Length; do not trust the header.
      const reader = request.body?.getReader();
      if (!reader) return json({error: 'Empty body'}, 400);
      const chunks = []; let size = 0;
      while (true) {
        const {value, done} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 2048) { await reader.cancel(); return json({error: 'Payload too large'}, 413); }
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      let row, steps;
      try { const input = JSON.parse(new TextDecoder().decode(bytes)); row = measurement(input); steps = dailySteps(input); }
      catch (error) { return json({error: error.message}, 400); }
      const bodyStatement = env.DB.prepare(saveSQL).bind(row.date, row.weight, row.bf, row.measuredAt, row.bodyFatMeasuredAt);
      if (!steps) {
        const saved = await bodyStatement.run();
        return json({ok: true, date: row.date, saved: saved.meta.changes > 0});
      }
      const [saved, stepsSaved] = await env.DB.batch([bodyStatement, env.DB.prepare(saveStepsSQL).bind(steps.date, steps.steps, steps.collectedAt)]);
      return json({ok: true, date: row.date, saved: saved.meta.changes > 0, steps_date: steps.date, steps_saved: stepsSaved.meta.changes > 0});
    } catch (_) {
      // Never log the request, bearer token, or health values.
      return json({error: 'Sync temporarily unavailable'}, 503);
    }
  }
};
