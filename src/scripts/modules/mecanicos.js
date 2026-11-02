let mecanicos = [], mecanicoId = null;
const camposMecanico = ['nombre','edad','dpi','correo','direccion','fecha_contratacion'];
function renderMecanicos() {
 const q = document.getElementById('buscarMecanico').value.trim().toLowerCase();
 const rows = mecanicos.filter(m => [m.nombre,m.dpi].some(v => v.toLowerCase().includes(q)));
 document.getElementById('tablaMecanicos').replaceChildren(...rows.map(m => {
  const tr=document.createElement('tr');
  for(const key of [...camposMecanico,'fecha_registro']) {const td=document.createElement('td');td.textContent=m[key];tr.append(td);}
  const td=document.createElement('td'), button=document.createElement('button');button.type='button';button.className='parts-edit-button';button.textContent='Editar';
  button.addEventListener('click',()=>{mecanicoId=m.id_mecanico;for(const key of camposMecanico)document.getElementById('mecanico_'+key).value=m[key];document.getElementById('mecanicoTitulo').textContent='Editar mecanico';});td.append(button);tr.append(td);return tr;
 }));document.getElementById('mecanicosEstado').textContent=rows.length+' mecanicos';
}
async function cargarMecanicos(){try{mecanicos=await window.api.mecanicos.list();renderMecanicos();}catch(e){mecanicos=[];renderMecanicos();document.getElementById('mecanicosEstado').textContent='No se pudo cargar el catalogo.';await window.ui.alert(e.message);}}
function nuevoMecanico(){mecanicoId=null;document.getElementById('formMecanico').reset();document.getElementById('mecanicoTitulo').textContent='Nuevo mecanico';}
document.getElementById('formMecanico').addEventListener('submit',async event=>{event.preventDefault();const button=event.submitter;if(button)button.disabled=true;try{const data=Object.fromEntries(camposMecanico.map(key=>[key,document.getElementById('mecanico_'+key).value]));await window.api.mecanicos.save(mecanicoId,data);nuevoMecanico();await cargarMecanicos();}catch(e){await window.ui.alert(e.message);}finally{if(button)button.disabled=false;}});
document.getElementById('mecanicoNuevo').addEventListener('click',nuevoMecanico);
document.getElementById('buscarMecanico').addEventListener('input',renderMecanicos);
cargarMecanicos();
