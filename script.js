const state={products:[],sales:[],returns:[]};
const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));
const date=v=>new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v));
const badge=s=>`<span class="badge ${s==='Selesai'?'ok':'pending'}">${s}</span>`;
async function api(url,opts){const r=await fetch(url,opts);if(!r.ok)throw Error('API error');return r.json()}
function salesRows(rows,id){document.getElementById(id).innerHTML=rows.map(x=>`<tr><td>${x.invoice_no}</td><td>${x.customer||x.customers?.name||'-'}</td><td>${date(x.sale_date)}</td><td>${money(x.total)}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada data.</td></tr>'}
function renderReturns(rows){document.getElementById('returnsTable').innerHTML=rows.map(x=>`<tr><td>${x.return_no}</td><td>${x.customer||x.customers?.name||'-'}</td><td>${date(x.return_date)}</td><td>${money(x.refund_amount)}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada retur.</td></tr>'}
function renderProducts(rows){
  document.getElementById('productsTable').innerHTML=rows.map(x=>`<tr><td>${x.name}<small style="display:block;color:#b3859a;font-size:12px">${x.brand}</small></td><td>${x.sku}</td><td>${x.category||x.categories?.name||'-'}</td><td>${money(x.price)}</td><td>${x.stock} unit</td><td class="actions"><button class="link" onclick="editProduct('${x.id}')">Edit</button><button class="link danger" onclick="deleteProduct('${x.id}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="6">Belum ada produk.</td></tr>';
  const low=rows.filter(x=>x.stock<=x.min_stock);
  document.getElementById('lowStockList').innerHTML=low.map(x=>`<div class="stock"><div class="thumb">${x.brand.slice(0,2).toUpperCase()}</div><div class="stock-info"><b>${x.name}</b><small>${x.sku} · ${x.brand}</small></div><strong>${x.stock} unit</strong></div>`).join('')||'<p>Stok aman.</p>';
  document.getElementById('productSelect').innerHTML=rows.map(x=>`<option value="${x.id}">${x.name} - ${money(x.price)}</option>`).join('')
}
async function load(){try{const[d,p,s,r]=await Promise.all([api('/api/dashboard'),api('/api/products'),api('/api/sales'),api('/api/returns')]);state.products=p;state.sales=s;state.returns=r;document.getElementById('revenue').textContent=money(d.monthly_revenue);document.getElementById('productCount').textContent=d.product_count;document.getElementById('lowStock').textContent=d.low_stock_count;document.getElementById('pendingReturns').textContent=d.pending_returns;renderProducts(p);salesRows(s,'recentSales');salesRows(s,'salesTable');renderReturns(r)}catch(e){toast('Server belum terhubung. Jalankan node app.js.')}}
let modalType='sale',editingId=null;
function page(name){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===name));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===name));document.getElementById('title').textContent={dashboard:'Ringkasan hari ini',sales:'Penjualan',returns:'Retur barang',products:'Produk & stok'}[name];document.querySelector('.sidebar').classList.remove('open')}
function modal(type,data){
  modalType=type;editingId=data?.id||null;
  const isProduct=type==='product';
  document.getElementById('modalLabel').textContent=isProduct?'PRODUK':type==='return'?'RETUR BARANG':'TRANSAKSI';
  document.getElementById('modalTitle').textContent=isProduct?(editingId?'Edit produk':'Tambah produk'):type==='return'?'Ajukan retur':'Transaksi baru';
  const form=document.getElementById('form');
  if(isProduct){form.innerHTML=`<label>Nama produk<input name="name" required value="${data?.name||''}" placeholder="Nama produk"></label><label>SKU<input name="sku" required value="${data?.sku||''}" placeholder="SP-003"></label><label>Brand<input name="brand" required value="${data?.brand||''}" placeholder="Nexora"></label><label>Kategori<input name="category" value="${data?.category||'Umum'}" placeholder="Smartphone"></label><label>Harga<input name="price" type="number" min="0" value="${data?.price||0}"></label><label>Stok<input name="stock" type="number" min="0" value="${data?.stock||0}"></label><label>Stok minimum<input name="min_stock" type="number" min="0" value="${data?.min_stock||5}"></label><div class="modal-actions"><button type="button" class="ghost" id="cancelModal">Batal</button><button class="primary">Simpan</button></div>`}
  else{form.innerHTML=`<label>Pelanggan<input name="customer" required value="${data?.customer||''}" placeholder="Nama pelanggan"></label>${type==='sale'?'<label>Produk<select name="product_id" id="productSelect"></select></label><label>Jumlah<input name="quantity" type="number" min="1" value="1"></label>':''}${type==='return'?'<label>Nominal refund<input name="refund_amount" type="number" min="0" value="0"></label>':''}<label>Catatan<textarea name="notes" rows="3" placeholder="Opsional"></textarea></label><div class="modal-actions"><button type="button" class="ghost" id="cancelModal">Batal</button><button class="primary">Simpan</button></div>`}
  document.getElementById('modalBg').hidden=false;
  document.getElementById('cancelModal').onclick=close;
  document.getElementById('closeModal').onclick=close;
  if(type==='sale')fillProducts();
  form.onsubmit=submitForm;
}
function fillProducts(){const sel=document.getElementById('productSelect');if(sel)sel.innerHTML=state.products.map(x=>`<option value="${x.id}">${x.name} - ${money(x.price)}</option>`).join('')}
function close(){document.getElementById('modalBg').hidden=true;editingId=null}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500)}
async function submitForm(e){
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries());
  try{
    let url,method='POST';
    if(modalType==='product'){url=editingId?'/api/products/'+editingId:'/api/products';method=editingId?'PUT':'POST'}
    else if(modalType==='sale'){url='/api/sales'}
    else{url='/api/returns'}
    const r=await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const out=await r.json();
    if(!r.ok)throw Error(out.error||'Gagal menyimpan');
    const wasEdit=editingId;close();toast(wasEdit?'Data berhasil diperbarui.':'Data berhasil disimpan.');await load();
  }catch(err){toast('Gagal: '+err.message)}
}
function editProduct(id){const p=state.products.find(x=>x.id===id);if(p)modal('product',p)}
async function deleteProduct(id){const p=state.products.find(x=>x.id===id);if(!p)return;if(!confirm(`Hapus produk "${p.name}"?`))return;try{const r=await fetch('/api/products/'+id,{method:'DELETE'});if(!r.ok)throw Error('Gagal hapus');toast('Produk berhasil dihapus.');await load()}catch(err){toast('Gagal: '+err.message)}}
document.querySelectorAll('.nav').forEach(x=>x.onclick=()=>page(x.dataset.page));
document.querySelectorAll('[data-go]').forEach(x=>x.onclick=()=>page(x.dataset.go));
document.getElementById('mobileMenu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
document.getElementById('newSale').onclick=()=>modal('sale');
document.getElementById('newSale2').onclick=()=>modal('sale');
document.getElementById('newReturn').onclick=()=>modal('return');
document.getElementById('newProduct').onclick=()=>modal('product');
document.getElementById('closeModal').onclick=close;
document.getElementById('modalBg').onclick=e=>{if(e.target.id==='modalBg')close()};
document.getElementById('salesSearch').oninput=e=>salesRows(state.sales.filter(x=>JSON.stringify(x).toLowerCase().includes(e.target.value.toLowerCase())),'salesTable');
document.getElementById('returnsSearch').oninput=e=>renderReturns(state.returns.filter(x=>JSON.stringify(x).toLowerCase().includes(e.target.value.toLowerCase())));
document.getElementById('productsSearch').oninput=e=>renderProducts(state.products.filter(x=>JSON.stringify(x).toLowerCase().includes(e.target.value.toLowerCase())));
load();