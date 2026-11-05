// Tests del middleware anti-IDOR. Corren con el runner nativo de Node
// (`node --test`), sin dependencias extra.
//
// Se pre-carga require.cache con un cliente de Supabase falso ANTES de pedir
// el middleware, para que no toque la base de datos real.

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

// ---- doble de Supabase ----------------------------------------------------
// Imita solo la cadena que usa el middleware: from().select().eq().maybeSingle()
let respuesta = { data: null, error: null };
let consultas = [];

const supabaseFalso = {
    from(tabla) {
        const q = { tabla };
        consultas.push(q);
        const api = {
            select(cols) { q.cols = cols; return api; },
            eq(col, val) { q.filtros = [...(q.filtros || []), [col, val]]; return api; },
            async maybeSingle() { return respuesta; },
        };
        return api;
    },
};

const rutaConfig = require.resolve(path.join(__dirname, '..', 'config', 'supabase.js'));
require.cache[rutaConfig] = { id: rutaConfig, filename: rutaConfig, loaded: true, exports: supabaseFalso };

const {
    exigirUsuarioPropio,
    exigirPropiedadFila,
    exigirPropiedadViaProyecto,
} = require('../middlewares/ownership.middleware');

// ---- helpers --------------------------------------------------------------
const hacerRes = () => {
    const res = { codigo: null, cuerpo: null };
    res.status = (c) => { res.codigo = c; return res; };
    res.json = (b) => { res.cuerpo = b; return res; };
    return res;
};

const usuario = (id, rol) => ({ id, profile: { roles: { nombre: rol } } });

// Ejecuta el middleware y devuelve si llamo a next() y que respondio.
const correr = async (mw, req) => {
    const res = hacerRes();
    let paso = false;
    let errorPasado = null;
    await mw(req, res, (err) => { if (err) errorPasado = err; else paso = true; });
    return { paso, res, errorPasado };
};

test.beforeEach(() => { respuesta = { data: null, error: null }; consultas = []; });

// ===========================================================================
// Caso A: el parametro ES el id del usuario
// ===========================================================================
test('exigirUsuarioPropio permite al dueno', async () => {
    const mw = exigirUsuarioPropio('idUsuario');
    const { paso } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { idUsuario: 'u-1' } });
    assert.strictEqual(paso, true);
});

test('exigirUsuarioPropio BLOQUEA el id de otro usuario (IDOR)', async () => {
    const mw = exigirUsuarioPropio('idUsuario');
    const { paso, res } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { idUsuario: 'u-2' } });
    assert.strictEqual(paso, false, 'no debe dejar pasar');
    assert.strictEqual(res.codigo, 403);
});

test('exigirUsuarioPropio deja pasar al admin sobre cualquier usuario', async () => {
    const mw = exigirUsuarioPropio('idUsuario');
    const { paso } = await correr(mw, { user: usuario('admin-1', 'Admin'), params: { idUsuario: 'u-9' } });
    assert.strictEqual(paso, true, 'el rol admin se normaliza y pasa');
});

test('exigirUsuarioPropio responde 401 sin usuario autenticado', async () => {
    const mw = exigirUsuarioPropio('idUsuario');
    const { paso, res } = await correr(mw, { params: { idUsuario: 'u-1' } });
    assert.strictEqual(paso, false);
    assert.strictEqual(res.codigo, 401);
});

test('exigirUsuarioPropio compara como texto (id numerico vs string)', async () => {
    const mw = exigirUsuarioPropio('idUsuario');
    const { paso } = await correr(mw, { user: usuario(7, 'estudiante'), params: { idUsuario: '7' } });
    assert.strictEqual(paso, true, '7 y "7" son el mismo usuario');
});

// ===========================================================================
// Caso B: el parametro es el id de una fila; el dueno se lee de la fila
// ===========================================================================
test('exigirPropiedadFila permite cuando la fila es del usuario', async () => {
    respuesta = { data: { id_usuario: 'u-1' }, error: null };
    const mw = exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' });
    const { paso } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { id: '55' } });
    assert.strictEqual(paso, true);
    assert.strictEqual(consultas[0].tabla, 'habilidades_estudiante');
    assert.deepStrictEqual(consultas[0].filtros, [['id', '55']]);
});

test('exigirPropiedadFila BLOQUEA la fila de otro usuario (IDOR)', async () => {
    respuesta = { data: { id_usuario: 'u-2' }, error: null };
    const mw = exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' });
    const { paso, res } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { id: '55' } });
    assert.strictEqual(paso, false, 'no debe dejar editar datos ajenos');
    // 404 a proposito: no revela que la fila existe
    assert.strictEqual(res.codigo, 404);
});

test('exigirPropiedadFila da 404 si la fila no existe', async () => {
    respuesta = { data: null, error: null };
    const mw = exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' });
    const { paso, res } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { id: 'no-existe' } });
    assert.strictEqual(paso, false);
    assert.strictEqual(res.codigo, 404);
});

test('exigirPropiedadFila no consulta la base si es admin', async () => {
    const mw = exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' });
    const { paso } = await correr(mw, { user: usuario('admin-1', 'admin'), params: { id: '55' } });
    assert.strictEqual(paso, true);
    assert.strictEqual(consultas.length, 0, 'el admin pasa sin pegarle a la base');
});

test('exigirPropiedadFila propaga el error de base de datos', async () => {
    respuesta = { data: null, error: new Error('fallo supabase') };
    const mw = exigirPropiedadFila({ tabla: 'habilidades_estudiante', columnaDueno: 'id_usuario' });
    const { paso, errorPasado } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { id: '55' } });
    assert.strictEqual(paso, false);
    assert.ok(errorPasado, 'debe llamar next(err) y no responder 200');
});

test('exigirPropiedadFila respeta columnaDueno distinta de id_usuario', async () => {
    respuesta = { data: { id_exalumno: 'u-1' }, error: null };
    const mw = exigirPropiedadFila({ tabla: 'sectores_exalumno', columnaDueno: 'id_exalumno' });
    const { paso } = await correr(mw, { user: usuario('u-1', 'exalumno'), params: { id: '3' } });
    assert.strictEqual(paso, true);
    assert.strictEqual(consultas[0].cols, 'id_exalumno');
});

// ===========================================================================
// Caso C: dueno indirecto, via proyecto_graduacion
// ===========================================================================
test('exigirPropiedadViaProyecto permite al dueno del proyecto', async () => {
    let n = 0;
    const original = supabaseFalso.from;
    supabaseFalso.from = (tabla) => {
        n++;
        respuesta = n === 1
            ? { data: { id_proyecto: 'p-1' }, error: null }
            : { data: { id_estudiante: 'u-1' }, error: null };
        return original.call(supabaseFalso, tabla);
    };
    const mw = exigirPropiedadViaProyecto({ tabla: 'proyecto_necesidades' });
    const { paso } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { id: '9' } });
    supabaseFalso.from = original;
    assert.strictEqual(paso, true);
    assert.strictEqual(consultas[1].tabla, 'proyecto_graduacion');
});

test('exigirPropiedadViaProyecto BLOQUEA si el proyecto es de otro estudiante', async () => {
    let n = 0;
    const original = supabaseFalso.from;
    supabaseFalso.from = (tabla) => {
        n++;
        respuesta = n === 1
            ? { data: { id_proyecto: 'p-1' }, error: null }
            : { data: { id_estudiante: 'otro' }, error: null };
        return original.call(supabaseFalso, tabla);
    };
    const mw = exigirPropiedadViaProyecto({ tabla: 'proyecto_necesidades' });
    const { paso, res } = await correr(mw, { user: usuario('u-1', 'estudiante'), params: { id: '9' } });
    supabaseFalso.from = original;
    assert.strictEqual(paso, false);
    assert.strictEqual(res.codigo, 404);
});
