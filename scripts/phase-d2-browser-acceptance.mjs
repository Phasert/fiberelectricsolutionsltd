import { chromium } from "playwright-core";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const baseURL="http://localhost:3000",output=join(tmpdir(),"fes-d2-acceptance");
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true,args:["--disable-extensions","--no-first-run"]});
const context=await browser.newContext({baseURL,viewport:{width:1440,height:1000},colorScheme:"light"});
const page=await context.newPage(),consoleErrors=[],failedRequests=[],unexpectedResponses=[];
page.on("console",message=>{if(message.type()==="error")consoleErrors.push(message.text())});
page.on("pageerror",error=>consoleErrors.push(error.message));
page.on("requestfailed",request=>{if(request.failure()?.errorText!=="net::ERR_ABORTED")failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText??""}`)});
page.on("response",response=>{if(response.status()>=400&&!response.url().includes("/__nextjs_original-stack-frames"))unexpectedResponses.push(`${response.status()} ${response.url()}`)});
const result={output,desktop:[],mobile:[],features:{},consoleErrors,failedRequests,unexpectedResponses};
const checkLayout=async(label)=>{const metrics=await page.evaluate(()=>({url:location.pathname,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll("h1").length,main:Boolean(document.querySelector("main"))}));if(metrics.scrollWidth>metrics.width)throw new Error(`${label}: horizontal overflow ${metrics.scrollWidth}>${metrics.width}`);return{label,...metrics}};
const image=async(name,colour)=>({name,mimeType:"image/png",buffer:await sharp({create:{width:960,height:640,channels:3,background:colour}}).png().toBuffer()});

try{
 await page.goto("/admin/login");
 await page.getByLabel("Email address").fill("approved@example.test");
 await page.locator('input[name="password"]').fill("Local-test-password-42");
 await page.getByRole("button",{name:"Sign in",exact:true}).click();
 try{await page.waitForURL(/\/admin(?:\/)?$/,{timeout:15000})}catch{throw new Error(`Login did not redirect: ${await page.locator('body').innerText()} ${JSON.stringify({consoleErrors,failedRequests,unexpectedResponses})}`)}
 result.features.login="approved emulator administrator authenticated";

 await page.goto("/admin/media");
 await page.getByText("Emulator only",{exact:true}).waitFor();
 await page.getByRole("button",{name:"Upload images"}).click();
 await page.locator('input[type="file"]').first().setInputFiles({name:"invalid.gif",mimeType:"image/gif",buffer:Buffer.from("not an image")});
 await page.getByText("Use a JPG, PNG or WebP file.").waitFor();
 await page.getByRole("button",{name:"Remove invalid.gif"}).click();
 result.features.uploadFailure="unsupported image feedback is visible and recoverable";
 const files=[await image("d2-browser-one.png","#77233a"),await image("d2-browser-two.png","#1f4f78"),await image("d2-browser-unpublished.png","#476b3c")];
 const uploadInput=page.locator('input[type="file"]').first();await uploadInput.setInputFiles(files);
 const altInputs=page.locator('input[placeholder="Alternative text (required)"]');
 try{await altInputs.first().waitFor({timeout:10000})}catch{const selected=await uploadInput.evaluate(input=>[...(input.files??[])].map(file=>file.name));throw new Error(`Upload queue did not render for ${JSON.stringify(selected)} ${JSON.stringify({consoleErrors,failedRequests,unexpectedResponses})}: ${await page.locator('body').innerText()}`)}
 for(let index=0;index<3;index++)await altInputs.nth(index).fill(`D2 browser image ${index+1}`);
 await page.getByRole("button",{name:"Upload valid images"}).click();
 await page.getByText(/Valid images were saved/).waitFor({timeout:30000});
 await page.getByText("Ready",{exact:true}).first().waitFor();
 result.features.mediaUpload="three PNG files processed to Ready through the Storage emulator";
 result.desktop.push(await checkLayout("Media Library desktop"));
 await page.screenshot({path:join(output,"media-desktop.png"),fullPage:true,caret:"initial"});
 const mediaResponse=await page.evaluate(()=>fetch("/api/admin/media",{cache:"no-store"}).then(response=>response.json()));
 const first=mediaResponse.items.find(item=>item.name==="d2-browser-one.png"),second=mediaResponse.items.find(item=>item.name==="d2-browser-two.png"),unpublished=mediaResponse.items.find(item=>item.name==="d2-browser-unpublished.png");
 if(!first||!second||!unpublished)throw new Error("Uploaded media records were not listed");

 await page.goto("/admin/projects/new");
 for(const name of [first.name,second.name]){await page.getByLabel(name,{exact:true}).check();await page.getByRole("button",{name:"Add to gallery"}).click()}
 await page.getByLabel("Alternative text").nth(0).fill("Completed electrical installation");
 await page.getByLabel("Alternative text").nth(1).fill("Completed fiber installation");
 await page.getByLabel("Caption").nth(0).fill("Primary project view");
 await page.getByLabel("Caption").nth(1).fill("Secondary project view");
 await page.getByLabel("Cover").nth(1).check();
 await page.getByRole("button",{name:"Move image up"}).nth(1).click();
 await page.getByLabel("Project title").fill("D2 Browser Acceptance Project");
 await page.getByLabel("Project slug").fill("d2-browser-acceptance-project");
 await page.getByLabel("Project summary").fill("Emulator-only project created to verify Phase D2 browser media behaviour.");
 await page.getByLabel("General location").fill("Emulator fixture");
 await page.getByLabel("Project date / period").fill("October 2026");
 await page.getByLabel("Published",{exact:true}).check();
 await page.getByRole("button",{name:"Create project"}).click();
 await page.waitForURL(url=>/^\/admin\/projects\/(?!new$)[A-Za-z0-9_-]+$/.test(url.pathname));
 const projectId=page.url().split("/").pop();
 result.features.projectGallery="selection, two-item ordering, captions, alt text, explicit cover and publication persisted";

 const createArticle=async(slug,coverMediaId)=>page.evaluate(async({slug,coverMediaId})=>{const response=await fetch("/api/admin/resources",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:slug.includes("fallback")?"Electrical Planning Guide":"Electrical Safety Guide",slug,kind:"FES article",category:"Electrical",summary:"Practical information for planning safe electrical work with a qualified team.",source:"",externalUrl:"",status:"Published",featured:false,publishedAt:"2026-10-20",coverImage:"",coverMediaId,content:{type:"doc",content:[{type:"paragraph",content:[{type:"text",text:"Plan electrical work carefully and use qualified professionals for installation and inspection."}]}]}})});return{status:response.status,body:await response.json()}},{slug,coverMediaId});
 const article=await createArticle("d2-browser-media-article",first.id),fallbackArticle=await createArticle("d2-browser-fallback-article",null);
 if(article.status!==201||fallbackArticle.status!==201)throw new Error(`Resource fixture creation failed ${article.status}/${fallbackArticle.status}`);
 await page.goto(`/admin/resources/${article.body.id}`);
 await page.getByLabel(first.name,{exact:true}).check();
 result.features.resourceCover="Ready Media Library cover is selectable and persists on a published article";

 await page.goto("/admin/content");
 if(await page.getByText("Choose an existing Media Library item.").count()===0)throw new Error("Site-content media selector missing");
 result.features.siteContent="page/service editor exposes Ready Media Library selection";
 await page.goto("/admin/settings");
 await page.getByRole("tab",{name:/Business information/}).waitFor();
 result.features.businessSettings="business and contact settings remain available while developer-owned branding and search metadata stay out of the CMS";

 await page.goto("/admin/media");
 const conflictConsoleStart=consoleErrors.length,conflictResponseStart=unexpectedResponses.length;
 page.once("dialog",dialog=>dialog.accept());
 await page.getByRole("button",{name:`Remove ${first.name}`}).click();
 await page.getByText(/still referenced/).waitFor();
 consoleErrors.splice(conflictConsoleStart);
 unexpectedResponses.splice(conflictResponseStart);
 result.features.deletionConflict="referenced deletion is blocked with an explicit conflict message";

 await page.goto("/projects/d2-browser-acceptance-project");
 const projectImages=page.locator('img[src*="/media/"], img[src*="%2Fmedia%2F"]');
 await projectImages.first().waitFor();
 if(await projectImages.count()<2)throw new Error("Published project gallery derivatives missing");
 result.features.publicProjects="published cover/gallery use controlled versioned derivative URLs";
 result.desktop.push(await checkLayout("Public project desktop"));
 await page.screenshot({path:join(output,"project-desktop.png"),fullPage:true,caret:"initial"});
 await page.goto("/resources/d2-browser-media-article");
 await page.locator('img[src*="/media/"], img[src*="%2Fmedia%2F"]').first().waitFor();
 result.features.publicResources="published article cover uses controlled derivative URL";
 result.desktop.push(await checkLayout("Public article desktop"));
 await page.goto("/resources/d2-browser-fallback-article");
 await page.locator('img[src^="/images/"]').first().waitFor();
 result.features.fallback="published article without media retains approved static fallback";
 const negativeStart=unexpectedResponses.length;
 if((await page.request.get(`/media/${unpublished.id}/sm?v=unknown`)).status()!==404)throw new Error("Unpublished derivative was exposed");
 if((await page.request.get(`/api/admin/media/${unpublished.id}/file`)).status()!==200)throw new Error("Approved admin could not read private preview");
 unexpectedResponses.splice(negativeStart);
 result.features.privacy="unreferenced derivative returns 404; private original remains admin-session-only";

 const anonymous=await browser.newContext({baseURL});
 const privateStatus=(await anonymous.request.get(`/api/admin/media/${unpublished.id}/file`)).status();
 await anonymous.close();
 if(privateStatus!==401)throw new Error(`Anonymous private original returned ${privateStatus}`);
 result.features.privacy="unreferenced derivative returns 404; private original is denied without an administrator session";

 for(const viewport of [{width:390,height:844},{width:360,height:740}]){
  await page.setViewportSize(viewport);
  for(const [label,path] of [["Media Library","/admin/media"],["Project editor",`/admin/projects/${projectId}`],["Resource editor",`/admin/resources/${article.body.id}`],["Site Content","/admin/content"],["Settings","/admin/settings"],["Public project","/projects/d2-browser-acceptance-project"],["Public article","/resources/d2-browser-media-article"]]){
   await page.goto(path);await page.waitForLoadState("networkidle");
   const metric=await checkLayout(`${label} ${viewport.width}x${viewport.height}`);result.mobile.push(metric);
   const admin=path.startsWith("/admin");const menu=page.getByRole("button",{name:admin?"Open admin menu":"Open menu"});if(await menu.count()){await menu.click();const navigation=page.getByRole("navigation",{name:admin?"Admin navigation":"Mobile navigation"});await navigation.waitFor();if(!(await navigation.isVisible()))throw new Error(`${label}: mobile menu did not open`)}
  }
  await page.goto("/admin/projects/"+projectId);await page.screenshot({path:join(output,`project-editor-${viewport.width}x${viewport.height}.png`),fullPage:true,caret:"initial"});
  await page.goto("/projects/d2-browser-acceptance-project");await page.screenshot({path:join(output,`public-project-${viewport.width}x${viewport.height}.png`),fullPage:true,caret:"initial"});
 }
 const applicationConsoleErrors=consoleErrors.filter(message=>!(message.includes("hydrated")&&message.includes('caret-color:"transparent"')));
 if(applicationConsoleErrors.length||failedRequests.length||unexpectedResponses.length)throw new Error(`Browser errors: ${JSON.stringify({consoleErrors:applicationConsoleErrors,failedRequests,unexpectedResponses})}`);
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close()}
