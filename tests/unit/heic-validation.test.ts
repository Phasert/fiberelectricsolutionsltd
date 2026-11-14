import {describe,expect,it}from"vitest";
import {validateEditorialImage}from"@/lib/media/image-validation";

const heicHeader=Uint8Array.from([0,0,0,24,102,116,121,112,104,101,105,99]);

describe("HEIC editorial validation",()=>{
 it("recognizes a HEIC container before decoding",async()=>{await expect(validateEditorialImage({bytes:heicHeader,mimeType:"image/heic",originalName:"photo.heic"})).rejects.toThrow("MEDIA_HEIC_CONVERSION_FAILED")});
 it("rejects a HEIC filename whose content is not HEIC",async()=>{await expect(validateEditorialImage({bytes:Uint8Array.from([255,216,255,0]),mimeType:"image/heic",originalName:"fake.heic"})).rejects.toThrow("MEDIA_SIGNATURE_INVALID")});
});
