import { NextResponse } from "next/server";
import { verifyAdminSession,requestHasTrustedOrigin } from "@/lib/auth/session";
import { createProject,listAdminProjects } from "@/lib/projects/repository";
import { invalidatePublicProjects } from "@/lib/projects/public-cache";
export async function GET(){if(!await verifyAdminSession())return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json({projects:await listAdminProjects()})}
export async function POST(request:Request){if(!requestHasTrustedOrigin(request))return NextResponse.json({error:"Invalid origin"},{status:403});const admin=await verifyAdminSession();if(!admin)return NextResponse.json({error:"Unauthorized"},{status:401});try{const id=await createProject(await request.json(),admin.uid);invalidatePublicProjects();return NextResponse.json({id},{status:201})}catch(error){if(error instanceof Error&&error.message==="SLUG_CONFLICT")return NextResponse.json({error:"That project slug is already in use."},{status:409});return NextResponse.json({error:"Project validation failed."},{status:400})}}
