import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
const $=id=>document.getElementById(id);
const definitions=[
{id:'board',name:'Protoboard',emoji:'▦',description:'Una base para conectar piezas sin soldarlas.',example:'Se usa para probar circuitos en clase.',question:'¿Por qué es útil conectar sin soldar?'},
{id:'battery',name:'Pila',emoji:'🔋',description:'Entrega energía eléctrica de bajo voltaje al circuito.',example:'Una linterna usa pilas para funcionar.',question:'¿Qué sucede si quitamos la pila?'},
{id:'wire',name:'Cable',emoji:'〰️',description:'Conduce electricidad entre componentes cuando el circuito está cerrado.',example:'Los cables unen las piezas de una linterna.',question:'¿Qué pasa si un cable se desconecta?'},
{id:'switch',name:'Interruptor',emoji:'⏻',description:'Abre o cierra el camino de la electricidad.',example:'El botón de una lámpara la enciende y apaga.',question:'¿Por qué la luz se apaga al abrir el interruptor?'},
{id:'resistor',name:'Resistencia',emoji:'▤',description:'Limita la corriente que pasa por una parte del circuito.',example:'Ayuda a proteger un LED.',question:'¿Por qué un LED necesita limitar su corriente?'},
{id:'led',name:'LED',emoji:'💡',description:'Produce luz cuando circula corriente en la dirección adecuada.',example:'Los indicadores luminosos de muchos aparatos son LED.',question:'¿Por qué importa cómo se conecta un LED?'},
{id:'motor',name:'Motor pequeño',emoji:'⚙️',description:'Transforma energía eléctrica en movimiento.',example:'Un juguete con ruedas puede usar un motor.',question:'¿Qué energía entra y cuál sale del motor?'},
{id:'buzzer',name:'Zumbador',emoji:'🔔',description:'Produce sonido cuando recibe la alimentación apropiada.',example:'Algunas alarmas emiten sonidos con un zumbador.',question:'¿Cómo convierte electricidad en sonido?'},
{id:'capacitor',name:'Capacitor',emoji:'▥',description:'Puede almacenar temporalmente una pequeña carga eléctrica.',example:'Ayuda a estabilizar algunos circuitos electrónicos.',question:'¿En qué se diferencia de una pila?'},
{id:'transistor',name:'Transistor',emoji:'🔺',description:'Puede actuar como interruptor controlado por una señal eléctrica.',example:'Los dispositivos electrónicos contienen muchos transistores.',question:'¿Cómo puede una señal controlar otra?'}];
const state={active:'board',imported:[],spin:false,camera:false,hands:false,handBusy:false,handTracker:null,handStream:null,vr:false,objectUrl:null,lastGesture:0};
const scene=new THREE.Scene();scene.background=null;
const camera=new THREE.PerspectiveCamera(42,1,.05,100);camera.position.set(0,2.5,7.2);camera.lookAt(0,0,0);
const renderer=new THREE.WebGLRenderer({canvas:$('threeCanvas'),alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(500,400);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.xr.enabled=true;
scene.add(new THREE.HemisphereLight(0xffffff,0x9b415c,2.5));const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(3,7,5);scene.add(light);const fill=new THREE.DirectionalLight(0xff8fa3,1.2);fill.position.set(-5,2,-4);scene.add(fill);
const root=new THREE.Group();scene.add(root);const mat=(c,metalness=.1)=>new THREE.MeshStandardMaterial({color:c,metalness,roughness:.45});
const color={dark:0x590d22,red:0xc9184a,pink:0xff758f,light:0xffccd5,white:0xfff0f3,gold:0xffbc52,gray:0x888888};
function mesh(geometry,material,x=0,y=0,z=0,parent=root){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);parent.add(o);return o}
function box(w,h,d,c,x=0,y=0,z=0,parent=root){return mesh(new THREE.BoxGeometry(w,h,d),mat(c),x,y,z,parent)}
function cyl(r1,r2,h,c,x=0,y=0,z=0,parent=root){return mesh(new THREE.CylinderGeometry(r1,r2,h,24),mat(c),x,y,z,parent)}
function rod(a,b,r,c,parent=root){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=q.clone().sub(p);const o=mesh(new THREE.CylinderGeometry(r,r,d.length(),12),mat(c),0,0,0,parent);o.position.copy(p.add(q).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
function sphere(r,c,x,y,z,parent=root){return mesh(new THREE.SphereGeometry(r,20,14),mat(c),x,y,z,parent)}
function build(type){root.clear();switch(type){
case 'board':box(3.6,.3,2.2,color.white);for(let x=-1.55;x<1.6;x+=.23)for(let z=-.82;z<.9;z+=.23){sphere(.038,color.gray,x,.165,z)}box(3.35,.015,.055,color.red,0,.164,-1);box(3.35,.015,.055,0x2465a4,0,.164,1);break;
case 'battery':{const b=cyl(.6,.6,2.1,color.red);b.rotation.z=Math.PI/2;const cap=cyl(.61,.61,.28,color.dark,-1.13,0,0);cap.rotation.z=Math.PI/2;const tip=cyl(.19,.19,.15,color.gold,1.12,0,0);tip.rotation.z=Math.PI/2;break}
case 'wire':for(let i=0;i<3;i++){const pts=[];for(let t=0;t<=40;t++){let x=-1.5+t/40*3;pts.push(new THREE.Vector3(x,Math.sin(t/40*Math.PI*2+i)*.33,i*.35-.35))}root.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),60,.07,8,false),mat([color.red,color.dark,0xffbc52][i])))}break;
case 'switch':box(2.5,.35,1.4,color.dark);box(.9,.17,.65,color.light,0,.27,0);{const handle=box(.25,.75,.25,color.red,0,.66,0);handle.rotation.z=-.55}break;
case 'resistor':{const r=cyl(.36,.36,1.75,0xe6c5a2);r.rotation.z=Math.PI/2;rod([-1.65,0,0],[-.9,0,0],.065,color.gray);rod([.9,0,0],[1.65,0,0],.065,color.gray);for(const [x,c] of [[-.5,color.red],[-.18,color.dark],[.2,color.gold],[.58,color.red]]){const ring=cyl(.37,.37,.11,c,x);ring.rotation.z=Math.PI/2}break}
case 'led':{const dome=sphere(.62,color.red,0,.35,0);dome.scale.y=1.3;cyl(.62,.62,.25,color.red,0,-.2,0);rod([-.2,-.33,0],[-.2,-1.6,0],.065,color.gray);rod([.2,-.33,0],[.2,-1.25,0],.065,color.gray);break}
case 'motor':{const body=cyl(.75,.75,1.9,color.gray);body.rotation.z=Math.PI/2;const face=cyl(.76,.76,.17,color.dark,1,0,0);face.rotation.z=Math.PI/2;rod([1,0,0],[1.85,0,0],.13,color.gold);break}
case 'buzzer':cyl(.95,.95,.5,color.dark);cyl(.6,.6,.03,color.red,0,.27,0);sphere(.17,color.dark,0,.3,0);rod([-.4,-.25,0],[-.4,-1,0],.06,color.gray);rod([.4,-.25,0],[.4,-1,0],.06,color.gray);break;
case 'capacitor':cyl(.75,.75,1.65,color.red);cyl(.75,.75,.08,color.gray,0,.85,0);rod([-.24,-.8,0],[-.24,-1.65,0],.06,color.gray);rod([.24,-.8,0],[.24,-1.65,0],.06,color.gray);break;
case 'transistor':box(1.6,1.55,.55,color.dark,0,.3,0);for(const x of [-.5,0,.5])rod([x,-.48,0],[x,-1.6,0],.06,color.gray);box(1.5,.25,.6,color.red,0,1.05,0);break;
}}
function centerFit(){const bb=new THREE.Box3().setFromObject(root);if(bb.isEmpty())return;const size=bb.getSize(new THREE.Vector3());const center=bb.getCenter(new THREE.Vector3());root.position.sub(center);const largest=Math.max(size.x,size.y,size.z);root.scale.setScalar(largest>0?3/largest:1)}
function choose(id){const item=definitions.find(x=>x.id===id)||state.imported.find(x=>x.id===id);if(!item)return;state.active=id;root.position.set(0,0,0);root.rotation.set(0,0,0);root.scale.setScalar(1);if(item.file){loadGLB(item)}else{build(id);centerFit()}$('modelTitle').textContent=item.name;$('modelDescription').textContent=item.description;$('modelExample').textContent=item.example;$('modelQuestion').textContent=item.question;renderCatalog()}
function renderCatalog(){const c=$('catalog');c.replaceChildren();for(const item of [...definitions,...state.imported]){const b=document.createElement('button');b.className=state.active===item.id?'active':'';b.setAttribute('aria-pressed',String(state.active===item.id));const e=document.createElement('span');e.className='emoji';e.textContent=item.emoji;const t=document.createElement('span');t.textContent=item.name;const s=document.createElement('small');s.textContent=item.file?'Archivo local':'Modelo geométrico';t.append(s);b.append(e,t);b.addEventListener('click',()=>choose(item.id));c.append(b)}$('count').textContent=definitions.length+state.imported.length}
function renderCards(){const container=$('cards');for(const d of definitions){const card=document.createElement('article');card.className='component-card';const icon=document.createElement('div');icon.className='card-icon';icon.textContent=d.emoji;const h=document.createElement('h3');h.textContent=d.name;const p=document.createElement('p');p.textContent=d.description;const btn=document.createElement('button');btn.className='outline';btn.textContent='Ver en 3D';btn.addEventListener('click',()=>{choose(d.id);$('explorar').scrollIntoView({behavior:'smooth'})});card.append(icon,h,p,btn);container.append(card)}}
const loader=new GLTFLoader();function loadGLB(item){$('loadOverlay').hidden=false;loader.load(item.url,gltf=>{if(state.active!==item.id){$('loadOverlay').hidden=true;return}root.clear();root.add(gltf.scene);centerFit();$('loadOverlay').hidden=true;status('Modelo local cargado correctamente.')},undefined,()=>{$('loadOverlay').hidden=true;status('No se pudo abrir este GLB. Revisa que sea válido y contenga sus recursos.');root.clear()})}
$('importFile').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file)return;if(!file.name.toLowerCase().endsWith('.glb')){status('Solo se admite GLB autocontenido. Convierte archivos glTF con recursos externos a GLB.');return}if(file.size>50*1024*1024){status('El modelo supera el límite de 50 MB.');return}const item={id:'local-'+Date.now(),name:file.name,emoji:'📦',description:'Modelo importado desde este dispositivo.',example:'Explora sus formas y describe lo que observas.',question:'¿Qué partes identificas en este objeto?',file:true,url:URL.createObjectURL(file)};state.imported.push(item);choose(item.id);e.target.value='';status('Modelo agregado solo para esta sesión. Recuerda respetar su licencia.')});
const viewer=$('viewer');function resize(){const r=viewer.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();$('handCanvas').width=Math.round(r.width);$('handCanvas').height=Math.round(r.height)}new ResizeObserver(resize).observe(viewer);
let dragging=false,px=0,py=0;viewer.addEventListener('pointerdown',e=>{if(state.hands)return;dragging=true;px=e.clientX;py=e.clientY;viewer.setPointerCapture(e.pointerId)});viewer.addEventListener('pointerup',()=>dragging=false);viewer.addEventListener('pointercancel',()=>dragging=false);viewer.addEventListener('pointermove',e=>{if(!dragging||state.hands)return;root.rotation.y+=(e.clientX-px)*.009;root.rotation.x=Math.max(-1.3,Math.min(1.3,root.rotation.x+(e.clientY-py)*.009));px=e.clientX;py=e.clientY});viewer.addEventListener('wheel',e=>{e.preventDefault();camera.position.z=THREE.MathUtils.clamp(camera.position.z+e.deltaY*.007,3,12)},{passive:false});let lastPinch=null;viewer.addEventListener('touchmove',e=>{if(e.touches.length!==2)return;const a=e.touches[0],b=e.touches[1];const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(lastPinch!==null)camera.position.z=THREE.MathUtils.clamp(camera.position.z+(lastPinch-d)*.015,3,12);lastPinch=d},{passive:true});viewer.addEventListener('touchend',()=>lastPinch=null);
function status(msg){$('status').textContent=msg}function animate(){if(state.spin&&!state.hands)root.rotation.y+=.006;renderer.render(scene,camera)}renderer.setAnimationLoop(animate);
$('spinBtn').onclick=()=>{state.spin=!state.spin;$('spinBtn').textContent='⟳ Giro automático: '+(state.spin?'sí':'no')};$('resetBtn').onclick=()=>{root.rotation.set(0,0,0);camera.position.set(0,2.5,7.2);camera.lookAt(0,0,0);status('Vista restablecida.')};$('fullscreenBtn').onclick=async()=>{try{if(!document.fullscreenElement)await viewer.requestFullscreen();else await document.exitFullscreen()}catch{status('Pantalla completa no disponible en este navegador.')}};
async function startCamera(){if(!navigator.mediaDevices?.getUserMedia){status('Tu navegador no ofrece acceso a cámara. Usa HTTPS o localhost y prueba otro navegador.');return false}try{if(!state.handStream)state.handStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});$('camera').srcObject=state.handStream;await $('camera').play();state.camera=true;viewer.classList.add('camera-on');$('modeBadge').textContent='RA visual';$('stopCamBtn').hidden=false;status('Cámara activa. El modelo se superpone al video, sin anclaje espacial.');return true}catch(e){status('No fue posible activar la cámara: revisa permisos, HTTPS y que otra aplicación no la esté usando.');return false}}
function stopCamera(){gestureBuilderActive=false;resetGesturePointer();state.hands=false;$('handsBtn').textContent='✋ Activar manos';state.camera=false;state.handStream?.getTracks().forEach(t=>t.stop());state.handStream=null;$('camera').srcObject=null;viewer.classList.remove('camera-on');$('modeBadge').textContent='3D';$('stopCamBtn').hidden=true;$('handCanvas').getContext('2d').clearRect(0,0,$('handCanvas').width,$('handCanvas').height);status('Cámara apagada. Continúa explorando en 3D.')} 
$('modeCam').onclick=startCamera;$('stopCamBtn').onclick=stopCamera;$('mode3d').onclick=()=>{stopCamera();$('explorar').scrollIntoView({behavior:'smooth'})};
async function initHands(){
  if(state.hands){
    state.hands=false;
    $('handsBtn').textContent='✋ Activar manos';
    $('handCanvas').getContext('2d').clearRect(0,0,$('handCanvas').width,$('handCanvas').height);
    status('Control gestual desactivado; la cámara sigue activa.');
    return;
  }
  if(!await startCamera())return;
  if(!window.isSecureContext){status('MediaPipe requiere HTTPS o localhost para usar la cámara.');return;}
  $('handsBtn').disabled=true;
  try{
    status('Preparando MediaPipe. Descargando los recursos necesarios…');
    if(!state.handTracker){
      const versions=['0.10.22','0.10.14'];
      const errors=[];
      for(const version of versions){
        try{
          const base=`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${version}`;
          const mp=await import(`${base}/+esm`);
          const vision=await mp.FilesetResolver.forVisionTasks(`${base}/wasm`);
          const modelAssetPath='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
          // CPU primero: evita errores de creación de un segundo contexto WebGL
          // cuando Three.js ya utiliza la tarjeta gráfica del dispositivo.
          try{
            state.handTracker=await mp.HandLandmarker.createFromOptions(vision,{
              baseOptions:{modelAssetPath,delegate:'CPU'},runningMode:'VIDEO',numHands:1
            });
          }catch(cpuError){
            console.warn('MediaPipe CPU no disponible:',cpuError);
            state.handTracker=await mp.HandLandmarker.createFromOptions(vision,{
              baseOptions:{modelAssetPath,delegate:'GPU'},runningMode:'VIDEO',numHands:1
            });
          }
          break;
        }catch(error){
          console.warn(`MediaPipe ${version}:`,error);
          errors.push(`${version}: ${error?.message||String(error)}`);
        }
      }
      if(!state.handTracker)throw new Error(errors.join(' | '));
    }
    state.hands=true;
    lastVideoTime=-1;
    $('handsBtn').textContent='✋ Desactivar manos';
    status('MediaPipe listo. Mueve el índice para girar, haz pinza para acercar y muestra ✌️ para cambiar de componente.');
    handLoop();
  }catch(err){
    state.hands=false;
    const detail=String(err?.message||err||'Error desconocido').slice(0,420);
    status(`MediaPipe no pudo iniciarse: ${detail}. Revisa la consola (F12) y la conexión a los CDN. Puedes seguir usando el modo 3D.`);
    console.error('Error completo al iniciar MediaPipe:',err);
  }finally{
    $('handsBtn').disabled=false;
  }
}
$('handsBtn').onclick=initHands;
let prevHand=null, lastGestureAction=0, lastVideoTime=-1;
function handLoop(){
  if(!state.hands)return;
  const video=$('camera'),canvas=$('handCanvas'),ctx=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  if(video.readyState>=2 && video.currentTime!==lastVideoTime && !state.handBusy){
    lastVideoTime=video.currentTime;
    state.handBusy=true;
    try{
      const result=state.handTracker.detectForVideo(video,performance.now());
      const landmarks=result.landmarks?.[0];
      if(landmarks){
        ctx.strokeStyle='#ffccd5';ctx.lineWidth=3;ctx.fillStyle='#ff4d6d';
        for(const chain of [[0,1,2,3,4],[0,5,6,7,8],[0,9,10,11,12],[0,13,14,15,16],[0,17,18,19,20]]){
          ctx.beginPath();chain.forEach((i,j)=>{const pt=landmarks[i],x=(1-pt.x)*w,y=pt.y*h;j?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
        }
        for(const pt of landmarks){ctx.beginPath();ctx.arc((1-pt.x)*w,pt.y*h,3.5,0,Math.PI*2);ctx.fill()}
        const wrist=landmarks[0],index=landmarks[8],thumb=landmarks[4];
        const extended=i=>Math.hypot(landmarks[i].x-wrist.x,landmarks[i].y-wrist.y)>Math.hypot(landmarks[i-2].x-wrist.x,landmarks[i-2].y-wrist.y)*1.15;
        const raised=[8,12,16,20].map(extended);
        const victory=raised[0]&&raised[1]&&!raised[2]&&!raised[3];
        const open=raised.every(Boolean);
        const pinch=Math.hypot(index.x-thumb.x,index.y-thumb.y);
        if(gestureBuilderActive){updateGestureBuilder(index,pinch);prevHand={x:index.x,y:index.y};}
        else if(victory){
          if(performance.now()-lastGestureAction>1700){
            const current=definitions.findIndex(x=>x.id===state.active);
            const next=definitions[(current+1+definitions.length)%definitions.length];
            choose(next.id);status('✌️ Gesto detectado: ahora exploras '+next.name+'.');
            lastGestureAction=performance.now();
          }
        }else if(pinch<.065){
          camera.position.z=THREE.MathUtils.clamp(camera.position.z-.055,3,12);
        }else if(!open&&prevHand){
          root.rotation.y+=(prevHand.x-index.x)*2.3;
          root.rotation.x=THREE.MathUtils.clamp(root.rotation.x+(index.y-prevHand.y)*2.3,-1.3,1.3);
        }
        prevHand={x:index.x,y:index.y};
      }else {prevHand=null; resetGesturePointer();}
    }catch(err){console.error('Error durante el seguimiento de manos:',err);state.hands=false;$('handsBtn').textContent='✋ Activar manos';status('Error al procesar la cámara con MediaPipe: '+String(err?.message||err).slice(0,300));}
    finally{state.handBusy=false}
  }
  requestAnimationFrame(handLoop);
}
async function enterVR(){if(!navigator.xr?.isSessionSupported){status('RV inmersiva no disponible aquí. Sigue explorando el modelo en 3D.');return}try{if(!await navigator.xr.isSessionSupported('immersive-vr')){status('Este dispositivo no admite immersive-vr. Puedes explorar en 3D.');return}if(state.camera)stopCamera();const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor']});await renderer.xr.setSession(session);status('Sesión de RV iniciada. Sal del visor para volver a 3D.');session.addEventListener('end',()=>status('Has vuelto al modo 3D.'))}catch(err){status('No se pudo iniciar la RV. Comprueba el visor, HTTPS y los permisos.')}}$('vrBtn').onclick=enterVR;
for(const tab of document.querySelectorAll('.tab'))tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t===tab);t.setAttribute('aria-selected',String(t===tab))});document.querySelectorAll('.tabcontent').forEach(t=>t.hidden=t.id!=='tab-'+tab.dataset.tab)});
$('checkBtn').onclick=()=>{const ok=$('stepSelect').value==='resistor';$('activityResult').textContent=ok?'¡Muy bien! La resistencia ayuda a limitar la corriente del LED. También debes cerrar el circuito y respetar la polaridad.':'Inténtalo de nuevo. Busca la pieza que limita la corriente para proteger el LED.';$('circuitVisual').classList.toggle('success',ok);$('ledVisual').textContent=ok?'🌟':'💡'};
$('missionBtn').onclick=()=>{document.querySelector('[data-tab="activity"]').click();$('explorar').scrollIntoView({behavior:'smooth'})};
function guide(){return `XR CIRCUIT LAB EDU — GUÍA DIDÁCTICA\nGrado: ${$('level').value}\nDuración: ${$('duration').value}\nModelo: ${$('modelTitle').textContent}\nObjetivo: ${$('objective').value}\n\nANTES: preguntar dónde encontramos circuitos en casa.\nDURANTE: observar el modelo, identificar sus partes y completar la misión del LED con pila, resistencia y polaridad adecuada.\nDESPUÉS: explicar por qué un circuito necesita un camino cerrado y dibujar un esquema sencillo.\nEVALUACIÓN: identificar pila, cable, resistencia y LED y explicar su función.\nSEGURIDAD: solo simulaciones y experiencias físicas de bajo voltaje supervisadas por adultos.\n\nEsta guía se generó mediante una plantilla local, sin IA externa.`} $('promptBtn').onclick=()=>{$('promptOutput').value=guide();status('Guía didáctica generada localmente.')};$('copyBtn').onclick=async()=>{try{await navigator.clipboard.writeText($('promptOutput').value||guide());status('Guía copiada al portapapeles.')}catch{status('No se pudo copiar automáticamente; selecciona el texto y cópialo manualmente.')}};$('downloadBtn').onclick=()=>{const url=URL.createObjectURL(new Blob([$('promptOutput').value||guide()],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='guia-xr-circuit-lab.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('speakBtn').onclick=()=>{if(!('speechSynthesis'in window)){status('La narración no está disponible en este navegador.');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance($('modelTitle').textContent+'. '+$('modelDescription').textContent+'. '+$('modelExample').textContent);u.lang='es-CO';u.rate=.9;speechSynthesis.speak(u)};
$('helpBtn').onclick=()=>$('help').showModal();$('closeHelp').onclick=()=>$('help').close();$('startBtn').onclick=()=>$('welcome').close();setTimeout(()=>{if(!$('welcome').open)$('welcome').showModal()},250)
window.addEventListener('pagehide',()=>{stopCamera();for(const item of state.imported)URL.revokeObjectURL(item.url)});renderCards();choose('board');resize();


// Cuatro retos progresivos. Persistencia local de los niveles desbloqueados.
const challenges=[
 {title:'Nivel 1 · Luz de explorador',difficulty:'Inicial',description:'Conoce las tres piezas esenciales para encender un LED virtual.',goal:'Pila → resistencia → LED',parts:['battery','resistor','led','motor'],slots:['battery','resistor','led'],output:'💡'},
 {title:'Nivel 2 · Linterna con interruptor',difficulty:'Básico',description:'Aprende a controlar el paso de la energía con un interruptor.',goal:'Pila → interruptor → resistencia → LED',parts:['battery','switch','resistor','led','buzzer'],slots:['battery','switch','resistor','led'],output:'🔦'},
 {title:'Nivel 3 · Alarma sonora',difficulty:'Intermedio',description:'Construye una alarma conceptual usando un zumbador de bajo voltaje.',goal:'Pila → interruptor → zumbador',parts:['battery','switch','buzzer','led','motor'],slots:['battery','switch','buzzer'],output:'🔔'},
 {title:'Nivel 4 · Ventilador pequeño',difficulty:'Avanzado',description:'Representa un circuito con interruptor y motor apropiado para una pila.',goal:'Pila → interruptor → motor',parts:['battery','switch','motor','buzzer','led'],slots:['battery','switch','motor'],output:'🌀'}
];
const partLabels={battery:'🔋 Pila',resistor:'▤ Resistencia',led:'💡 LED',motor:'⚙️ Motor',wire:'〰️ Cable',switch:'⏻ Interruptor',buzzer:'🔔 Zumbador'};
let unlocked=0;try{unlocked=Math.min(challenges.length-1,Math.max(0,Number(localStorage.getItem('xr-circuit-unlocked')||0)||0))}catch{}
let level=0,selected=null,slots={},closed=false,gestureBuilderActive=false,gesturePinched=false,gestureReleaseAt=0;
const current=()=>challenges[level];
function populateLevels(){const el=$('challengeLevel');el.replaceChildren();challenges.forEach((c,i)=>{const o=document.createElement('option');o.value=i;o.disabled=i>unlocked;o.textContent=(i>unlocked?'🔒 ':'')+c.title+' · '+c.difficulty;el.append(o)});el.value=String(level);$('levelScore').textContent='Desbloqueados: '+(unlocked+1)+' / '+challenges.length}
function loadLevel(i){if(i>unlocked||i<0||i>=challenges.length)return;level=i;selected=null;closed=false;slots=Object.fromEntries(current().slots.map(x=>[x,null]));$('challengeTitle').textContent=current().title;$('challengeDescription').textContent=current().description;$('challengeGoal').textContent=current().goal;$('levelBadge').textContent=current().difficulty;$('builderLamp').textContent=current().output;$('builderLamp').classList.remove('lit');$('nextLevel').hidden=true;
 const tray=$('partTray');tray.replaceChildren();current().parts.forEach(part=>{const b=document.createElement('button');b.type='button';b.dataset.part=part;b.draggable=true;b.textContent=partLabels[part];b.addEventListener('click',()=>selectPart(part));b.addEventListener('dragstart',e=>{selectPart(part);e.dataTransfer.setData('text/plain',part)});tray.append(b)});
 const row=$('circuitRow');row.replaceChildren();current().slots.forEach((part,i)=>{if(i){const wire=document.createElement('span');wire.className='circuit-wire';wire.textContent='━━';row.append(wire)}const b=document.createElement('button');b.type='button';b.className='circuit-slot';b.dataset.slot=part;b.addEventListener('click',()=>placePart(part,selected));b.addEventListener('dragover',e=>e.preventDefault());b.addEventListener('drop',e=>{e.preventDefault();const v=e.dataTransfer.getData('text/plain');if(Object.hasOwn(partLabels,v))placePart(part,v)});row.append(b)});populateLevels();updateBuilder('Empieza seleccionando la pila en la bandeja.');if(typeof rebuildBoard3D==='function')rebuildBoard3D()}
function selectPart(part){selected=part;document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===part)));$('partSelection').textContent='Seleccionaste '+partLabels[part]+'. Ahora señala una casilla.';if(typeof refreshBoard3D==='function')refreshBoard3D()}
function placePart(slot,part){if(!part){updateBuilder('Primero selecciona una pieza.');return}slots[slot]=part;updateBuilder(slot===part?'¡Bien! '+partLabels[part]+' está en su lugar.':'Esa pieza no corresponde a la casilla. ¡Inténtalo de nuevo!')}
function updateBuilder(message){const keys=current().slots;const good=keys.filter(k=>slots[k]===k).length;const complete=good===keys.length;const success=complete&&closed;$('builderProgress').max=keys.length;$('builderProgress').value=good;$('builderProgressLabel').textContent=good+' de '+keys.length+' piezas correctas';$('builderLamp').classList.toggle('lit',success);$('builderLamp').setAttribute('aria-label',success?'Salida activada':'Salida apagada');$('circuitSwitch').textContent=closed?'⏻ Interruptor cerrado':'⏻ Interruptor abierto';$('circuitSwitch').setAttribute('aria-pressed',String(closed));document.querySelectorAll('[data-slot]').forEach(b=>{const part=slots[b.dataset.slot];b.textContent=part?partLabels[part]:'＋ '+partLabels[b.dataset.slot];b.classList.toggle('filled',!!part);b.classList.toggle('correct',part===b.dataset.slot)});if(typeof refreshBoard3D==='function')refreshBoard3D();$('builderFeedback').textContent=success?'¡Reto completado! '+(level===challenges.length-1?'¡Superaste todos los niveles!':'Desbloqueaste el siguiente nivel.'):message|| (complete?'Todas las piezas están bien. ¡Cierra el interruptor!':'Continúa colocando las piezas.');if(success){if(level<challenges.length-1&&unlocked<level+1){unlocked=level+1;try{localStorage.setItem('xr-circuit-unlocked',String(unlocked))}catch{}}populateLevels();$('nextLevel').hidden=level===challenges.length-1}}
$('challengeLevel').addEventListener('change',e=>loadLevel(Number(e.target.value)));
$('circuitSwitch').addEventListener('click',()=>{closed=!closed;updateBuilder()});$('builderReset').addEventListener('click',()=>loadLevel(level));$('nextLevel').addEventListener('click',()=>{loadLevel(level+1);$('constructor').scrollIntoView({behavior:'smooth'})});// El primer nivel se inicializa DESPUÉS de crear el renderizador 3D.
// Control gestual de la zona de ensamblaje: el índice mueve un cursor; una pinza
// hace clic en el elemento bajo el cursor, con antirrebote para evitar dobles clics.
function resetGesturePointer(){if(typeof cancelHeld==='function')cancelHeld();$('handCursor').style.display='none';gesturePinched=false;$('board3dCursor').style.display='none';$('gestureState').textContent=gestureBuilderActive?'Muestra tu mano frente a la cámara':'Gestos desactivados'}
// El área de la cámara y el tablero están en columnas diferentes.
// Mapeamos TODA la imagen de la cámara directamente al canvas 3D, no al panel padre.
function updateGestureBuilder(index,pinch){
 const nx=THREE.MathUtils.clamp(1-index.x,0,1),ny=THREE.MathUtils.clamp(index.y,0,1);
 $('handCursor').style.display='none';
 updateBoard3DGesture(nx,ny,pinch);
}
$('gestureBuildBtn').addEventListener('click',async()=>{if(gestureBuilderActive){gestureBuilderActive=false;resetGesturePointer();$('gestureBuildBtn').textContent='✋ Ensamblar con MediaPipe';return}if(!state.hands){await initHands();if(!state.hands){$('gestureState').textContent='No fue posible iniciar MediaPipe. Usa los botones para ensamblar.';return}}gestureBuilderActive=true;$('gestureBuildBtn').textContent='⏹ Detener ensamblaje gestual';$('buildCamera').srcObject=state.handStream;try{await $('buildCamera').play()}catch{}$('constructor').scrollIntoView({behavior:'smooth'});$('gestureState').textContent='Mueve tu índice: el cursor sobre la placa seguirá tu mano. Haz pinza encima de una pieza para agarrarla.'});


// PROTOBOARD 3D. Los conectores son objetivos pedagógicos, no una simulación
// de electricidad ni de las conexiones internas reales de una protoboard.
const bCanvas=$('board3d'),bScene=new THREE.Scene();
const bCamera=new THREE.PerspectiveCamera(42,1,.1,100);bCamera.position.set(0,5.8,9.7);bCamera.lookAt(0,0,0);
const bRenderer=new THREE.WebGLRenderer({canvas:bCanvas,antialias:true,alpha:true});
bRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));bRenderer.outputColorSpace=THREE.SRGBColorSpace;
bScene.add(new THREE.HemisphereLight(0xffffff,0x854057,2.4));const bLight=new THREE.DirectionalLight(0xffffff,2.3);bLight.position.set(-3,9,6);bScene.add(bLight);
const bRoot=new THREE.Group();bScene.add(bRoot);const bHits=[],bRay=new THREE.Raycaster(),bPointer=new THREE.Vector2();
let bObjects=[],bSelected=null,bGestureDown=false,bGestureLast=0,bDrag=null,heldPart=null,heldGhost=null;
function bShape(parent,geo,col,x,y,z,meta){const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:col,metalness:.12,roughness:.5}));m.position.set(x,y,z);parent.add(m);if(meta){m.userData.pick=meta;bHits.push(m)}return m}
function bBox(parent,w,h,d,col,x,y,z,meta){return bShape(parent,new THREE.BoxGeometry(w,h,d),col,x,y,z,meta)}
function bCyl(parent,r,h,col,x,y,z,meta){return bShape(parent,new THREE.CylinderGeometry(r,r,h,18),col,x,y,z,meta)}
function bLine(parent,a,c,color=0xa4133c){const v=new THREE.Vector3(...a),w=new THREE.Vector3(...c),d=w.clone().sub(v);const m=bCyl(parent,.035,d.length(),color,...v.clone().add(w).multiplyScalar(.5).toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize())}
function bPart(part,parent,x,z,meta){const g=new THREE.Group();g.position.set(x,.38,z);parent.add(g);const colorMap={battery:0xc9184a,resistor:0xffb3c1,led:0xff4d6d,switch:0x590d22,motor:0x8e8e99,buzzer:0x800f2f};
 const col=colorMap[part]||0xa4133c;
 const body=bBox(g,.7,.46,.53,col,0,0,0,meta);
 if(part==='battery'){bCyl(g,.12,.11,0xffd27e,.23,.29,0,meta);bBox(g,.12,.13,.56,0x590d22,-.25,0,0,meta)}
 if(part==='resistor'){for(const [xx,cc] of [[-.17,0x800f2f],[0,0xffd27e],[.17,0x590d22]])bBox(g,.07,.48,.54,cc,xx,0,0,meta)}
 if(part==='led'){bCyl(g,.23,.33,0xff758f,0,.36,0,meta);bCyl(g,.09,.09,0xffd27e,0,.56,0,meta)}
 if(part==='switch'){bBox(g,.2,.28,.18,0xffd27e,0,.34,0,meta)}
 if(part==='motor'){bCyl(g,.26,.62,0xb7b7c5,0,.27,0,meta)}
 if(part==='buzzer'){bCyl(g,.27,.2,0x590d22,0,.32,0,meta)}
 return g;
}
function rebuildBoard3D(){cancelHeld();bRoot.clear();bHits.length=0;bObjects=[];bSelected=null;
 bBox(bRoot,7.7,.24,3.9,0xffccd5,0,0,0);bBox(bRoot,7.3,.03,.055,0xc9184a,0,.145,-1.72);bBox(bRoot,7.3,.03,.055,0x3466a1,0,.145,1.72);
 for(let x=-3.45;x<=3.45;x+=.22)for(const z of [-1.25,-.9,-.55,.55,.9,1.25])bCyl(bRoot,.026,.025,0x987e85,x,.14,z);
 const n=current().slots.length,spacing=Math.min(1.75,6.2/n),start=-(n-1)*spacing/2;
 current().slots.forEach((part,i)=>{const x=start+i*spacing;const hit={kind:'slot',id:part};bBox(bRoot,1.3,.09,1.04,0xfff0f3,x,.22,0,hit);bBox(bRoot,1.13,.025,.83,0xff8fa3,x,.28,0,hit);bObjects.push({kind:'slot',id:part,x,z:0});if(i>0)bLine(bRoot,[x-spacing+.67,.34,0],[x-.67,.34,0]);});
 const available=current().parts,step=7.1/available.length;available.forEach((part,i)=>{const x=-3.55+step*(i+.5);const meta={kind:'part',id:part};bPart(part,bRoot,x,2.8,meta);bObjects.push({kind:'part',id:part,x,z:2.8});});
 bBox(bRoot,7.7,.12,1.25,0xffb3c1,0,-.18,2.8);
 refreshBoard3D();resizeBoard3D();
}
function refreshBoard3D(){if(!bRoot||!bObjects.length)return;
 // Only replace the mounted 3D components; retain the protoboard geometry.
 for(const child of [...bRoot.children])if(child.userData.mounted){bRoot.remove(child);child.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()})}
 for(const entry of bObjects.filter(o=>o.kind==='slot')){const part=slots[entry.id];if(part){const g=bPart(part,bRoot,entry.x,entry.z,null);g.userData.mounted=true;g.position.y=.55;}}
 $('board3dStatus').textContent=selected?'Pieza seleccionada: '+partLabels[selected]+'. Selecciona una posición de la placa.':'Elige una pieza en la bandeja 3D.';
}
function resizeBoard3D(){const r=bCanvas.getBoundingClientRect();if(!r.width||!r.height)return;bRenderer.setSize(r.width,r.height,false);bCamera.aspect=r.width/r.height;bCamera.updateProjectionMatrix()}
new ResizeObserver(resizeBoard3D).observe($('board3dWrap'));
function pickBoard(nx,ny){
 // Tolerancia táctil para los gestos: las piezas pequeñas son difíciles de acertar
 // mediante un rayo 3D exacto cuando MediaPipe presenta pequeñas oscilaciones.
 bRoot.updateMatrixWorld(true);bCamera.updateMatrixWorld(true);
 let best=null, bestD=Infinity;
 for(const entry of bObjects){
   if(entry.kind==='part' && slots[entry.id])continue;
   const v=new THREE.Vector3(entry.x,entry.kind==='part'?.72:.36,entry.z);
   bRoot.localToWorld(v);v.project(bCamera);
   if(v.z>1||v.z< -1)continue;
   const sx=(v.x+1)/2,sy=(1-v.y)/2;
   const dx=(nx-sx)*bCanvas.clientWidth,dy=(ny-sy)*bCanvas.clientHeight;
   const dist=Math.hypot(dx,dy);
   const tolerance=entry.kind==='part'?Math.max(48,bCanvas.clientWidth*.065):Math.max(58,bCanvas.clientWidth*.075);
   if(dist<tolerance && dist<bestD){best=entry;bestD=dist}
 }
 if(best)return {kind:best.kind,id:best.id};
 bPointer.set(nx*2-1,1-ny*2);bRay.setFromCamera(bPointer,bCamera);
 const hits=bRay.intersectObjects(bHits,false);
 return hits[0]?.object.userData.pick||null;
}
function actBoard(nx,ny){const hit=pickBoard(nx,ny);if(!hit){$('board3dStatus').textContent='Apunta a una pieza o posición resaltada.';return}if(hit.kind==='part'){bSelected=hit.id;selectPart(hit.id)}else if(hit.kind==='slot'){placePart(hit.id,bSelected||selected)} }
function canvasNorm(e){const r=bCanvas.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
bCanvas.addEventListener('pointerdown',e=>{bCanvas.setPointerCapture(e.pointerId);bDrag={x:e.clientX,y:e.clientY,moved:false}});
bCanvas.addEventListener('pointermove',e=>{if(!bDrag)return;const dx=e.clientX-bDrag.x;if(Math.abs(dx)>6||Math.abs(e.clientY-bDrag.y)>6)bDrag.moved=true;if(bDrag.moved){bRoot.rotation.y+=dx*.005;bDrag.x=e.clientX;bDrag.y=e.clientY}});
bCanvas.addEventListener('pointerup',e=>{if(!bDrag?.moved){const [x,y]=canvasNorm(e);actBoard(x,y)}bDrag=null});
bCanvas.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('board3dStatus').textContent='Para accesibilidad, utiliza los botones de piezas y casillas debajo del tablero.'}});
$('board3dResetView').addEventListener('click',()=>{bRoot.rotation.set(0,0,0);bCamera.position.set(0,5.8,9.7);bCamera.lookAt(0,0,0)});
// Arrastre continuo: pinza sobre una pieza, mantener mientras se mueve y soltar sobre una casilla.
// Dos umbrales separados evitan que el ruido de cámara produzca soltados involuntarios.
function cancelHeld(){if(heldGhost){bRoot.remove(heldGhost);heldGhost.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});heldGhost=null}heldPart=null}
function ghostAt(nx,ny){if(!heldGhost)return; bPointer.set(nx*2-1,1-ny*2);bRay.setFromCamera(bPointer,bCamera);const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-.65);const point=new THREE.Vector3();if(bRay.ray.intersectPlane(plane,point)){bRoot.worldToLocal(point);heldGhost.position.set(THREE.MathUtils.clamp(point.x,-3.6,3.6),.65,THREE.MathUtils.clamp(point.z,-.8,3.1))}}
function beginHeld(part,nx,ny){cancelHeld();heldPart=part;heldGhost=bPart(part,bRoot,0,0,null);heldGhost.traverse(o=>{if(o.material){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.72;o.material.emissive?.setHex(0x441122)}});ghostAt(nx,ny);$('gestureState').textContent='👌 ¡Pieza agarrada! Mantén la pinza y muévela hasta la casilla.'}
function endHeld(nx,ny){if(!heldPart)return;const part=heldPart;const hit=pickBoard(nx,ny);cancelHeld();if(hit?.kind==='slot'){if(hit.id===part){placePart(hit.id,part);$('gestureState').textContent='¡Excelente! Colocaste '+partLabels[part]+'.';}else{$('gestureState').textContent='Esa casilla no corresponde a '+partLabels[part]+'. Inténtalo de nuevo.';$('builderFeedback').textContent='La pieza volvió a la bandeja: busca la posición correcta.'}}else{$('gestureState').textContent='Soltaste fuera de la placa. La pieza regresó a la bandeja.'}}
function updateBoard3DGesture(nx,ny,pinch){const cur=$('board3dCursor');cur.style.display='block';cur.style.left=(nx*100)+'%';cur.style.top=(ny*100)+'%';const pressed=gesturePinched?pinch<.105:pinch<.075;cur.classList.toggle('pinch',pressed);const hit=pickBoard(nx,ny);
 if(pressed&&!gesturePinched){if(hit?.kind==='part')beginHeld(hit.id,nx,ny);else $('gestureState').textContent='👌 Sitúa el cursor sobre una pieza de la bandeja antes de cerrar la pinza.'}
 else if(pressed&&heldPart){ghostAt(nx,ny);$('gestureState').textContent='👌 Arrastrando '+partLabels[heldPart]+' · abre los dedos encima de su casilla.'}
 else if(!pressed&&gesturePinched&&heldPart){endHeld(nx,ny)}
 else if(!pressed&&!heldPart){$('gestureState').textContent=hit?(hit.kind==='part'?'👌 Haz pinza para agarrar '+partLabels[hit.id]:'Mueve aquí la pieza manteniendo la pinza'):'Acerca tu mano a una pieza 3D y haz pinza'}
 gesturePinched=pressed;bGestureDown=pressed;
}

function boardLoop(){bRenderer.render(bScene,bCamera);requestAnimationFrame(boardLoop)}
loadLevel(0);boardLoop();

// Navegación accesible desde la portada y la guía de gestos.
const welcomeGuideButton=document.getElementById('welcomeGuide');
if(welcomeGuideButton)welcomeGuideButton.addEventListener('click',()=>{document.getElementById('welcome').close();document.getElementById('gestos').scrollIntoView({behavior:'smooth'});});
document.getElementById('goHands')?.addEventListener('click',()=>{document.getElementById('explorar').scrollIntoView({behavior:'smooth'});document.getElementById('handsBtn').focus({preventScroll:true});});
document.getElementById('goBuilder')?.addEventListener('click',()=>{document.getElementById('constructor').scrollIntoView({behavior:'smooth'});document.getElementById('gestureBuildBtn').focus({preventScroll:true});});
