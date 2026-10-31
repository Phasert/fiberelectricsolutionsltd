import {spawn} from "node:child_process";

const run=(command,args,options={})=>new Promise((resolve,reject)=>{const child=spawn(command,args,{stdio:"inherit",shell:false,...options});child.on("exit",code=>code===0?resolve():reject(new Error(`${command} exited ${code}`)));child.on("error",reject)});
await run(process.execPath,["scripts/seed-firebase-emulator.mjs"]);
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-p","3100"],{stdio:"inherit",shell:false,env:{...process.env,PORT:"3100",QUOTE_SUBMISSIONS_LIVE_ENABLED:"false",EDITORIAL_MEDIA_LIVE_ENABLED:"false"}});
try{
  for(let attempt=0;attempt<60;attempt++){try{const response=await fetch("http://127.0.0.1:3100");if(response.ok)break}catch{}if(attempt===59)throw new Error("LOCAL_SERVER_TIMEOUT");await new Promise(resolve=>setTimeout(resolve,500))}
  await run(process.execPath,["scripts/audit-http-load.mjs"],{env:{...process.env,AUDIT_BASE_URL:"http://127.0.0.1:3100"}});
}finally{server.kill("SIGTERM")}
