const {test}=require('node:test');
const assert=require('node:assert/strict');
const {diasParaServicio}=require('../src/maintenance-rules');
test('Dias restantes usan calendario local: hoy, futuro y vencido',()=>{
 const hoy=new Date(2026,8,25,23,59);
 assert.equal(diasParaServicio('2026-09-25',hoy),0);
 assert.equal(diasParaServicio('2026-09-26',hoy),1);
 assert.equal(diasParaServicio('2026-09-24',hoy),-1);
 assert.equal(diasParaServicio('2026-10-02',hoy),7);
 assert.equal(diasParaServicio(null,hoy),null);
 assert.equal(diasParaServicio('2028-03-01',new Date(2028,1,28)),2);
});

const {estadoMantenimiento}=require('../src/maintenance-rules');
test('Estados respetan limites y la referencia mas urgente',()=>{
 for(const [km,dias,estado] of [[500,15,'Pendiente'],[499,15,'Proximo'],[500,14,'Proximo'],[150,7,'Proximo'],[149,15,'Urgente'],[500,6,'Urgente'],[1,7,'Urgente'],[0,0,'Urgente'],[-1,30,'Servicio pasado'],[900,-1,'Servicio pasado'],[null,15,'Pendiente'],[null,7,'Proximo'],[null,0,'Urgente'],[500,null,'Pendiente'],[null,null,'Sin referencia']]) assert.equal(estadoMantenimiento(km,dias),estado,`${km},${dias}`);
});
