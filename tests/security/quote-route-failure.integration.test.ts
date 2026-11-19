import {describe,expect,it,vi} from "vitest";

vi.mock("../../lib/quotes/repository",()=>({
  createQuoteRequest:vi.fn().mockRejectedValue(new Error("internal-emulator-detail-that-must-not-leak")),
}));

import {POST} from "../../app/api/quote-requests/route";

describe("Phase D3 safe server failure",()=>{
  it("returns a generic retryable response without exposing internal details",async()=>{
    const response=await POST(new Request("http://localhost:3000/api/quote-requests",{method:"POST",headers:{"content-type":"application/json",origin:"http://localhost:3000"},body:JSON.stringify({startedAt:Date.now()-3_000,companyWebsite:"",quote:{schemaVersion:1,submissionKey:"3f468b65-bd19-484d-9df4-3d12b94144dc",name:"Phase D3 Failure Test",email:"failure@example.test",phone:"",preferredContact:"Email",service:"Electrical",selectedServiceIds:["bolt-electrical-installation"],location:"Emulator Test Site",propertyType:"Commercial",description:"A valid request used to verify sanitized server failure handling.",preferredTimeframe:"",consentAcknowledged:true,attachments:[]}})}));
    expect(response.status).toBe(500);
    const body=await response.json();
    expect(body).toEqual({error:"Your request could not be saved. Please try again."});
    expect(JSON.stringify(body)).not.toContain("internal-emulator-detail");
  });
});
