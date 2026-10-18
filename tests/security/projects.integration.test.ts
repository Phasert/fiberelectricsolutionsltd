import { describe,expect,it } from "vitest";
import { POST as createProjectRoute } from "../../app/api/admin/projects/route";
import { createProject,deleteProject,getAdminProject,listPublishedProjects,updateProject } from "../../lib/projects/repository";
import { getAdminFirestore } from "../../lib/firebase/admin";

const actor="phase-c1-test-admin";
const base={title:"Emulator project",slug:"emulator-project",category:"Electrical" as const,summary:"A valid emulator project used for integration testing.",location:"Test location",period:"October 2026",status:"Draft" as const,featured:false,gallery:[],coverMediaId:null};

describe("Phase C1 projects repository",()=>{
 it("rejects unauthenticated or untrusted project mutations",async()=>{const response=await createProjectRoute(new Request("http://localhost:3000/api/admin/projects",{method:"POST",headers:{origin:"https://attacker.example","content-type":"application/json"},body:JSON.stringify(base)}));expect(response.status).toBe(403)});
 it("creates, persists, updates, publishes and deletes a project",async()=>{const slug=`emulator-project-${Date.now()}`,id=await createProject({...base,slug},actor);expect((await getAdminProject(id))?.slug).toBe(slug);const renamed=`${slug}-renamed`;await updateProject(id,{...base,slug:renamed,title:"Updated emulator project"},actor);expect((await getAdminProject(id))?.title).toBe("Updated emulator project");expect((await getAdminFirestore().collection("projectSlugs").doc(slug).get()).exists).toBe(false);await expect(updateProject(id,{...base,slug:renamed,status:"Published"},actor)).rejects.toThrow();const gallery=[{mediaId:"media-emulator",alt:"Emulator test image",caption:"",order:0}];await updateProject(id,{...base,slug:renamed,status:"Published",gallery,coverMediaId:"media-emulator"},actor);expect((await listPublishedProjects()).some(project=>project.id===id)).toBe(true);await deleteProject(id);expect(await getAdminProject(id)).toBeNull();expect((await getAdminFirestore().collection("projectSlugs").doc(renamed).get()).exists).toBe(false)});
 it("prevents duplicate project slugs transactionally",async()=>{const slug=`duplicate-${Date.now()}`,first=await createProject({...base,slug},actor);await expect(createProject({...base,slug,title:"Duplicate title"},actor)).rejects.toThrow("SLUG_CONFLICT");await deleteProject(first)});
});
