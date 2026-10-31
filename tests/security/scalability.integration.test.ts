import {afterAll,describe,expect,it} from "vitest";
import {Timestamp} from "firebase-admin/firestore";
import {getAdminFirestore} from "../../lib/firebase/admin";
import {listAdminEnquiriesPage} from "../../lib/enquiries/repository";
import {POST as submitQuote} from "../../app/api/quote-requests/route";

const created:string[]=[];
afterAll(async()=>{const db=getAdminFirestore();await Promise.all(created.map(id=>db.collection("quoteRequests").doc(id).delete()))});

async function bounded<T>(jobs:Array<()=>Promise<T>>,concurrency:number){const results:T[]=[];let index=0;await Promise.all(Array.from({length:concurrency},async()=>{while(index<jobs.length){const current=index++;results[current]=await jobs[current]()}}));return results}

describe("bounded scalability checks",()=>{
  it("pages administrator enquiries in 25-document cursor batches",async()=>{const db=getAdminFirestore(),base=Date.now()+86_400_000,batch=db.batch();for(let index=0;index<60;index++){const id=`audit-enquiry-${String(index).padStart(3,"0")}`;created.push(id);batch.set(db.collection("quoteRequests").doc(id),{name:`Synthetic ${index}`,service:"Electrical",location:"Audit",propertyType:"Commercial",description:"Synthetic emulator-only scalability record",selectedServiceIds:[],attachments:[],status:"New",submittedAt:Timestamp.fromMillis(base-index),updatedAt:Timestamp.fromMillis(base-index)})}await batch.commit();const started=performance.now(),first=await listAdminEnquiriesPage(),second=await listAdminEnquiriesPage(first.nextCursor??undefined),elapsed=performance.now()-started;expect(first.items).toHaveLength(25);expect(first.nextCursor).toBeTruthy();expect(second.items).toHaveLength(25);console.info("AUDIT enquiry-pagination",{documents:50,batches:2,elapsedMs:Math.round(elapsed)})});
  it("handles bounded concurrent invalid quote validation without writes",async()=>{const jobs=Array.from({length:100},(_,index)=>async()=>submitQuote(new Request("http://localhost:3000/api/quote-requests",{method:"POST",headers:{origin:"http://localhost:3000","content-type":"application/json","x-forwarded-for":`192.0.2.${index%250}`},body:"{}"}))),started=performance.now(),responses=await bounded(jobs,5),elapsed=performance.now()-started;expect(responses.every(response=>response.status===400)).toBe(true);console.info("AUDIT quote-validation",{requests:responses.length,concurrency:5,elapsedMs:Math.round(elapsed),requestsPerSecond:Math.round(responses.length/(elapsed/1000))})});
});
