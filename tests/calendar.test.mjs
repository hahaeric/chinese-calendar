import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'calendar.html'), 'utf8');

function makeEl() {
  return {
    style: { display: 'none' },
    classList: {
      _set: new Set(),
      add(c) { this._set.add(c); },
      remove(c) { this._set.delete(c); },
      toggle(c, on) {
        if (on === true) this._set.add(c);
        else if (on === false) this._set.delete(c);
        else if (this._set.has(c)) this._set.delete(c);
        else this._set.add(c);
      },
      contains(c) { return this._set.has(c); },
    },
    textContent: '',
    innerHTML: '',
    value: '1',
    dataset: {},
    disabled: false,
    onchange: null,
    querySelectorAll() { return []; },
    querySelector() { return makeEl(); },
    addEventListener() {},
    setAttribute() {},
    getAttribute() { return null; },
    contains() { return false; },
    closest() { return null; },
    getBoundingClientRect() {
      return { top: 40, left: 40, bottom: 80, right: 120, width: 80, height: 40 };
    },
  };
}

function loadCalendarContext() {
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
  assert.ok(scriptMatch, 'calendar.html should contain a main script block');
  let code = scriptMatch[1];
  // 避免测试时拉天气、绑真实定时器副作用过大：保留函数，跳过自动 init
  code = code.replace(/\(function init\(\)[\s\S]*?\}\)\(\);\s*$/, '');

  const els = new Map();
  const document = {
    getElementById(id) {
      if (!els.has(id)) els.set(id, makeEl());
      return els.get(id);
    },
    querySelector() {
      return makeEl();
    },
  };

  const context = {
    console,
    Date,
    Math,
    JSON,
    parseInt,
    String,
    Array,
    Object,
    Number,
    Boolean,
    Set,
    Map,
    Promise,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    requestAnimationFrame(fn) { fn(); },
    document,
    window: {
      innerWidth: 1280,
      innerHeight: 800,
      addEventListener() {},
    },
    localStorage: {
      _data: Object.create(null),
      getItem(k) { return this._data[k] ?? null; },
      setItem(k, v) { this._data[k] = String(v); },
      removeItem(k) { delete this._data[k]; },
    },
    navigator: {},
    fetch() {
      return Promise.reject(new Error('fetch disabled in tests'));
    },
    alert() {},
  };
  context.globalThis = context;
  context.window.document = document;

  vm.runInNewContext(code, context, { timeout: 5000 });
  return context;
}

describe('calendar.html structure', () => {
  it('exposes youbi style switcher and four modes', () => {
    assert.match(html, /data-youbi-style="badge"/);
    for (const style of ['badge', 'strip', 'primary', 'bar']) {
      assert.match(html, new RegExp(`data-style="${style}"`));
    }
  });

  it('includes hou tip UI for poem rotation', () => {
    assert.match(html, /id="houTip"/);
    assert.match(html, /HOU_POEM_ROTATE_MS = 8000/);
    assert.match(html, /HOU_POEM_TARGET = 10/);
    assert.match(html, /点击可换下一句/);
  });

  it('does not auto-request geolocation on weather init', () => {
    assert.match(html, /function initWeather\(\)[\s\S]*?loadWeatherForCoords\(getWeatherCoords\(\)/);
    assert.doesNotMatch(
      html,
      /function initWeather\(\)[\s\S]*?getCurrentPosition/
    );
    assert.match(html, /onclick="locateWeather\(\)"/);
  });
});

describe('calendar runtime helpers', () => {
  const ctx = loadCalendarContext();

  it('maps weekdays to youbi 月火水木金土日 (Monday-first)', () => {
    // 2026-11-16 Mon → 0, 19 Thu → 3, 22 Sun → 6
    assert.equal(ctx.getYoubiIndex(2026, 10, 16), 0);
    assert.equal(ctx.getYoubiIndex(2026, 10, 19), 3);
    assert.equal(ctx.getYoubiIndex(2026, 10, 22), 6);

    assert.match(ctx.buildDayCellHtml(2026, 10, 16, '', {}), /data-youbi="月"/);
    assert.match(ctx.buildDayCellHtml(2026, 10, 19, '', {}), /data-youbi="木"/);
    assert.match(ctx.buildDayCellHtml(2026, 10, 22, '', {}), /data-youbi="日"/);
  });

  it('returns up to 10 poems per hou with hou poems first', () => {
    const info = ctx.getHouInfo(2026, 10, 19); // 立冬三候附近
    assert.equal(info.poems.length, 10);
    assert.ok(info.poems.some((p) => p.rel === 'hou'));
    assert.equal(info.poems[0].rel, 'hou');
    assert.match(info.name, /./);
  });

  it('getHouInfo for 2026-11-19 includes tip fields and poems', () => {
    const info = ctx.getHouInfo(2026, 10, 19);
    assert.match(info.title, /立冬/);
    assert.ok(info.detail);
    assert.equal(info.poems.length, 10);
  });

  it('getWeatherCoords uses default city without geolocation', () => {
    const coords = ctx.getWeatherCoords();
    assert.equal(coords.name, '长春');
    assert.equal(coords.lat, '43.88');
    assert.equal(coords.lon, '125.35');
  });

  it('buildDayCellHtml embeds youbi and hou area data', () => {
    const htmlCell = ctx.buildDayCellHtml(2026, 10, 19, ' today', {});
    assert.match(htmlCell, /data-youbi="木"/);
    assert.match(htmlCell, /day-hou-area/);
    assert.match(htmlCell, /data-term-index=/);
    assert.match(htmlCell, /data-hou-index=/);
  });
});
