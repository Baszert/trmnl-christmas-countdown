// Builds preview/index.html: an interactive preview of all four view sizes on
// OG, X and a color screen, with controls for date, language, mode and counter.
// Usage: node preview/build.mjs [path to a package.json next to node_modules/liquidjs]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(process.argv[2] || path.join(root, 'preview', 'package.json'));
const { Liquid } = require('liquidjs');
const engine = new Liquid();
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const shared = read('shared.liquid');
const settings = read('settings.yml');
const options = (key) => {
  const block = settings.split('- keyname: ' + key)[1];
  return JSON.parse(block.match(/options: (\[.*\])/)[1].replace(/'/g, '"'));
};

const ctx = {
  trmnl: {
    system: { timestamp_utc: Math.floor(Date.now() / 1000) },
    user: { utc_offset: 7200, locale: 'nl' },
    plugin_settings: { instance_name: 'Kerst', custom_fields_values: { language: 'auto', mode: 'combined', counter: 'days', colors: 'auto', test_date: '' } }
  }
};
const views = {};
for (const v of ['full', 'half_horizontal', 'half_vertical', 'quadrant']) {
  views[v] = await engine.parseAndRender(shared + '\n' + read(v + '.liquid'), ctx);
}

const sharedHtml = await engine.parseAndRender(shared, ctx);
const sel = (id, opts) => `<label>${id}<select id="${id}" autocomplete="off">${opts.map((o) => `<option>${o}</option>`).join('')}</select></label>`;
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>ASCII Kerst preview</title>
<link rel="stylesheet" href="https://trmnl.com/css/latest/plugins.css">
<script src="https://trmnl.com/js/latest/plugins.js"></script>
<style>
  body { background: #777; margin: 12px; font: 13px system-ui, sans-serif; }
  #controls { position: sticky; top: 0; z-index: 9; background: #333; color: #fff; padding: 8px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; border-radius: 6px; }
  #controls label { display: flex; gap: 4px; align-items: center; }
  #stage { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; align-items: flex-start; }
  figure { margin: 0; } figcaption { color: #fff; margin-bottom: 4px; }
  .screen { outline: 1px solid #000; }
</style></head>
<body class="trmnl">
<div id="controls">
  <label>date<input id="date" type="date" autocomplete="off"></label>
  <button id="prev">&lt; day</button><button id="next">day &gt;</button>
  ${sel('device', ['TRMNL OG (1-bit)', 'TRMNL OG V2 (2-bit)', 'TRMNL X (4-bit)', 'Color (Spectra 6)'])}
  ${sel('language', options('language'))}
  ${sel('mode', options('mode'))}
  ${sel('counter', options('counter'))}
  ${sel('colors', options('colors'))}
  <label><input id="portrait" type="checkbox">portrait</label>
  <label>zoom<input id="zoom" type="range" min="0.3" max="1" step="0.05" value="0.6"></label>
</div>
<div id="stage"></div>
${sharedHtml}
<script>
  var VIEWS = ${JSON.stringify(views).replace(/<\//g, "<\\/")};
  var DEVICES = {
    'TRMNL OG (1-bit)': 'screen--og screen--1bit screen--md',
    'TRMNL OG V2 (2-bit)': 'screen--ogv2 screen--2bit screen--md',
    'TRMNL X (4-bit)': 'screen--v2 screen--4bit screen--lg',
    'Color (Spectra 6)': 'screen--inky_impression_7_3 screen--1bit screen--color-6a screen--md'
  };
  var MASHUP = { full: null, half_horizontal: ['mashup--1Tx1B', 2], half_vertical: ['mashup--1Lx1R', 2], quadrant: ['mashup--2x2', 4] };
  var $ = function (id) { return document.getElementById(id); };
  var q = new URLSearchParams(location.search);
  // Applied on load, after the browser has restored old form values, so the URL wins.
  function applyQuery() {
    $('date').value = q.get('date') || new Date().toISOString().slice(0, 10);
    ['device', 'language', 'mode', 'counter', 'colors'].forEach(function (k) { if (q.get(k)) $(k).value = q.get(k); });
    if (q.get('zoom')) $('zoom').value = q.get('zoom');
    $('portrait').checked = !!q.get('portrait');
  }

  function draw() {
    var stage = $('stage'); stage.innerHTML = '';
    stage.style.zoom = $('zoom').value;
    Object.keys(VIEWS).forEach(function (v) {
      var view = '<div class="view view--' + v + '">' + VIEWS[v] + '</div>', m = MASHUP[v], inner = view;
      if (m) inner = '<div class="mashup ' + m[0] + '">' + view + new Array(m[1]).join('<div class="view view--' + v + '"><div class="layout"><span class="label">other plugin</span></div></div>') + '</div>';
      var fig = document.createElement('figure');
      fig.innerHTML = '<figcaption>' + v + '</figcaption><div class="screen ' + DEVICES[$('device').value] + ($('portrait').checked ? ' screen--portrait' : '') + '">' + inner + '</div>';
      stage.appendChild(fig);
    });
    document.querySelectorAll('.xmas').forEach(function (el) {
      el.dataset.test = $('date').value;
      el.dataset.lang = $('language').value.toLowerCase();
      el.dataset.mode = $('mode').value.toLowerCase();
      el.dataset.counter = $('counter').value.toLowerCase();
      el.dataset.colors = $('colors').value.toLowerCase();
    });
    window.XMAS_ASCII_RUN();
  }
  function shift(n) { var d = new Date($('date').value + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); $('date').value = d.toISOString().slice(0, 10); draw(); }
  $('prev').onclick = function () { shift(-1); }; $('next').onclick = function () { shift(1); };
  document.querySelectorAll('#controls select, #controls input').forEach(function (e) { e.addEventListener('change', draw); e.addEventListener('input', function () { if (e.id === 'zoom') $('stage').style.zoom = e.value; }); });
  window.addEventListener('load', function () { applyQuery(); draw(); });
</script>
</body></html>`;
fs.writeFileSync(path.join(root, 'preview', 'index.html'), html);
console.log('wrote preview/index.html');
