import {chromium} from "playwright-core";
import {mkdir} from "node:fs/promises";
import {join} from "node:path";
import {tmpdir} from "node:os";

const baseURL="http://localhost:3000",output=join(tmpdir(),"fes-d3-acceptance");
await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true,args:["--disable-extensions","--no-first-run"]});
const result={output,viewports:[],features:{},consoleErrors:[],failedRequests:[],unexpectedResponses:[]};

async function run(viewport,label){
  const context=await browser.newContext({baseURL,viewport,colorScheme:"light"}),page=await context.newPage();
  page.on("console",message=>{if(message.type()==="error")result.consoleErrors.push(`${label}: ${message.text()}`)});
  page.on("pageerror",error=>result.consoleErrors.push(`${label}: ${error.message}`));
  page.on("requestfailed",request=>{if(request.failure()?.errorText!=="net::ERR_ABORTED")result.failedRequests.push(`${label}: ${request.method()} ${request.url()} ${request.failure()?.errorText??""}`)});
  page.on("response",response=>{if(response.status()>=400&&!response.url().includes("/__nextjs_original-stack-frames"))result.unexpectedResponses.push(`${label}: ${response.status()} ${response.url()}`)});
  const metrics=async(stage)=>{const value=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll("h1").length,main:Boolean(document.querySelector("main"))}));if(value.scrollWidth>value.width)throw new Error(`${label} ${stage}: horizontal overflow ${value.scrollWidth}>${value.width}`);result.viewports.push({label,stage,...value});};
  try{
    await page.goto("/request-a-quote");await page.getByRole("heading",{name:/Tell us about your project/}).waitFor();
    await metrics("stage 1 initial");
    await page.getByRole("button",{name:/Continue/}).click();
    await page.getByText("Enter the general project location.").waitFor();
    result.features.validation="accessible inline errors block incomplete stages";
    await page.getByRole("radio",{name:/^Electrical/}).check({force:true});
    await page.getByLabel("Data wiring",{exact:true}).check();
    await page.getByLabel(/General project location/).fill("Phase D3 Emulator Test Site");
    await page.getByLabel(/Property type/).selectOption("Commercial");
    await page.getByLabel(/Describe the work or problem/).fill(`Phase D3 ${label} emulator-only request for a secure data wiring quotation.`);
    await page.getByLabel(/Preferred timeframe/).fill("Emulator acceptance window");
    await page.getByRole("button",{name:/Continue/}).click();
    await page.getByRole("heading",{name:"Contact details"}).waitFor();await metrics("stage 2");
    await page.getByLabel(/Full name/).fill(`Phase D3 ${label} Test Customer`);
    await page.getByLabel(/Email address/).fill("phase-d3@example.test");
    await page.getByLabel("Email",{exact:true}).check({force:true});
    await page.getByRole("button",{name:/Continue/}).click();
    await page.getByRole("heading",{name:"Review request"}).waitFor();await metrics("stage 3");
    await page.getByText("No photographs are collected in Phase D3.").waitFor();
    await page.getByLabel(/Emulator test acknowledgement/).check();
    await page.getByRole("button",{name:"Submit quote request"}).click();
    await page.getByRole("heading",{name:"Request received."}).waitFor({timeout:15000});
    const reference=await page.getByText(/^Reference:/).innerText();if(!/^Reference: [A-Za-z0-9]+/.test(reference))throw new Error(`${label}: missing confirmation reference`);
    await metrics("confirmation");
    await page.screenshot({path:join(output,`quote-${viewport.width}x${viewport.height}.png`),fullPage:true,caret:"initial"});
    result.features.persistence="valid emulator enquiries reach the server and return a Firestore reference";
    result.features.photos="the UI states that customer photos are not collected in Phase D3";
    if(viewport.width<500){await page.goto("/request-a-quote");const menu=page.getByRole("button",{name:"Open menu"});await menu.click();await page.getByRole("navigation",{name:"Mobile navigation"}).waitFor();result.features.mobileNavigation="public mobile navigation opens at both required widths";}
  }finally{await context.close();}
}

try{
  await run({width:1440,height:1000},"desktop");
  await run({width:390,height:844},"390x844");
  await run({width:360,height:740},"360x740");
  if(result.consoleErrors.length||result.failedRequests.length||result.unexpectedResponses.length)throw new Error(`Browser errors: ${JSON.stringify({consoleErrors:result.consoleErrors,failedRequests:result.failedRequests,unexpectedResponses:result.unexpectedResponses})}`);
  console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
