import {randomUUID} from "node:crypto";
import {afterEach,describe,expect,it} from "vitest";
import {getAdminFirestore} from "../../lib/firebase/admin";
import {POST} from "../../app/api/quote-requests/route";

const origin="http://localhost:3000";
const source=(suffix:string=randomUUID())=>({"content-type":"application/json",origin,"user-agent":`phase-d3-test/${suffix}`,"x-forwarded-for":`192.0.2.${Math.floor(Math.random()*200)+1}`});
const quote=(overrides:Record<string,unknown>={})=>({schemaVersion:1,submissionKey:randomUUID(),name:"Phase D3 Test Customer",email:"customer@example.test",phone:"",preferredContact:"Email",service:"Electrical",selectedServiceIds:["data-wiring"],location:"Emulator Test Site",propertyType:"Commercial",description:"A clearly labelled emulator-only quote request used for automated verification.",preferredTimeframe:"Next month",consentAcknowledged:true,attachments:[],...overrides});
const request=(body:unknown,headers:Record<string,string>=source())=>POST(new Request(`${origin}/api/quote-requests`,{method:"POST",headers,body:JSON.stringify(body)}));
const transport=(value=quote(),extra:Record<string,unknown>={})=>({startedAt:Date.now()-3_000,companyWebsite:"",quote:value,...extra});

afterEach(async()=>{
  const database=getAdminFirestore();
  for(const collection of ["quoteRequests","quoteSubmissionKeys","quoteDuplicateKeys","quoteRateLimits"]){
    const snapshot=await database.collection(collection).get();
    await Promise.all(snapshot.docs.map(document=>document.ref.delete()));
  }
});

describe("Phase D3 quote submissions",()=>{
  it("stores a valid enquiry with consent, retention and protected source metadata",async()=>{
    const response=await request(transport());
    expect(response.status).toBe(201);
    const result=await response.json(),saved=await getAdminFirestore().collection("quoteRequests").doc(result.reference).get();
    expect(saved.data()).toMatchObject({schemaVersion:1,status:"New",attachments:[],consent:{acknowledged:true,version:"privacy-notice-2026-10-20-v1"},source:{channel:"website"}});
    expect(saved.get("source.ipHash")).toMatch(/^[a-f0-9]{64}$/);
    expect(saved.get("source.userAgentHash")).toMatch(/^[a-f0-9]{64}$/);
    expect(saved.data()).not.toHaveProperty("submissionKey");
    expect(saved.get("retentionUntil").toMillis()).toBeGreaterThan(Date.now());
  });

  it("returns the original reference for safe retries and equivalent duplicate payloads",async()=>{
    const value=quote(),headers=source();
    const first=await request(transport(value),headers),firstBody=await first.json();
    const retry=await request(transport(value),headers),retryBody=await retry.json();
    expect(retry.status).toBe(200);expect(retryBody).toMatchObject({reference:firstBody.reference,duplicate:true});
    const duplicate=await request(transport({...value,submissionKey:randomUUID()}),headers),duplicateBody=await duplicate.json();
    expect(duplicate.status).toBe(200);expect(duplicateBody.reference).toBe(firstBody.reference);
    expect((await getAdminFirestore().collection("quoteRequests").get()).size).toBe(1);
  });

  it("rejects reuse of an idempotency key for changed customer data",async()=>{
    const value=quote(),headers=source();
    expect((await request(transport(value),headers)).status).toBe(201);
    expect((await request(transport({...value,description:`${value.description} Changed.`}),headers)).status).toBe(409);
  });

  it("rejects invalid fields, mismatched services and customer attachments",async()=>{
    expect((await request(transport(quote({name:"x"})))).status).toBe(400);
    expect((await request(transport(quote({service:"Electrical",selectedServiceIds:["fiber-testing"]})))).status).toBe(400);
    expect((await request(transport(quote({attachments:["not-allowed"]})))).status).toBe(400);
  });

  it("enforces origin, media type, payload size and minimum completion time",async()=>{
    expect((await request(transport(),{...source(),origin:"https://attacker.example"})).status).toBe(403);
    expect((await request(transport(),{...source(),"content-type":"text/plain"})).status).toBe(415);
    expect((await request(transport(),{...source(),"content-length":"20000"})).status).toBe(413);
    expect((await POST(new Request(`${origin}/api/quote-requests`,{method:"POST",headers:source(),body:`{"padding":"${"x".repeat(17_000)}"}`}))).status).toBe(413);
    expect((await request(transport(undefined,{startedAt:Date.now()}))).status).toBe(400);
  });

  it("silently accepts the honeypot without persisting customer data",async()=>{
    const response=await request(transport(undefined,{companyWebsite:"https://spam.example"}));
    expect(response.status).toBe(202);
    expect((await getAdminFirestore().collection("quoteRequests").get()).empty).toBe(true);
  });

  it("rate limits excessive requests from the same protected source",async()=>{
    const headers=source("rate-limit");
    for(let index=0;index<5;index++)expect((await request(transport(quote({name:`Phase D3 Customer ${index}`,description:`Valid emulator quote number ${index} with enough detail for server validation.`})),headers)).status).toBe(201);
    expect((await request(transport(quote({name:"Phase D3 Customer Six",description:"A sixth valid emulator request that must be safely rate limited."})),headers)).status).toBe(429);
  });

  it("fails closed when live submissions are not explicitly approved",async()=>{
    const emulator=process.env.FIRESTORE_EMULATOR_HOST;
    delete process.env.FIRESTORE_EMULATOR_HOST;
    process.env.QUOTE_SUBMISSIONS_LIVE_ENABLED="false";
    try{expect((await request(transport())).status).toBe(503);}finally{process.env.FIRESTORE_EMULATOR_HOST=emulator;}
  });
});
