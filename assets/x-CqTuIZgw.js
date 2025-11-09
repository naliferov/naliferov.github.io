import{_ as f}from"./index-CpbTPoPD.js";const e={};{const[{Redis:t},{ulid:n},o]=await Promise.all([f(()=>import("https://esm.sh/@upstash/redis"),[]),f(()=>import("https://esm.sh/ulid?bundle"),[]),f(()=>import("https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"),[])]);e.redis=new t({url:"https://holy-redfish-7937.upstash.io",token:localStorage.getItem("token")||"Ah8BAAIgcDH8iJl1rQK-FZD7U3lrmcixchbsva9z2HQRDxtGlxLOrA"}),e.ulid=n,e.vue=o}{const t=document.createElement("link");t.rel="stylesheet",t.href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",document.head.append(t)}{const{promise:t,resolve:n}=Promise.withResolvers(),o=document.createElement("script");o.src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js",o.onload=()=>{require.config({paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs"}}),require(["vs/editor/editor.main"],n)},document.head.append(o),await t}{class t{get(o){return localStorage.getItem(o)}set(o,a){localStorage.setItem(o,a)}del(o){localStorage.removeItem(o)}on(o){this.set(o,"1")}off(o){this.del(o)}}e.kvRepo=new t}e.track=e.vue.ref("sys");e.sys=e.vue.ref({});e.user=e.vue.ref({});e.openedObjects=e.vue.ref([]);e.showSideBar=e.vue.ref(!0);e.showFileInput=e.vue.ref(!1);e.set=async(t,n)=>await e.redis.hset(e.track.value,{[t]:n});e.get=async t=>await e.redis.redis.hget(e.track.value,t);e.del=async t=>await e.redis.redis.hdel(e.track.value,t);{const t=Object.values(await e.redis.hgetall(e.track.value));t.sort((n,o)=>(n.name>o.name)-(n.name<o.name)),e.sys.value=Object.fromEntries(t.map(n=>[n.id,n]))}{const t=await e.kvRepo.get("openedObjects")??[];e.openedObjects.value=typeof t=="string"?JSON.parse(t):t,e.openedObjects.value=e.openedObjects.value.filter(n=>n.objectId&&e.sys.value[n.objectId]),e.vue.watch(e.openedObjects,n=>{const o=n.map(a=>e.vue.toRaw(a));e.kvRepo.set("openedObjects",JSON.stringify(o))},{deep:!0})}{const t="showSideBar";e.vue.watch(e.showSideBar,n=>n?e.kvRepo.on(t):e.kvRepo.off(t))}{const t="showFileInput";e.kvRepo.get(t)&&(e[t].value=!0),e.vue.watch(e[t],n=>n?e.kvRepo.on(t):e.kvRepo.off(t))}e.createFnFromCode=async(t,n="")=>{};e.runCode=async(t,n,o)=>{try{return await(await e.createFnFromCode(t,o))({ulid:e.ulid,Vue:e.vue,vue:e.vue,runByName:e.runByName,runById:e.runById,getById:e.getById,getByName:e.getByName,...n})}catch(a){console.error("runCode erro >> ",a,t)}};e.getById=t=>e.sys.value[t];e.getByName=(t,n="sys")=>{const a=(n==="sys"?e.sys:e.user).value;for(const s in a){const i=a[s];if(i.name===t)return i}};e.runById=async(t,n={})=>{const o=e.getById(t);if(o&&o.code)return await e.runCode(o.code,n,o.name)};e.runByName=async(t,n={})=>{const o=e.getByName(t);if(o&&o.code)return await e.runCode(o.code,n,o.name)};e.getOpenedObject=t=>{for(const n of e.openedObjects.value)if(n.id===t)return n};e.updateObject=t=>{const o=(t.repoName==="sys"?e.sys:e.user).value[t.objectId];if(!o)return;const a=e.vue.toRaw(o);t.code&&(a.code=t.code),t.data&&(a.data=t.data),(t.code||t.data)&&e.set(a.id,a);const s=e.getOpenedObject(t.openedObjectId);s&&(t.position&&(s.position=t.position),t.frameParams&&(s.frameParams=t.frameParams))};e.createCMDs=(t={})=>{const n={add:{f:async o=>{const[a]=o;if(e.getByName(a)){console.log(`object with name ${a} already exists`);return}const i={id:e.ulid(),name:a.trim()};o.bin&&(i.bin=o.bin),e.sys.value[i.id]=i,await e.set(i.id,i)},desc:"Function for adding new objects in list of functions. Example: add {new objectName}"},del:{f:async([o])=>{const a=e.getByName(o);if(a){delete e.sys.value[a.id],await e.del(a.id);return}console.log(`object with name ${o} not found`)},desc:"Function for deleting objects from the list by name. Example: del {objectName}"},delById:{f:async([o])=>await e.del(o),desc:"Function for delete object by id. Example: mv oldName newName"},mv:{f:async([o,a])=>{const s=e.getByName(o);s&&(s.name=a,await e.set(s.id,s))},desc:"Function for rename object. Example: mv oldName newName"},setProp:{f:async([o,a,s])=>{const i=e.getByName(o);!i||!a||!s||(i[a.trim()]=s.trim(),await e.set(i.id,i))},desc:"Find object by name, set prop and value. Example"},delProp:{f:async([o,a])=>{const s=e.getByName(o);s&&(delete s[a],await e.set(s.id,s))},desc:"Find object by name, del prop. Example"},open:{f([o,a]){const s=e.getByName(o);!s||!a||e.openedObjects.value.push({repoName:"sys",id:e.ulid(),objectId:s.id,opener:a})},desc:"Function for open objects as app. Example: run objectName arg1 arg2 ..."},log:{f:async([o])=>{const{toRaw:a}=e.vue,s=e.getByName(o);s&&console.log(a(s))},desc:"Function for logging object by name. Example: run functionName arg1 arg2 ..."},fileInput:{f:async()=>{e.showFileInput.value=!e.showFileInput.value},desc:"Function for logging object by name. Example: run functionName arg1 arg2 ..."},exportDump:{f:async([])=>{const o=document.createElement("a");o.href=URL.createObjectURL(new Blob([JSON.stringify(e.sys.value)],{type:"application/json"})),o.download="dump.json",o.click(),URL.revokeObjectURL(o.href)},desc:"Export dump"}};return Object.assign(n,t),n};e.sysCMDs=e.createCMDs({repoName:"sys"});e.userCMDs=e.createCMDs({repoName:"user",async"import-dump"(){}});e.readFileAsBase64=async t=>{const{promise:n,resolve:o,reject:a}=Promise.withResolvers(),s=new FileReader;return s.readAsDataURL(t),s.onload=()=>{const i=s.result.split(",")[1];o(i)},s.onerror=a,n};{const{createApp:t,ref:n,onMounted:o}=e.vue,a=(await f(async()=>{const{default:r}=await import("./frame-64olUM7e.js");return{default:r}},[])).default,s={name:"ObjectManager",props:["repoName","objects","openObject"],template:`
      <div class="object-manager">
        <div class="heading">System Objects</div>
        <div 
          v-for="(o, objectId) in objects" 
          :key="objectId"
          class="object"
          @click="openObject(repoName, objectId)"
        >
          {{o.name}}
        </div>
      </div>
    `},h={name:"openedObjects",components:{MonacoEditor:{name:"MonacoEditor",props:["repoName","objectId","openedObjectId","code","position"],setup(r){const p=n(null);return o(()=>{const l=monaco.editor.create(p.value,{value:r.code,language:"javascript",theme:"vs-dark",automaticLayout:!0,fontFamily:"Jetbrains Mono",fontSize:15});l.onDidChangeModelContent(v=>{e.updateObject({repoName:r.repoName,objectId:r.objectId,openedObjectId:r.openedObjectId,code:l.getValue(),position:l.getPosition()})}),r.position&&l.revealPositionInCenter(r.position),l.layout()}),{codeContainer:p}},template:`
    <div ref="codeContainer" style="margin: 0; height: ${window.innerHeight}px"></div>`},Frame:a},setup(){return{prepareObjects:()=>{const p=[];for(const l of e.openedObjects.value)p.push({...l,object:e.getById(l.objectId)});return p},height:window.innerHeight}},template:`
      <div class="opened-objects" :style="{ height: height + 'px', overflow: 'auto' }">

        <div v-for="o in prepareObjects()" :key="o.id">
          <Frame v-if="o.opener === 'frame'" :openedObject="o"/>
          <div v-else>
            <div :id="o.id" class="object-name">{{o.object.name}}</div>
            <MonacoEditor
              :repoName="o.repoName"
              :objectId="o.object.id"
              :openedObjectId="o.id"
              :code="o.object.code"
              :position="o.position"
            />
          </div>
          
        </div>
        
      </div>
    `},w={name:"Main",components:{ObjectManager:s,OpenedObjectsComponent:h},setup(){const r=n(null),p=n(null),l="sysInput",v=async(d,c)=>{const u=await e.getById(c),m={repoName:d,id:e.ulid(),objectId:c};u.bin&&(m.opener="frame"),e.openedObjects.value.push(m)},O=d=>{e.openedObjects.value=e.openedObjects.value.filter((c=>c.id!==d))},I=d=>{const c=document.getElementById(d);c&&c.scrollIntoView()},B=d=>{d.code==="Enter"&&d.preventDefault()},x=async d=>{if(d.code!=="Enter")return;const c=r.value.textContent;e.kvRepo.set(l,c);const[u,...m]=c.split(" "),y=e.sysCMDs,b=p.value?p.value.files[0]:null;if(m.bin=b?await e.readFileAsBase64(b):null,m.binMeta=b||null,!y[u])return;const g=y[u];g.f&&g.f(m)},N=d=>{const c=[];for(const u of d)c.push({...u,object:e.getById(u.objectId)});return c},k=()=>e.showSideBar.value=!e.showSideBar.value;o(()=>{e.vue.watch(e.showSideBar,async d=>{if(!d)return;const c=e.kvRepo.get(l)||"Input cmd";r.value&&(r.value.textContent=c)},{immediate:!0,flush:"post"})});const j=document.createElement("style");return j.textContent=`
        :root {
          --std-margin: 12px;
          --font: "JetBrains Mono", monospace;
        }
        body {
          font-family: var(--font);
          margin: 0;
        }

        #app {
          
        }
        .app-container { 
          display: flex;
        }
        .sidebar-switch {
          cursor: pointer;
          color: white;
          background: white;
        }
        .left-sidebar {
          font-size: 16px;
          color: #333333;
        }
        .cmd-input {
          padding: 0 var(--std-margin);
          width: 180px;
          background: #a7d0dd;
          white-space: nowrap;
          outline: none;
        }
        .file-input {
          margin: var(--std-margin) 0 0 0
        }
        .object-name {
          background: #e0e0e0;
        }
        
        .object-manager {
          padding: 0 var(--std-margin);
        }
        .object-manager .heading {
          font-weight: bold;
          margin: 10px 0;
        }
        .opened-objects-list {
          color: #333333; 
          font-family: var(--font);
          font-size: 16px;
          padding: 0 var(--std-margin);
        }
        .opened-objects-list .heading { 
          font-weight: bold;
          margin: 10px 0;
          white-space: nowrap;
        }

        .opened-objects { 
          flex: 1;
        }

        .frames-container {
          position: absolute;
        }
        .frame {
          position: absolute;
          font-family: var(--font);
          font-size: 16px;
        }
        .object { 
          cursor: pointer;
          white-space: nowrap;
        }
        input {
          font-family: var(--font);
          font-size: 16px
        }
      `,document.head.appendChild(j),{sys:e.sys,user:e.user,openObject:v,closeObject:O,scrollToObject:I,openedObjects:e.openedObjects,prepareObjects:N,toggleSideBar:k,inputTextDom:r,inputFileDom:p,onKeyDown:B,onKeyUp:x,showSideBar:e.showSideBar,showFileInput:e.showFileInput}},template:`
      <div class="app-container">
        <div class="left-sidebar" v-if="showSideBar">
          <div
          class="cmd-input" 
          ref="inputTextDom"
          contenteditable="plaintext-only"
          @keydown="onKeyDown($event)"
          @keyup="onKeyUp($event)"
          ></div>
          <input class="file-input" v-if="showFileInput" ref="inputFileDom" type="file">

          <div class="opened-objects-list">
            <div class="heading">Opened Objects</div>

            <div class="object"
              v-for="o in prepareObjects(openedObjects)" 
              :key="o.id"
              @click="scrollToObject(o.id)"
              @dblclick="closeObject(o.id)">
                {{ o.object.name }}
                <span v-if="o.opener"> ({{o.opener }})<span>
            </div>
          </div>

          <ObjectManager 
            repoName="sys"
            :objects="sys"
            :openObject="openObject" 
          />
        </div>

        <OpenedObjectsComponent/>
      </div> 
    `};e.app=t(w)}export{e as default};
