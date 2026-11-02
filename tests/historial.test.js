const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('Historial filtra, pagina y limpia datos ante un error', async () => {
    const nodes = new Map();
    function element() { return {value:'', children:[], handlers:{}, addEventListener(event, fn){this.handlers[event]=fn;}, append(node){this.children.push(node);}, replaceChildren(...nodes){this.children=nodes;} }; }
    const html=fs.readFileSync('src/views/historial.html','utf8');
    for(const match of html.matchAll(/id="([^"]+)"/g)) nodes.set(match[1],element());
    let fail=false;
    const rows=Array.from({length:55},(_,i)=>({fecha:'2026-09-25 10:00:00',placa:'P-'+i,mecanico:'Ana '+i,evento:'Ingreso a taller',kilometraje:100+i}));
    const ctx=vm.createContext({document:{getElementById:id=>{assert(nodes.has(id),id);return nodes.get(id);},createElement:element},window:{api:{historial:{list:async()=>{if(fail)throw Error('Sin conexion');return rows;}}},ui:{alert:async()=>{}}}});
    vm.runInContext(fs.readFileSync('src/scripts/modules/historial.js','utf8'),ctx);
    await new Promise(resolve=>setImmediate(resolve));
    assert.equal(nodes.get('historialTabla').children.length,50);
    nodes.get('historialSiguiente').handlers.click();
    assert.equal(nodes.get('historialTabla').children.length,5);
    nodes.get('historialBuscar').value='Ana 54'; nodes.get('historialBuscar').handlers.input();
    assert.equal(nodes.get('historialTabla').children.length,1);
    nodes.get('historialDesde').value='2026-09-26'; nodes.get('historialDesde').handlers.input();
    assert.equal(nodes.get('historialTabla').children.length,0);
    fail=true; await nodes.get('historialActualizar').handlers.click();
    assert.equal(nodes.get('historialTabla').children.length,0);
    assert.equal(nodes.get('historialActualizar').disabled,false);
    assert(nodes.get('historialResumen').textContent.includes('No se pudo'));
});
