
function getValue (name) { return document.getElementsByName(name)[0].value }
function setValue (name, val) { document.getElementsByName(name)[0].value = val }
function getText (name) { return document.getElementsByName(name)[0].innerText }
function setText (name, val) { document.getElementsByName(name)[0].innerText = val }

var array,keyArray=0
var P,msk,mpk,id,sk,m,msg,c=0
var encry,encKey=0
let prevSelectedCurve = 0
let cut_str = ","     //区切るやつを定義しておく。
let cut_str2 = " "
mcl.init(prevSelectedCurve).then(() => {
 setText('status', 'ok')
})

function onChangeSelectCurve () {
  const obj = document.selectCurve.curveType
  const idx = obj.selectedIndex
  const curveType = obj.options[idx].value | 0
  if (curveType === prevSelectedCurve) return
  prevSelectedCurve = curveType
  mcl.init(curveType).then(() => {
    setText('status', `curveType=${curveType} status ok`)
  })
}

// Enc(m) = [r P, m + h(e(r mpk, H(id)))]
function IDenc (id, P, mpk, m) {
  const r = new mcl.Fr()
  r.setByCSPRNG()
  const Q = mcl.hashAndMapToG2(id)
  const e = mcl.pairing(mcl.mul(mpk, r), Q)
  return [mcl.mul(P, r), mcl.add(m, mcl.hashToFr(e.serialize()))]
}

// Dec([U, v]) = v - h(e(U, sk))
function IDdec (c, sk) {
  const [U, v] = c
  const e = mcl.pairing(U, sk)
  return mcl.sub(v, mcl.hashToFr(e.serialize()))
}

function setUpIBE(){
  array=new Uint32Array(1)
  window.crypto.getRandomValues(array)
  //console.log(array)//鍵の確認用
  keyArray=String(array)//鍵をIDBで使うため
  P = mcl.hashAndMapToG1('1')
  msk = new mcl.Fr()
  msk.setByCSPRNG()
  setText('msk', msk.serializeToHexStr())
  // mpk = msk P
  mpk = mcl.mul(P, msk)
  setText('mpk', mpk.serializeToHexStr())
  id = getText('id')
  // sk = msk H(id)
  sk = mcl.mul(mcl.hashAndMapToG2(id), msk)
  setText('sk', sk.serializeToHexStr())
  m = new mcl.Fr()
  m.setStr(keyArray)
}
function encMessage(){
  if(keyArray==0){
    alert("セットアップしてください")
    return 
  }
  msg = getValue('msg')
  console.log('msg', msg)
  encry=CryptoJS.AES.encrypt(msg,keyArray).toString()
  var encText=encry.toString(CryptoJS.enc.Utf8)
  console.log(encText)
  // keyencrypt
  c = IDenc(id, P, mpk, m)
  encKey=c[0].serializeToHexStr() + ' ' + c[1].serializeToHexStr()
  setText('enc', encKey)
}
function decMessage() {
  // keydecrypt
  const d = IDdec(c, sk)
  console.log(d.getStr())
  var decry=CryptoJS.AES.decrypt(encry,d.getStr())
  setText('dec', decry.toString(CryptoJS.enc.Utf8))
}
function encFile(){
  if(keyArray==0){
    alert("セットアップしてください")
    return 
  }
 const inputFile= document.getElementById('inputFile').files[0]
 var reader =new FileReader()
 reader.readAsText(inputFile)
 reader.onload=function(){//読み込み完了後実行
   console.table(reader)
   var fileContents=reader.result
   console.log(fileContents)
   encry=CryptoJS.AES.encrypt(fileContents,keyArray).toString()
   var enctxt=encry.toString(CryptoJS.enc.Utf8)
   console.log(enctxt)
   // keyencrypt
   c = IDenc(id, P, mpk, m)
   encKey=c[0].serializeToHexStr() + ' ' + c[1].serializeToHexStr()
   setText('enc', encKey)
   var contents = enctxt+','+encKey
   var blob_content = new Blob([contents]) //文字列で扱えるように変換
   //DLリンクを生成
   const a = document.createElement("a");
   document.body.appendChild(a);
   a.style = "display:none";
   a.href = window.URL.createObjectURL(blob_content)
   a.download = 'encryptedFile.txt'//file.name;
   a.click();
 }
}
function decFile(){
  const inputFile= document.getElementById('inputFile').files[0]
  var reader =new FileReader()
  reader.readAsText(inputFile)
  reader.onload=function(){
    //console.table(reader)//デバッグ用
    var fileContents=reader.result//ファイルの内容
    var Cstr = fileContents.split(cut_str);
    var Cstr2 =Cstr[1].split(cut_str2)
    console.log(fileContents)
    console.log(Cstr2[0])
    console.log(Cstr2[1])
    var encKey=getC(Cstr2[0],Cstr2[1])
    const d = IDdec(encKey, sk)
 　 console.log(d.getStr())
  　var decFile=CryptoJS.AES.decrypt(Cstr[0],d.getStr())
  　setText('dec', decFile.toString(CryptoJS.enc.Utf8))
    var contents = decFile.toString(CryptoJS.enc.Utf8)
    var blob_content = new Blob([contents]) //文字列で扱えるように変換
    //DLリンクを生成
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display:none";
    a.href = window.URL.createObjectURL(blob_content)
    a.download = 'decryptedFile.txt'//file.name;
    a.click();
  }
 }
 function getC(str1, str2) {
  c1 = mcl.hashAndMapToG1('1')
  c2 = new mcl.Fr()
  c1.deserializeHexStr(str1)
  c2.deserializeHexStr(str2)
  return [c1, c2]
}
