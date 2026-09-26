const STORAGE_KEY='gadgetflow-data-v1';
const initialData={
  products:[
    {id:'p1',sku:'SP-001',name:'Nova X Pro',brand:'Nexora',category:'Smartphone',price:12999000,stock:12,min_stock:5},
    {id:'p2',sku:'SP-002',name:'Pixel Air 5',brand:'Orbis',category:'Smartphone',price:8499000,stock:4,min_stock:5},
    {id:'p3',sku:'LP-001',name:'WorkBook 14',brand:'Nexora',category:'Laptop',price:15499000,stock:8,min_stock:3},
    {id:'p4',sku:'AC-001',name:'Earbuds Quiet',brand:'Sonic',category:'Aksesoris',price:899000,stock:18,min_stock:5}
  ],
  sales:[
    {invoice_no:'INV-20260924-001',customer:'Raka Pratama',sale_date:'2026-09-24',total:13898000,status:'Selesai'},
    {invoice_no:'INV-20260923-002',customer:'Nadia Putri',sale_date:'2026-09-23',total:899000,status:'Selesai'}
  ],
  returns:[
    {return_no:'RET-20260924-001',customer:'Nadia Putri',return_date:'2026-09-24',refund_amount:899000,status:'Diproses'}
  ]
};
function loadState(){try{const s=localStorage.getItem(STORAGE_KEY);if(s)return JSON.parse(s)}catch(e){}return JSON.parse(JSON.stringify(initialData))}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(e){}}
const state=loadState();
const money=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(n||0));
const date=v=>new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(v));
const badge=s=>`<span class="badge ${s==='Selesai'?'ok':'pending'}">${s}</span>`;

function renderDashboard(){
  const revenue=state.sales.reduce((a,x)=>a+x.total,0);
  const low=state.products.filter(x=>x.stock<=x.min_stock).length;
  document.getElementById('revenue').textContent=money(revenue);
  document.getElementById('productCount').textContent=state.products.length;
  document.getElementById('lowStock').textContent=low;
  document.getElementById('pendingReturns').textContent=state.returns.filter(x=>x.status==='Diproses').length;
}
function salesRows(rows,id){document.getElementById(id).innerHTML=rows.map(x=>`<tr><td>${x.invoice_no}</td><td>${x.customer||'-'}</td><td>${date(x.sale_date)}</td><td>${money(x.total)}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada data.</td></tr>'}
function renderReturns(rows){document.getElementById('returnsTable').innerHTML=rows.map(x=>`<tr><td>${x.return_no}</td><td>${x.customer||'-'}</td><td>${date(x.return_date)}</td><td>${money(x.refund_amount)}</td><td>${badge(x.status)}</td></tr>`).join('')||'<tr><td colspan="5">Belum ada retur.</td></tr>'}
function renderProducts(rows){
  document.getElementById('productsTable').innerHTML=rows.map(x=>`<tr><td>${x.name}<small style="display:block;color:#b3859a;font-size:12px">${x.brand}</small></td><td>${x.sku}</td><td>${x.category||'-'}</td><td>${money(x.price)}</td><td>${x.stock} unit</td><td class="actions"><button class="link" onclick="editProduct('${x.id}')">Edit</button><button class="link danger" onclick="deleteProduct('${x.id}')">Hapus</button></td></tr>`).join('')||'<tr><td colspan="6">Belum ada produk.</td></tr>';
  const low=rows.filter(x=>x.stock<=x.min_stock);
  document.getElementById('lowStockList').innerHTML=low.map(x=>`<div class="stock"><div class="thumb">${(x.brand||'??').slice(0,2).toUpperCase()}</div><div class="stock-info"><b>${x.name}</b><small>${x.sku} · ${x.brand}</small></div><strong>${x.stock} unit</strong></div>`).join('')||'<p>Stok aman.</p>';
  document.getElementById('productSelect').innerHTML=rows.map(x=>`<option value="${x.id}">${x.name} - ${money(x.price)}</option>`).join('')
}
function renderAll(){
  renderDashboard();
  renderProducts(state.products);
  salesRows(state.sales.slice(0,20),'recentSales');
  salesRows(state.sales.slice(0,20),'salesTable');
  renderReturns(state.returns.slice(0,20));
}

let modalType='sale',editingId=null;
function page(name){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===name));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.page===name));document.getElementById('title').textContent={dashboard:'Ringkasan hari ini',sales:'Penjualan',returns:'Retur barang',products:'Produk & stok'}[name];document.querySelector('.sidebar').classList.remove('open')}
function modal(type,data){
  modalType=type;editingId=data?.id||null;
  const isProduct=type==='product';
  document.getElementById('modalLabel').textContent=isProduct?'PRODUK':type==='return'?'RETUR BARANG':'TRANSAKSI';
  document.getElementById('modalTitle').textContent=isProduct?(editingId?'Edit produk':'Tambah produk'):type==='return'?'Ajukan retur':'Transaksi baru';
  const form=document.getElementById('form');
  if(isProduct){form.innerHTML=`<label>Nama produk<input name="name" required value="${data?.name||''}"></label><label>SKU<input name="sku" required value="${data?.sku||''}"></label><label>Brand<input name="brand" required value="${data?.brand||''}"></label><label>Kategori<input name="category" value="${data?.category||'Umum'}"></label><label>Harga<input name="price" type="number" min="0" value="${data?.price||0}"></label><label>Stok<input name="stock" type="number" min="0" value="${data?.stock||0}"></label><label>Stok minimum<input name="min_stock" type="number" min="0" value="${data?.min_stock||5}"></label><div class="modal-actions"><button type="button" class="ghost" id="cancelModal">Batal</button><button class="primary">Simpan</button></div>`}
  else{form.innerHTML=`<label>Pelanggan<input name="customer" required value="${data?.customer||''}"></label>${type==='sale'?'<label>Produk<select name="product_id" id="productSelect"></select></label><label>Jumlah<input name="quantity" type="number" min="1" value="1"></label>':''}${type==='return'?'<label>Nominal refund<input name="refund_amount" type="number" min="0" value="0"></label>':''}<label>Catatan<textarea name="notes" rows="3"></textarea></label><div class="modal-actions"><button type="button" class="ghost" id="cancelModal">Batal</button><button class="primary">Simpan</button></div>`}
  document.getElementById('modalBg').hidden=false;
  document.getElementById('cancelModal').onclick=close;
  document.getElementById('closeModal').onclick=close;
  if(type==='sale')fillProducts();
  form.onsubmit=submitForm;
}
function fillProducts(){const sel=document.getElementById('productSelect');if(sel)sel.innerHTML=state.products.map(x=>`<option value="${x.id}">${x.name} - ${money(x.price)}</option>`).join('')}
function close(){document.getElementById('modalBg').hidden=true;editingId=null}
function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500)}
function submitForm(e){
  e.preventDefault();
  const data=Object.fromEntries(new FormData(e.target).entries());
  if(modalType==='product'){
    if(editingId){const i=state.products.findIndex(x=>x.id===editingId);if(i>-1)state.products[i]={...state.products[i],name:data.name,sku:data.sku,brand:data.brand,category:data.category,price:Number(data.price),stock:Number(data.stock),min_stock:Number(data.min_stock)}}
    else state.products.push({id:'p'+Date.now(),name:data.name,sku:data.sku,brand:data.brand,category:data.category||'Umum',price:Number(data.price||0),stock:Number(data.stock||0),min_stock:Number(data.min_stock||5)});
    saveState();close();toast(editingId?'Data berhasil diperbarui.':'Data berhasil disimpan.');renderAll();
  }else if(modalType==='sale'){
    const p=state.products.find(x=>x.id===data.product_id);if(!p){toast('Produk tidak ditemukan');return}
    const qty=Number(data.quantity||1),total=p.price*qty;
    state.sales.unshift({invoice_no:'INV-'+Date.now(),customer:data.customer,sale_date:new Date().toISOString().slice(0,10),total,status:'Selesai'});
    p.stock=Math.max(0,p.stock-qty);saveState();close();toast('Transaksi berhasil disimpan.');renderAll();
  }else{
    state.returns.unshift({return_no:'RET-'+Date.now(),customer:data.customer,return_date:new Date().toISOString().slice(0,10),refund_amount:Number(data.refund_amount||0),status:'Diproses'});
    saveState();close();toast('Retur berhasil diajukan.');renderAll();
  }
}
function editProduct(id){const p=state.products.find(x=>x.id===id);if(p)modal('product',p)}
function deleteProduct(id){const p=state.products.find(x=>x.id===id);if(!p)return;if(!confirm(`Hapus produk "${p.name}"?`))return;state.products=state.products.filter(x=>x.id!==id);saveState();toast('Produk berhasil dihapus.');renderAll()}
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
renderAll();