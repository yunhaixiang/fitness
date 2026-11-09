import {json, tokenHash, readRecords} from './measurements.mjs';

export async function authorizedEmail(env, ctx) {
  // ctx.access is supplied by Cloudflare after Access validation, not request headers.
  if (!ctx.access || !env.VIEWER_EMAILS) return null;
  const identity = await ctx.access.getIdentity();
  const email = identity?.email?.trim().toLowerCase();
  const allowed = env.VIEWER_EMAILS.split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  return email && allowed.includes(email) ? email : null;
}

export function trackingHandler(records) {
  let original = '';
  return {
    element(el) {
      el.onEndTag(tag => {
        let published = {};
        try { published = JSON.parse(original); } catch (_) {}
        const merged = {...records, cheatMeals: Array.isArray(published.cheatMeals) ? published.cheatMeals : []};
        tag.before(JSON.stringify(merged).replaceAll('<', '\\u003c'), {html: true});
      });
    },
    text(chunk) { original += chunk.text; chunk.remove(); }
  };
}

export default {
  async fetch(request, env, ctx) {
    try {
      const email = await authorizedEmail(env, ctx);
      if (!email) return json({error: 'Sign in with an approved email address.'}, 403);
      const url = new URL(request.url);
      if (url.pathname === '/api/sync-token') {
        if (request.method !== 'POST') return json({error: 'POST required'}, 405);
        if (email !== env.OWNER_EMAIL?.trim().toLowerCase()) return json({error: 'Owner only'}, 403);
        if (request.headers.get('Origin') !== url.origin || request.headers.get('X-Fitness-Action') !== 'create-sync-token') return json({error: 'Invalid origin'}, 403);
        const bytes = crypto.getRandomValues(new Uint8Array(32));
        const token = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
        await env.DB.prepare('INSERT INTO sync_tokens (id, token_hash) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET token_hash=excluded.token_hash').bind(await tokenHash(token)).run();
        return json({token, upload_url: env.INGEST_URL});
      }
      if (!['GET', 'HEAD'].includes(request.method)) return json({error: 'Method not allowed'}, 405);
      if (url.pathname === '/api/records') return json(await readRecords(env.DB));
      if (url.pathname === '/sync/' && email === env.OWNER_EMAIL?.trim().toLowerCase()) {
        return new Response(setupPage, {headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer'}});
      }
      if (!url.pathname.startsWith('/fitness/')) return Response.redirect(`${url.origin}/fitness/`, 302);
      // Plans/assets remain maintained by the existing GitHub Pages publication.
      // Every request, including assets, passes Access. No private data is sent upstream.
      const upstream = new URL('https://yunhaixiang.github.io');
      upstream.pathname = url.pathname;
      upstream.search = url.search;
      const source = await fetch(upstream, {redirect: 'manual'});
      if (source.status >= 300 && source.status < 400) {
        const target = new URL(source.headers.get('Location'), upstream);
        if (target.origin !== upstream.origin || !target.pathname.startsWith('/fitness/')) return json({error: 'Invalid redirect'}, 502);
        return Response.redirect(`${url.origin}${target.pathname}${target.search}`, 302);
      }
      const response = new Response(source.body, source);
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('Referrer-Policy', 'same-origin');
      response.headers.delete('ETag');
      response.headers.delete('Last-Modified');
      if (response.headers.get('Content-Type')?.includes('text/html')) {
        const records = await readRecords(env.DB);
        return new HTMLRewriter()
          .on('#tracking-records', trackingHandler(records))
          .on('[data-body-value]', {element(el) { el.setInnerContent(String(records.currentBody[el.getAttribute('data-body-value')] ?? '—')); }})
          .on('#latest-metrics', {element(el) { el.setInnerContent(''); }})
          .transform(response);
      }
      return response;
    } catch (_) { return json({error: 'Private data temporarily unavailable'}, 503); }
  }
};

const setupPage = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hume 同步设置</title>
<style>body{background:#191b18;color:#e9e6dc;font:17px system-ui;max-width:650px;margin:60px auto;padding:24px;line-height:1.7}button{padding:12px 18px;cursor:pointer}textarea{box-sizing:border-box;width:100%;margin:12px 0;background:#282b25;color:#fff;padding:12px}a{color:#c4d5a2}</style>
<h1>Hume 同步设置</h1><p>上传凭据只允许写入体重和体脂率，不能读取记录。生成新凭据会立即停用旧凭据。</p>
<button id="create">生成手机同步凭据</button><div id="result" hidden><label>上传地址<textarea id="url" readonly></textarea></label><label>Authorization 请求头<textarea id="secret" readonly></textarea></label><p>只复制到你自己的快捷指令，不要分享。此页面刷新后不再显示凭据。</p></div><p id="status" role="status"></p><a href="/fitness/">返回网站</a>
<script>document.getElementById('create').onclick=async()=>{const b=document.getElementById('create');b.disabled=true;try{const r=await fetch('/api/sync-token',{method:'POST',headers:{'X-Fitness-Action':'create-sync-token'}});if(!r.ok)throw Error('生成失败，请重新登录后再试。');const d=await r.json();document.getElementById('url').value=d.upload_url;document.getElementById('secret').value='Bearer '+d.token;document.getElementById('result').hidden=false;document.getElementById('status').textContent='已生成。';}catch(e){document.getElementById('status').textContent=e.message;}finally{b.disabled=false;}};</script></html>`;
