export const xFactory = () => {

  const xInstance = {
    f: {},
    async p(event, data) {
      const dataObj = typeof data === 'function' ? data : createDataProxy(data);
      return await this.f[event](dataObj)
    },
    async s(event, func) {
      this.f[event] = func
    },
    async x(data) {
      return this.p('x', data)
    },
  }

  const createDataProxy = (data) => {
    const dataProxy = new Proxy(function () { }, {
      get(t, prop) {
        if (prop === 'p') return (...args) => xInstance.p(...args);
        if (prop === 's') return (...args) => xInstance.s(...args);
        if (prop === 'toJSON') return () => data;

        return data[prop];
      },
      set(t, prop, value) {
        data[prop] = value
        return true
      },
      apply(t, thisArg, args) {
        return xInstance.p('x', args[0])
      },
    })
    return dataProxy
  }

  const xProxy = new Proxy(function () { }, {
    get(t, prop) {
      return xInstance[prop]
    },
    apply(t, thisArg, args) {
      return xInstance.p('x', args[0])
    },
  })

  return xProxy
}

export const u = async (x) => {
  if (x.set) return await set(x);
  if (x.get) return await get(x);
  if (x.del) return await del(x);
  if (x.getHtml) return await getHtml(x);
  if (x.signUp) return await signUp(x);
};

const getHtml = async (x) => {
  const { mtimeMs } = await x.b.p('fs', { stat: { path: x.jsFilename } });
  return {
    bin: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body><script type="module" src="/${x.jsFilename}?mtime=${mtimeMs}"></script></body>
</html>
    `,
    isHtml: true,
  };
}

const set = async (x) => {
  const set = { ...x.set, bin: x.bin };

  const { type, id, path, k, ok, v, bin, binName, repoName } = set;
  const b = x.b;

  if (v && v.i) delete v.i;

  const getFromRepo = async (id) => await b({ get: { id, useRepo: true } });

  //CHANGE ORDER
  if (id && ok && typeof ok === 'object') {
    const vById = await getFromRepo(id);
    if (!vById) return { ok: 0, msg: 'v not found' };

    const { from, to } = ok;

    if (vById.m) {
      if (!vById.o) return { ok: 0, msg: 'v.o not found' };

      const i = vById.o.splice(from, 1)[0];
      vById.o.splice(to, 0, i);
    }
    if (vById.l) {
      const i = vById.l.splice(from, 1)[0];
      vById.l.splice(to, 0, i);
    }
    await b.p('repo', { set: { id, v: vById } });

    return { id, ok };
  }

  //SET key and value to id of (MAP) or add value (LIST)
  if (type && id && v) {
    const vById = await getFromRepo(id);
    if (!vById) return { msg: 'v not found' };

    let newId = await b.p('getUniqId');
    if (id.includes('/')) newId = id.split('/')[0] + '/' + newId;

    if (type === 'm' && vById.m) {
      if (vById.m[k]) return { msg: `k [${k}] already exists in vById` };
      if (!vById.o) return { msg: `v.o is not found by [${id}]` };
      if (ok === undefined) return { msg: `ok is empty` };

      vById.m[k] = newId;
      vById.o.splice(ok, 0, k);

      await b.p('repo', { set: { id: newId, v } });
      await b.p('repo', { set: { id, v: vById } });

      return { type, id, k, v, newId };
    }
    if (type === 'l' && vById.l) {
      vById.l.push(newId);

      await b.p('repo', { set: { id: newId, v } });
      await b.p('repo', { set: { id, v: vById } });

      return { type, id, v, newId };
    }

    return { msg: 'Not found logic for change vById', vById };
  }

  //SET binary file and save it's ID to specific varID
  {
    const { id, bin, binName } = set;
    if (id && bin && binName) {
      const vById = await getFromRepo(id);
      if (!vById) return { msg: 'v not found by id', id };
      //todo clear previous binary file;

      let ex = binName.split('.').at(-1);
      let t = '';
      if (
        ex === 'jpg' ||
        ex === 'jpeg' ||
        ex === 'png' ||
        ex === 'gif' ||
        ex === 'webp'
      ) {
        t = 'i';
      }

      const newId = await b.p('getUniqId');
      const v = { b: { id: newId, t } };

      await b.p('repo', { set: { id: newId, v: bin, format: 'raw' } });
      await b.p('repo', { set: { id, v } });

      return { id };
    }
  }

  //SET value by ID
  {
    const { id, v } = set;
    if (id && v) {
      await b.p('repo', { set: { id, v }, repoName });
      return { id, v };
    }
  }

  //COPY or MOVE MAP key from one ID to another ID
  {
    const { oldId, newId, key } = set;

    if (oldId && newId && oldId !== newId && key) {
      const oldV = await getFromRepo(oldId);
      const newV = await getFromRepo(newId);

      if (!oldV || !newV) return { msg: 'oldV or oldV not found' };
      if (!oldV.m || !newV.m) return { msg: 'oldV.m or newV.m not found' };
      if (!oldV.o || !newV.o) return { msg: 'oldV.o or newV.o not found' };

      if (!oldV.m[key]) return { msg: `key [${key}] not found in oldV.m` };
      if (newV.m[key]) return { msg: `newV.m already have key [${key}]` };

      newV.m[key] = oldV.m[key];
      delete oldV.m[key];

      const index = oldV.o.indexOf(key);
      if (index !== -1) oldV.o.splice(index, 1);
      newV.o.push(key);

      await b({ set: { id: oldId, v: prepareForTransfer(oldV) } });
      await b({ set: { id: newId, v: prepareForTransfer(newV) } });
      return { oldId, newId, key };
    }
  }

  //RENAME of key
  {
    const { id, oldK, newK } = set;
    if (id && oldK && newK) {
      const v = await getFromRepo(id);
      if (!v.m || !v.m[oldK]) {
        return { msg: 'v.m or v.m[oldK] not found' };
      }

      v.m[newK] = v.m[oldK];
      delete v.m[oldK];

      if (!v.o) return { msg: 'o not found in map' };
      const ok = v.o.indexOf(oldK);
      if (ok === -1) return { msg: `order key for key [${oldK}] not found` };
      v.o[ok] = newK;

      await b({ set: { id, v } });
      return { id, oldK, newK };
    }
  }

  //SET BY PATH
  {
    const { path, type, v } = set;

    if (path) {
      const setPath = await createSet({ _, b, path, type });
      if (!set) return;

      let data = v;

      for (let i = 0; i < setPath.length; i++) {
        const v = setPath[i];
        const isLast = i === setPath.length - 1;

        if (isLast) {
          if (v.l) {
            // const newId = await b.p('getUniqId');
            // const newV = { _: { id: newId }, v: data };
            // await b({ set: { id: newId, v: newV } });
            // v.l.push(newId);
          } else if (v.v) {
            v.v = data;
          }

          if (!v[_].new) v[_].updated = true;
        }

        if (v[_].new || v[_].updated) {
          await b({ set: { id: v[_].id, v } });
        }
      }

      return setPath.at(-1);
    }
  }
}

const get = async (x) => {
  let { id, subIds, path, depth, getMeta, useRepo, repoName, getAll } = x.get;

  if (getAll) return await x.p('repo', { getAll });
  if (id) {
    //if (useRepo) return await b.p('repo', { get: { id }, repoName });
    return await fillVar({ x, id, subIds: new Set(subIds), depth, getMeta });
  }

  if (path) {
    const _ = await b.p('get_');

    if (!Array.isArray(path) && typeof path === 'string') {
      path = path.split('.');
    }

    const pathSet = await createSet({
      x,
      path,
      getMeta,
      repoName,
      isNeedStopIfVarNotFound: true,
    });
    if (!pathSet) return;

    const v = pathSet.at(-1);
    if (!v) return;

    if (useRepo) return v;

    return await fillVar({ x, v, depth, getMeta });
  }
}

const del = async (x) => {
  const { path, id, k, ok } = x.del;

  //DELETE KEY IN MAP with subVars
  if (id && k) {
    const v = await x({ get: { id, useRepo: true } });
    if (!v) return { msg: 'v not found' };
    if (!v.m && !v.l) return { msg: 'v is not map and not list' };

    const isMap = Boolean(v.m);
    const isList = Boolean(v.l);

    const targetId = isMap ? v.m[k] : k;
    if (!targetId) return { msg: `targetId not found by [${k}]` };

    const targetV = await b.x({ get: { id: targetId, useRepo: true } });
    if (!targetV) return { msg: `targetV not found by [${targetId}]` };
    targetV[_] = { id: targetId };

    if (isMap) {
      if (ok === undefined) return { msg: `oKey is empty` };
      if (!v.o) return { msg: `v.o is not found by [${id}]` };
      if (!v.o[ok]) return { msg: `v.o[oKey] is not found by key [${ok}]` };
    }

    const isDelWithSubVars = await delWithSubVars({ _, b, v: targetV });
    if (isDelWithSubVars || true) {
      if (isMap) {
        delete v.m[k];
        v.o = v.o.filter((currentK) => currentK !== k);
      } else if (isList) {
        v.l = v.l.filter((currentK) => currentK !== k);
      }

      await x({ set: { id, v } });
    }

    return { id, k };
  }

  //DELETE BY ID
  if (id && id !== 'root') return await x.p('repo', { del: { id } });

  //DELETE BY PATH
  if (path) {
    const set = await createSet({ x, path, isNeedStopIfVarNotFound: true });

    if (!set || set.length < 2) return { msg: 'var set not found' };

    const parentV = set.at(-2);
    const v = set.at(-1);
    const k = v[_].name;
    const isMap = Boolean(parentV.m);
    const isList = Boolean(parentV.l);

    const vId = parentV.m[k];
    if (!vId) {
      console.log('log', { msg: `key [${k}] not found in v1` });
      return;
    }

    const isDelWithSubVars = await delWithSubVars({ x, v });
    if (isDelWithSubVars) {
      if (isMap) {
        delete parentV.m[k];
        parentV.o = parentV.o.filter((currentK) => currentK !== k);

        await x({ set: { id: parentV[_].id, v: parentV } });
      } else if (isList) {
        console.log('isList', v);
      }
    }
  }
}

const signUp = async (x) => {
  const { email, password } = x.signUp;
  const { b } = x[x._];
  const _ = await b.p('get_');

  let users = await b({ get: { path: 'users', useRepo: true } });
  if (!users) {
    const root = await b({ get: { id: 'root', useRepo: true } });
    users = await mkvar(b, 'm');

    if (users[_].id) {
      root.m.users = users[_].id;
      root.o.push('users');

      await b({ set: { id: users[_].id, v: users } });
      await b({ set: { id: 'root', v: root } });
    }
  }

  const user = await mkvar(b, 'm');
  user.m.password = password;
  user.o.push('password');

  if (users.m[email]) return { msg: 'user with this email already exists' };

  users.m[email] = user[_].id;

  await b({ set: { id: user[_].id, v: user } });
  await b({ set: { id: users[_].id, v: users } });

  return { email, password };
}

const delWithSubVars = async (x) => {
  const { _, b, v } = x;
  const varIds = await getVarIds({ b, v });

  const len = Object.keys(varIds).length;
  if (len > 50) {
    await b.p('log', { msg: `Try to delete ${len} keys at once` });
    return;
  }

  for (let id of varIds) await b({ del: { id } });
  await b({ del: { id: v[_].id } });

  varIds.push(v[_].id);
  console.log('varIds for del', varIds);

  return true;
}

const createSet = async (x) => {
  const { _, b, path, isNeedStopIfVarNotFound } = x;
  const pathArr = [...path];
  const type = x.type || 'v';

  let v1 = await b.p('repo', { get: { id: 'root' } });
  v1[_] = { id: 'root', name: 'root' };
  if (pathArr[0] === 'root') pathArr.shift();

  let set = [v1];

  for (let i = 0; i < pathArr.length; i++) {
    const name = pathArr[i];
    if (!name) return;

    const v1 = set.at(-1);
    let v2;

    if (!v1.m && !v1.l) {
      console.log(`v1 hasn't m or l prop for getting name [${name}]`);
      return;
    }

    let id = v1.m[name];

    if (id) {
      v2 = await b.p('repo', { get: { id } });
      if (v2) v2[_] = { id };
    }

    if (!v2) {
      if (isNeedStopIfVarNotFound) return;

      const vType = i === pathArr.length - 1 ? type : 'm';
      v2 = await mkvar(b, vType, _);

      v1.m[name] = v2[_].id;
      if (!v1.o) v1.o = [];
      v1.o.push(name);

      if (!v1[_].new) v1[_].updated = true;
    }

    v2[_].name = name;

    set.push(v2);
  }

  return set;
}

const mkvar = async (b, type) => {
  const _ = await b.p('get_');
  const id = await b.p('getUniqId');
  let v = {
    [_]: { id, new: true },
  };

  if (type === 'b') v.b = {};
  else if (type === 'v') v.v = true;
  else if (type === 'm') {
    v.m = {};
    v.o = [];
  } else if (type === 'l') v.l = [];
  else if (type === 'f') v.f = {};
  else if (type === 'x') v.x = {};
  else throw new Error(`Unknown type [${type}]`);

  return v;
}

const it = async (v, cb) => {
  if (v.l) {
    for (let k = 0; k < v.l.length; k++) {
      await cb({ parent: v.l, k, v: v.l[k] });
    }
    return;
  }
  if (v.m) {
    for (let k in v.m) {
      await cb({ parent: v.m, k, v: v.m[k] });
    }
  }
}

const fillVar = async (x) => {
  const { b, id, subIds, getMeta, depth = 0 } = x;
  let { v } = x;

  if (!v && id) {
    v = await b.p('repo', { get: { id } });
    if (!v) {
      console.error(`v not found by id [${id}]`);
      return;
    }
  }
  if (getMeta) v.i = { id, t: getType(v) };

  const isNeedGetVar = Boolean(subIds && v.i && subIds.has(v.i.id));
  if (!isNeedGetVar && depth <= 0) {
    let vMeta = {};
    if (v.m || v.l) {
      if (v.i) {
        vMeta.i = v.i;
        vMeta.i.openable = true;
      }
    } else {
      vMeta = v;
    }
    return vMeta;
  }

  if (v.l || v.m) {
    await it(v, async ({ parent, k, v }) => {
      parent[k] = await fillVar({
        b,
        id: v,
        subIds,
        getMeta,
        depth: depth - 1,
      });
    });
  }

  return v;
}

const getVarIds = async (x) => {
  const { b, v } = x;

  const ids = [];
  if (!v.b && !v.m && !v.l) return ids;

  const getIds = async (v) => {
    if (v.b) {
      if (v.b.id) ids.push(v.b.id);
    } else if (v.m) {
      for (let k in v.m) {
        const id = v.m[k];
        ids.push(id);
        await getIds(await b({ get: { id, useRepo: true } }));
      }
    } else if (v.l) {
      for (let id of v.l) {
        ids.push(id);
        await getIds(await b({ get: { id, useRepo: true } }));
      }
    }
  };

  await getIds(v);

  return ids;
}

export const getType = (v) => {
  if (v.b) return 'b';
  if (v.m) return 'm';
  if (v.l) return 'l';
  if (v.v) return 'v';
  return 'unknown';
};

export const prepareForTransfer = (v) => {
  const d = {}

  if (v.b) d.b = v.b;
  if (v.v) d.v = v.v;
  if (v.m) d.m = v.m;
  if (v.l) d.l = v.l;
  if (v.o) d.o = v.o;
  if (v.f) d.f = v.f;
  if (v.x) d.x = v.x;

  return d
}

export const httpHandler = async (x) => {
  const { b, runtimeCtx, rq, fs } = x
  const ctx = {
    rq,
    headers: rq.headers,
    url: new URL('http://t.c' + rq.url),
    query: {},
    body: {},
  }
  ctx.url.searchParams.forEach((v, k) => (ctx.query[k] = v));

  const r = await httpGetFile({ ctx, fs });
  if (r.file) return httpMkResp({ v: r.file, mime: r.mime, isBin: true });
  if (r.fileNotFound) return httpMkResp({ code: 404, v: 'File not found' });

  const msg = await httpGetBody({ ctx }) ?? {};
  if (msg.err) {
    console.log('if (msg.err)', msg.err);
    return httpMkResp({ v: 'error processing rq' });
  }

  const xHeader = ctx.headers.x;
  if (msg.bin && xHeader) {
    msg = { bin: msg.bin, ...JSON.parse(xHeader) };
  }
  if (Object.keys(msg).length < 1) {
    msg.getHtml = true;
    msg.jsFilename = runtimeCtx.filename;
  }

  msg.b = b;
  const o = await b(msg);
  if (!o) return httpMkResp({ v: 'Default response' });

  if (o.bin && o.isHtml) {
    const { bin, isHtml } = o;
    const mime = isHtml ? 'text/html' : null;
    return httpMkResp({ v: bin, isBin: bin, mime });
  }
  return httpMkResp({ v: o });
};
const httpGetBody = async ({ ctx, limitMb = 12 }) => {
  let limit = limitMb * 1024 * 1024;
  const rq = ctx.rq;
  const readAsJson = ctx.headers['content-type'] === 'application/json';

  if (!rq.on) {
    if (!rq.body) return {};
    // const b = [];
    // let len = 0;
    // for await (const p of rq.body) {
    //   b.push(p);
    //   len += p.length;
    //   if (len > limit) {
    //     return;
    //   }
    // }
    const bin = await rq.arrayBuffer();
    if (readAsJson) return JSON.parse(new TextDecoder('utf-8').decode(bin));
    return { bin };
  }

  return new Promise((resolve, reject) => {
    let b = [];
    let len = 0;

    rq.on('data', (chunk) => {
      len += chunk.length;
      if (len > limit) {
        rq.destroy();
        resolve({ err: `limit reached [${limitMb} mb]` });
        return;
      }
      b.push(chunk);
    });
    rq.on('error', (err) => {
      rq.destroy();
      reject({ err });
    });
    rq.on('end', () => {
      let msg = {};
      if (b.length > 0) msg.bin = Buffer.concat(b);

      //console.log('body parse', b.length)

      if (readAsJson) {
        try {
          msg = JSON.parse(b.toString());
        } catch (e) {
          msg = { err: 'json parse error', data: b.toString() };
        }
      }
      resolve(msg);
    });
  });
};
const httpGetFile = async ({ ctx, fs }) => {
  const query = ctx.query;
  let ext, mime;

  if (!query.bin) {
    const lastPart = ctx.url.pathname.split('/').pop();
    const spl = lastPart.split('.');

    if (spl.length < 2) return {};

    ext = spl.at(-1);
    if (!ext) return {};

    mime = {
      html: 'text/html',
      js: 'text/javascript',
      css: 'text/css',
      map: 'application/json',
    }[ext];
  }

  try {
    return { file: await fs.readFile('.' + ctx.url.pathname), mime };
  } catch (e) {
    if (e.code !== 'ENOENT') console.log('Error of resolve file', e);
    return { fileNotFound: true };
  }
};
const httpMkResp = ({ code = 200, mime, v, isBin }) => {
  const send = (v, typeHeader) => {
    const headers = { 'content-type': typeHeader };
    try {
      return new Response(v, { status: code, headers });
    } catch (e) {
      console.log('err sending response', e);
    }
  };

  if (isBin) return send(v, mime ?? '');
  if (typeof v === 'object') {
    return send(JSON.stringify(v), 'application/json');
  }

  const plain = 'text/plain; charset=utf-8';
  if (typeof v === 'string' || typeof v === 'number') {
    return send(v, mime ?? plain);
  }
  return send('empty resp', plain);
};

export class HttpClient {
  constructor(baseURL = '', headers = {}) {
    this.headers = headers;
    if (baseURL) this.baseURL = baseURL;
  }

  processHeaders(headers, params) {
    if (!headers['Content-Type']) {
      if (params instanceof ArrayBuffer) {
        headers['Content-Type'] = 'application/octet-stream';
      } else {
        headers['Content-Type'] = 'application/json';
      }
    }
  }

  async rq(method, url, params, headers, options = {}) {
    let timeoutId;
    const controller = new AbortController();
    if (options.timeout) {
      timeoutId = setTimeout(() => controller.abort(), options.timeout);
    }

    this.processHeaders(headers, params);

    const fetchParams = { method, headers, signal: controller.signal };

    if (method === 'POST' || method === 'PUT') {
      if (params instanceof ArrayBuffer) {
        fetchParams.body = params;
      } else {
        fetchParams.body = headers['Content-Type'] === 'application/json' ? JSON.stringify(params) : this.strParams(params);
      }
    } else {
      if (Object.keys(params).length) url += '?' + new URLSearchParams(params);
    }

    const response = await fetch(this.baseURL ? this.baseURL + url : url, fetchParams);
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }

    let r = {
      statusCode: response.status,
      headers: response.headers,
    };
    if (options.blob) {
      r.data = await response.blob();
    } else {
      const t = response.headers.get('content-type') ?? '';
      r.data = t.startsWith('application/json')
        ? await response.json()
        : await response.text();
    }
    return r;
  }
  async get(url, params = {}, headers = {}, options = {}) {
    return await this.rq('GET', url, params, headers, options);
  }
  async post(url, params = {}, headers = {}, options = {}) {
    return await this.rq('POST', url, params, headers, options);
  }
  async delete(url, params = {}, headers = {}, options = {}) {
    return await this.rq('DELETE', url, params, headers, options);
  }
  strParams(params) {
    let str = '';
    for (let k in params) str = str + k + '=' + params[k] + '&';
    return str.length ? str.slice(0, -1) : '';
  }
}

export class IndexedDb {
  async open() {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open('varcraft');
      openRequest.onerror = () => {
        reject(openRequest.error);
      };
      openRequest.onsuccess = () => {
        this.db = openRequest.result;
        resolve(this.db);
      };
      openRequest.onupgradeneeded = () => {
        let db = openRequest.result;
        if (!db.objectStoreNames.contains('vars')) {
          db.createObjectStore('vars');
        }
      };
    });
  }

  async set(x) {
    const { id, v } = x;

    return new Promise((resolve, reject) => {
      const t = this.db.transaction('vars', 'readwrite');
      const vars = t.objectStore('vars');

      const rq = vars.put(v, id);
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => reject(rq.error);
    });
  }

  async get(x) {
    const { id } = x;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('vars', 'readonly');
      const vars = transaction.objectStore('vars');

      const rq = vars.get(id);
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => reject(rq.error);
    });
  }

  async del(x) {
    const { id } = x;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('vars', 'readwrite');
      const vars = transaction.objectStore('vars');

      const rq = vars.delete(id);
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => reject(rq.error);
    });
  }
}

class Dom {
  constructor(data) {
    this.data = data || {};

    const { id, type, txt, events, css, addShadowDOM } = this.data;

    const o = document.createElement(type || 'div');
    this.dom = o;

    if (txt) o.innerText = txt;

    const classD = this.data['class'];
    if (classD) {
      o.className = Array.isArray(classD) ? classD.join(' ') : classD;
    }
    if (events) for (let k in events) o.addEventListener(k, events[k]);
    if (css) for (let k in css) o.style[k] = css[k];
  }

  setDOM(dom) {
    this.dom = dom;
  }
  getDOM() {
    return this.dom;
  }
  getId() {
    return this.dom.id;
  }

  on(eventName, callback) {
    this.getDOM().addEventListener(eventName, callback);
  }
  off(eventName, callback) {
    this.getDOM().removeEventListener(eventName, callback);
  }

  setTxt(txt) {
    this.getDOM().innerText = txt;
  }
  getTxt() {
    return this.getDOM().innerText;
  }
  setHtml(txt) {
    this.getDOM().innerHTML = txt;
  }

  setVal(val) {
    this.getDOM().value = val;
  }
  getVal() {
    return this.getDOM().value;
  }

  setAttr(k, v) {
    this.getDOM().setAttribute(k, v);
    return this;
  }
  setCss(x) {
    const o = this.getDOM();
    for (let p in x) {
      o.style[p] = x[p];
    }
  }
  getSizes() {
    return docGetSizes(this.getDOM());
  }
  addClass(className) {
    this.getDOM().classList.add(className);
  }
  removeClass(className) {
    this.getDOM().classList.remove(className);
  }
  attachCSS() {
    const css = new Dom({ type: 'style', txt: this.css });
    this.ins(css);
  }
  attachShadow() {
    this.shadow = this.getDOM().attachShadow({ mode: 'open' });
    return this.shadow;
  }

  ins(DOM) {
    if (this.shadow) {
      this.shadow.appendChild(DOM.getDOM());
      return;
    }
    this.dom.appendChild(DOM.getDOM());
  }
  append(DOM) {
    this.getDOM().append(DOM);
  }
}

const docMk = (x) => {
  const { mkApi, id, tag, txt, html, events, css, attributes } = x;

  if (mkApi) return new Dom(x);

  const o = document.createElement(tag || 'div');
  if (id) o.id = id;
  if (x['class']) o.className = Array.isArray(x['class']) ? x['class'].join(' ') : classD;
  if (txt) o.innerText = txt;
  if (html) o.innerHTML = html;
  if (css) for (let k in css) o.style[k] = css[k];
  if (attributes) for (let k in attributes) o.setAttribute(k, attributes[k]);
  if (events) for (let k in events) o.addEventListener(k, events[k]);

  return o;
};

const docGetSizes = (o) => {
  let sizes = o.getBoundingClientRect();
  let scrollX = window.scrollX;
  let scrollY = window.scrollY;

  return {
    height: sizes.height,
    width: sizes.width,

    top: sizes.top + scrollY,
    bottom: sizes.bottom + scrollY,
    left: sizes.left + scrollX,
    right: sizes.right + scrollX,
    x: sizes.x + scrollX,
    y: sizes.y + scrollY,
  };
};

const frame = {
  setB(b) {
    this.b = b;
  },
  async createStyle() {
    const css = `
    .shadow {
        box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);
    }
    .frame {
        position: absolute;
        overflow: hidden;
    }
    /* this create small glitches when after start and drag window */
    .frame.drag {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none;   /* Chrome/Safari/Opera */
        -khtml-user-select: none;    /* Konqueror */
        -moz-user-select: none;      /* Firefox */
        -ms-user-select: none;       /* Internet Explorer/Edge*/
        user-select: none;
    }
    .frame.drag .topBar {
        cursor: move;
    }
    .frameTitle {
        font-family: 'Roboto', sans-serif;
        font-weight: bold;
        white-space: nowrap;
        padding: 2px 0 2px 5px;
        background: #ededed;
    }
    .resizer {
        position: absolute;
        min-width: 0.8em;
        min-height: 0.8em;
    }
    .resizeTop {
      left: .5em;
      right: .5em;
      top: -.5em;
      cursor: ns-resize;
    }
    .resizeBottom {
        left: 0.5em;
        right: 0.5em;
        bottom: -0.5em;
        cursor: ns-resize;
    }
    .resizeLeft {
      top: .5em;
      bottom: .5em;
      left: -.5em;
      cursor: ew-resize;
    }
    .resizeRight {
      top: .5em;
      bottom: .5em;
      right: -.5em;
      cursor: ew-resize;
    }
    .resizeTopLeft {
      cursor: nwse-resize;
      left: -.5em;
      top: -.5em;
    }
    .resizeTopRight {
      cursor: nesw-resize;
      right: -.5em;
      top: -.5em;
    }
    .resizeBottomLeft {
      cursor: nesw-resize;
      left: -.5em;
      bottom: -.5em;
    }
    .resizeBottomRight {
      cursor: nwse-resize;
      right: -.5em;
      bottom: -.5em;
    }
    .frameContainer {
      padding: 0 5px;
    }
        `;
    return await this.b.p('doc.mk', { type: 'style', txt: css });
  },

  async init() {
    const p = async (event, data) => await this.b.p(event, data);

    this.o = await p('doc.mk', {
      mkApi: true,
      class: ['frame'],
      css: {
        position: 'absolute',
        minWidth: '100px',
        minHeight: '100px',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
        transition: '0.3s',
        overflow: 'hidden',
      },
    });
    this.oShadow = this.o.attachShadow({ mode: 'open' });
    this.oShadow.append(await this.createStyle());

    const topBar = await p('doc.mk', { class: ['topBar'] });
    this.oShadow.append(topBar);

    this.frameTitle = await p('doc.mk', { class: ['frameTitle'], txt: '' });
    topBar.append(this.frameTitle);

    const frameContainer = await p('doc.mk', { class: ['frameContainer'] });
    this.oShadow.append(frameContainer);

    const slot = await p('doc.mk', { type: 'slot' });
    slot.setAttribute('name', 'content');
    frameContainer.append(slot);

    topBar.addEventListener('pointerdown', (e) => this.dragAndDrop(e));

    const resizeTop = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeTop'],
    });
    this.oShadow.append(resizeTop.getDOM());
    resizeTop.on('pointerdown', (e) => this.resizeTop(e, resizeTop));

    const resizeBottom = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeBottom'],
    });
    this.oShadow.append(resizeBottom.getDOM());
    resizeBottom.on('pointerdown', (e) => this.resizeBottom(e, resizeTop));

    const resizeLeft = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeLeft'],
    });
    this.oShadow.append(resizeLeft.getDOM());
    resizeLeft.on('pointerdown', (e) => this.resizeLeft(e));

    const resizeRight = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeRight'],
    });
    this.oShadow.append(resizeRight.getDOM());
    resizeRight.on('pointerdown', (e) => this.resizeRight(e));

    const resizeTopLeft = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeTopLeft'],
    });
    this.oShadow.append(resizeTopLeft.getDOM());
    resizeTopLeft.on('pointerdown', (e) => this.resizeTopLeft(e));

    const resizeTopRight = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeTopRight'],
    });
    this.oShadow.append(resizeTopRight.getDOM());
    resizeTopRight.on('pointerdown', (e) => this.resizeTopRight(e));

    const resizeBottomLeft = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeBottomLeft'],
    });
    this.oShadow.append(resizeBottomLeft.getDOM());
    resizeBottomLeft.on('pointerdown', (e) => this.resizeBottomLeft(e));

    const resizeBottomRight = await p('doc.mk', {
      mkApi: true,
      class: ['resizer', 'resizeBottomRight'],
    });
    this.oShadow.append(resizeBottomRight.getDOM());
    resizeBottomRight.on('pointerdown', (e) => this.resizeBottomRight(e));
  },
  setStyle(o) {
    this.o.setStyle(o);
  },
  setTitle(title) {
    this.frameTitle.innerText = title;
  },
  setContent(content) {
    content.setAttribute('slot', 'content');
    this.o.append(content);
  },
  setEventHandler(cb) {
    this.q.worker = cb;
  },
  setOnPointerup() {
    window.onpointerup = () => {
      window.onpointermove = null;
      this.o.removeClass('noselect');
      window.onpointerup = null;
    };
  },
  dragAndDrop(e) {
    const viewSizes = this.o.getSizes();
    const shift = { x: e.clientX - viewSizes.x, y: e.clientY - viewSizes.y };
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const left = e.clientX - shift.x;
      const top = e.clientY - shift.y;
      this.o.setStyle({
        left: left + 'px',
        top: top + 'px',
      });
      this.q.push({ left });
      this.q.push({ top });
    };
    window.onpointerup = (e) => {
      window.onpointermove = null;
      this.o.removeClass('noselect');
      window.onpointerup = null;
    };
  },
  resizeTop(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const top = e.clientY;
      const height = sizes.bottom - e.clientY;
      this.o.setStyle({
        top: top + 'px',
        height: height + 'px',
      });
      this.q.push({ top });
      this.q.push({ height });
    };
    this.setOnPointerup();
  },
  resizeBottom(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const height = e.clientY - sizes.top;
      this.o.setStyle({ height: height + 'px' });
      this.q.push({ height });
    };
    this.setOnPointerup();
  },
  resizeLeft(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const left = e.clientX;
      const width = sizes.right - e.clientX;
      this.o.setStyle({
        left: left + 'px',
        width: width + 'px',
      });
      this.q.push({ left });
      this.q.push({ width });
    };
    this.setOnPointerup();
  },
  resizeRight(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const width = e.clientX - sizes.left;
      this.o.setStyle({ width: width + 'px' });
      this.q.push({ width });
    };
    this.setOnPointerup();
  },
  resizeTopLeft(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const left = e.clientX;
      const width = sizes.right - e.clientX;

      const top = e.clientY;
      const height = sizes.bottom - e.clientY;

      this.o.setStyle({
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
        height: height + 'px',
      });
      this.q.push({ left });
      this.q.push({ top });
      this.q.push({ width });
      this.q.push({ height });
    };
    this.setOnPointerup();
  },
  resizeTopRight(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const width = e.clientX - sizes.left;
      const top = e.clientY;
      const height = sizes.bottom - e.clientY;

      this.o.setStyle({
        top: top + 'px',
        width: width + 'px',
        height: height + 'px',
      });
      this.q.push({ top });
      this.q.push({ width });
      this.q.push({ height });
    };
    this.setOnPointerup();
  },
  resizeBottomLeft(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const left = e.clientX;
      const width = sizes.right - e.clientX;
      const height = e.clientY - sizes.top;
      this.o.setStyle({
        left: left + 'px',
        width: width + 'px',
        height: height + 'px',
      });
      this.q.push({ left });
      this.q.push({ width });
      this.q.push({ height });
    };
    this.setOnPointerup();
  },
  resizeBottomRight(e) {
    const sizes = this.o.getSizes();
    this.o.addClass('noselect');

    window.onpointermove = (e) => {
      const width = e.clientX - sizes.left;
      const height = e.clientY - sizes.top;
      this.o.setStyle({
        width: width + 'px',
        height: height + 'px',
      });
      this.q.push({ width });
      this.q.push({ height });
    };
    this.setOnPointerup();
  },
};

const runFrontend = async (X) => {

  globalThis.x = X;

  if (!Array.prototype.at) {
    Array.prototype.at = function (i) {
      return i < 0 ? this[this.length + i] : this[i];
    };
  }

  await X.s('getUniqIdForDom', async () => {
    const getRandomLetter = () => {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      return alphabet.charAt(randomIndex);
    };
    const id = await b.p('getUniqId');
    return id.replace(/^[0-9]/, getRandomLetter());
  });
  await X.s('x', async (x) => {
    if (x.repo === 'idb') {
      if (x.set) await idb.set(x.set);
      if (x.get) return await idb.get(x.get);
      return;
    }
    return await x.p('port', x);
  });
  await X.s('port', async (x) => {
    let headers = {};
    // x.set.v instanceof ArrayBuffer
    const { data } = await new HttpClient().post('/', x, headers);
    return data;
  });
  await X.s('doc.mk', async (x) => docMk(x));
  await X.s('doc.on', async (x) => {
    const { o, e, f } = x;
    o.addEventListener(e, f);
  });
  await X.s('doc.get', async (x) => doc.getElementById(x.id));
  await X.s('doc.ins', async (x) => {
    const { o1, o2 } = x;

    let first;
    if (typeof o1 === 'string') {
      first = await b.p('doc.get', { id: o1 });
    } else {
      first = o1;
    }

    let second;
    if (typeof o2 === 'string') {
      second = await b.p('doc.get', { id: o2 });
    } else if (o2 instanceof Node) {
      second = o2;
    } else {
      second = await b.p('doc.mk', o2);
    }

    first.append(second);
  });
  await X.s('doc.mv', async (x) => { });
  await X.s('doc.getSize', async (x) => {
    const { o } = x;
    return getSize(o);
  });
  await X.s('getComplexBlockHtml', async (x) => {
    const { dom } = x;
    let html = ''

    const script = dom.getElementsByClassName('script')[0];
    if (script) html += script.outerHTML;

    return html;
  })
  await X.s('saveDOM', async (x) => {
    const t = x.dom

    if (!t.id) return;
    if (!t.classList.contains('stored')) return;

    const data = { tag: t.tagName }
    if (t.classList.contains('complex-block')) {
      data.html = await X.p('getComplexBlockHtml', { dom: t })
    } else {
      data.html = t.innerHTML
    }

    const attr = {};

    for (let i = 0; i < t.attributes.length; i++) {
      const at = t.attributes[i];
      if (at && at.value.trim()) attr[at.name] = at.value.trim();
    }
    if (Object.keys(attr).length > 0) {
      data.attr = attr
    }
    await X({ set: { id: t.id, v: data } })
  })
  await X.s('renderStoredElements', async (x) => {
    const DOMs = await x({ get: { getAll: {} } })
    if (DOMs) {
      for (let id in DOMs) {
        const { tag, html, txt, attr } = DOMs[id]
        const dom = docMk({ tag, html, txt, attributes: attr })
        x.app.append(dom)

        if (dom.classList.contains('complex-block')) {
          const scriptDOM = dom.getElementsByClassName('script')[0]
          if (scriptDOM) {
            const js = document.createElement('script');
            js.className = 'skipSaving'
            js.innerHTML = scriptDOM.innerText.replace('{{SELF_ID}}', id);
            dom.append(js)
          }
        }
      }
    }
  })

  const idb = new IndexedDb();
  await idb.open();
  const app = await docMk({ id: 'app' });
  document.body.append(app);
  await X.p('renderStoredElements', { app });

  const processAddedNodes = async (target, addedNodes) => {

    for (let node of addedNodes) {
      if (!node.classList) continue;
      if (node.classList.contains('skipSaving')) {
        return false;
      }
      if (node.classList.contains('stored')) {
        await X.p('saveDOM', { dom: node });
      }
    }

    const t = findStored(target);
    if (t) await X.p('saveDOM', { dom: t });
  }
  const processRemovedNodes = async (target, removedNodes) => {

    for (let node of removedNodes) {
      if (node.classList && node.classList.contains('skipSaving')) {
        return false;
      }
    }

    const t = findStored(target);
    if (t) await X.p('saveDOM', { dom: t });
  }

  const findStored = (dom) => {
    let t = dom;
    while (t) {
      if (t.classList && t.classList.contains('stored')) {
        return t;
      }
      t = t.parentNode;
    }
    return null;
  }

  const ob = new MutationObserver(async (mutationList, observer) => {

    for (const mut of mutationList) {
      console.log(mut)
      let t = mut.target;
      if (!t) continue;

      if (mut.addedNodes.length > 0) {
        const result = await processAddedNodes(t, mut.addedNodes);
        if (result === false) return;
        continue;
      }
      if (mut.removedNodes.length > 0) {
        const result = await processRemovedNodes(t, mut.removedNodes);
        if (result === false) return;
        continue;
      }

      t = findStored(t);
      if (!t) continue;

      await X.p('saveDOM', { dom: t });
    }
  });
  ob.observe(app, { attributes: true, attributeOldValue: true, childList: true, subtree: true, characterData: true })

  //const binEditorI = Object.create(binEditor);
  //await binEditor.init();
  //const frameI = Object.create(frame);
  //await frameI.init();
  //frameI.setTitle('Data editor');
  //frameI.setContent(binEditorI.o);
  //app.ins(frameI.o);
  //window.onkeydown = (e) => dataEditor.keydown(e);
};

const runBackend = async (b) => {

  const { promises } = await import('node:fs');
  const fs = promises;

  await b.s('x', async (x) => await u(x));
  await b.s('get_', () => _);
  await b.s('getUniqId', () => crypto.randomUUID());
  await b.s('sh', async (x) => {
    const { spawn, exec } = await import('node:child_process');

    exec(x.cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec err: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    // const cmd = x.cmd.split(' ');
    // const ls = spawn(cmd[0], cmd.slice(1));
    // ls.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    // ls.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    // ls.on('close', (code) => console.log(`exit code ${code}`));
  });
  await b.s('repo', async (x) => {
    const statePath = 'state';

    if (x.set) {
      const { id, v, format = 'json' } = x.set;
      const path = `${statePath}/${id}`;

      return await b.p('fs', { set: { path, v, format } });
    }
    if (x.get) {
      const { id, format = 'json' } = x.get
      const path = `${statePath}/${id}`
      return b.p('fs', { get: { path, format } })
    }
    if (x.getAll) {
      const list = await b.p('fs', { readdir: { path: statePath } });
      const r = {}
      for (let i of list) {
        if (i === '.gitignore') continue;
        r[i] = await b.p('fs', { get: { path: `${statePath}/${i}`, format: 'json' } });
      }
      return r
    }
    if (x.del) {
      const { id } = x.del;
      const path = `${statePath}/${id}`;

      return b.p('fs', { del: { path } });
    }

  });
  await b.s('fs', async (x) => {
    try {
      if (x.set) {
        const { path, v, format } = x.set;

        const data = format === 'json' ? JSON.stringify(v) : v;
        return await fs.writeFile(path, data);
      }
      if (x.get) {
        const { path, format } = x.get;
        const data = await fs.readFile(path);
        return format === 'json' ? JSON.parse(data) : data;
      }
      if (x.del) {
        const { path } = x.del;
        return await fs.unlink(path);
      }
      if (x.stat) {
        const { path } = x.stat;
        return await fs.stat(path);
      }
      if (x.readdir) {
        const { path } = x.readdir;
        return await fs.readdir(path);
      }

    } catch (e) {
      console.log(e);
    }
  });
  await b.s('state.import', async (x) => {
    //await b.p('sh', { cmd: 'unzip state.zip state' });
  });
  await b.s('state.export', async (x) => {
    //await b.p('sh', { cmd: 'zip -vr state.zip state' });
  });
  await b.s('state.validate', async (x) => {
    const list = await fs.readdir('./state');
    const fSet = new Set();
    for (let i of list) {
      if (i === '.gitignore' || i === 'root' || i === 'sys') continue;
      fSet.add(i);
    }
    const v = await b.x({ get: { id: 'root', useRepo: true } });
    const varIds = await getVarIds({ b, v });

    for (let i of varIds) fSet.delete(i);
    console.log('files that not exists in varIds', fSet);
  });

  const e = {
    set: async (arg) => {
      const path = pathToArr(arg[1]);
      if (!path) {
        console.error('path is empty');
        return;
      }

      const v = arg[2];
      if (!v) {
        console.error('data is empty');
        return;
      }
      const type = arg[3];

      return await b({ set: { path, v, type } });
    },
    get: async (arg) => {
      const path = arg[1] ? pathToArr(arg[1]) : [];
      const depth = arg[2] || 1;

      return await b({ get: { path, depth } });
    },
    del: async (arg) => {
      const path = pathToArr(arg[1]);
      if (!path) {
        console.error('path is empty');
        return;
      }

      return b({ del: { path } });
    },
    deploy: async (arg) => {
      const stop = 'pkill -9 node';
      const nodePath = '/root/.nvm/versions/node/v20.8.0/bin/node';
      const fileName = arg[_].ctx.fileName;
      const run = `${nodePath} ${fileName} server.start 80 > output.log 2>&1 &`;
      const c = `ssh root@164.90.232.3 "cd varcraft; git pull; ${stop}; ${run}"`;

      await b.p('sh', { cmd: c });
    },
    'state.import': async (arg) => {
      const path = arg[1];
      return await b.p('state.import', { path: './' + path });
    },
    'state.import': async (arg) => {
      const path = arg[1];
      return await b.p('state.import', { path: './' + path });
    },
    'state.export': async (arg) => await b.p('state.export'),
    'state.validate': async (arg) => await b.p('state.validate'),
    'server.start': async (arg) => {
      const port = arg[1] || 8080
      const server = (await import('node:http')).createServer({ requestTimeout: 30000 })

      server.on('request', async (rq, rs) => {
        rq.on('error', (e) => {
          rq.destroy();
          console.log('request no error', e);
        })

        try {
          const r = await httpHandler({ b, runtimeCtx: arg.ctx, rq, fs });
          const v = new Uint8Array(await r.arrayBuffer());

          rs.writeHead(r.status, Object.fromEntries(r.headers)).end(v);
        } catch (e) {
          const m = 'err in rqHandler';
          console.log(m, e);
          rs.writeHead(503, {
            'content-type': 'text/plain; charset=utf-8',
          }).end(m);
        }
      })
      server.listen(port, () =>
        console.log(`server start on port: [${port}]`),
      )
    },
    test: () => {
      console.log('test command executed');
    },
    listFiles: async () => {
      const list = await fs.readdir('./assets/img');
      let str = '';

      list.forEach((fName) => {
        str += `<li><img src="/assets/img/${fName}" /></li>`
      });
      console.log(str);
    },
  };

  process.on('uncaughtException', (e, origin) => {
    if (e?.code === 'ECONNRESET') {
      console.error(e);
      return;
    }
    if (e.stack) console.log('e.stack', e.stack);

    console.error('UNCAUGHT EXCEPTION', e, e.stack, origin)
    process.exit(1)
  });

  const parseCliArgs = (cliArgs) => {
    const args = {}
    let num = 0

    for (let i = 0; i < cliArgs.length; i++) {
      if (i < 2) continue; //skip node and scriptName args

      let arg = cliArgs[i];
      args[num++] = arg;

      if (arg.includes('=')) {
        let [k, v] = arg.split('=');
        if (!v) {
          args[num] = arg; //start write args from main 0
          continue;
        }
        args[k.trim()] = v.trim()
      } else {
        args['cmd'] = arg
      }
    }
    return args
  }
  const processCliArgs = async () => {
    const args = parseCliArgs([...process.argv])
    args.ctx = { filename: process.argv[1].split('/').at(-1) }

    if (e[args[0]]) {
      console.log((await e[args[0]](args)) ?? '')
    } else {
      console.log('Command not found')
    }
  }

  await processCliArgs()
}

//BACKEND
const run = async () => {
  const ctx = {}
  if (globalThis.Window) ctx.rtName = 'browser'
  else ctx.rtName = 'node'

  const x = xFactory()
  await x.s('getUniqId', () => {
    if (!window.crypto || !window.crypto.randomUUID) {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          const uuid = (Math.random() * 16) | 0,
            v = c == 'x' ? uuid : (uuid & 0x3) | 0x8;
          return uuid.toString(16);
        },
      );
    }
    return crypto.randomUUID();
  });
  ctx.rtName === 'browser' ? await runFrontend(x) : await runBackend(x, ctx);
};

run();
