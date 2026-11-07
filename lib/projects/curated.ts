import type { PublicSlide } from "@/components/home/media-slideshow";
import type { PublicProject } from "@/types/content";

const base="/images/projects/tommys-brentwood";

export const tommysBrentwoodProject:PublicProject={id:"curated-tommys-brentwood",slug:"tommys-brentwood",title:"Tommy’s Brentwood",category:"Electrical",summary:"",featuredImage:`${base}/img_0670.jpg`,featuredImageAlt:"Open electrical panel with a main breaker, copper busbars and yellow cabling",featuredImageFit:"contain",gallery:[{src:`${base}/img_0637.jpg`,alt:"Two open electrical panelboards mounted within a framed interior"},{src:`${base}/img_0670.jpg`,alt:"Open electrical panel with a main breaker, copper busbars and yellow cabling"},{src:`${base}/img_0775.jpg`,alt:"Wide view of electrical equipment and cabling in an equipment room"},{src:`${base}/img_0776.jpg`,alt:"Open breaker panel with copper busbars and colored cabling"},{src:`${base}/img_0777.jpg`,alt:"Wide view of electrical equipment installed in an equipment room"}],featured:true,publishedAt:"2026-11-06T00:00:00.000Z"};

export const tommysBrentwoodFeaturedSlides:PublicSlide[]=[{id:"tommys-cover",src:`${base}/img_0670.jpg`,alt:"Electrical panel with copper busbars and yellow cabling",focalPoint:{x:50,y:35}},{id:"tommys-breaker",src:`${base}/img_0776.jpg`,alt:"Breaker panel with copper busbars and colored cabling",focalPoint:{x:50,y:45}},{id:"tommys-room",src:`${base}/img_0775.jpg`,alt:"Wide view of electrical equipment in an equipment room",focalPoint:{x:50,y:50}}];

export const curatedProjects=[tommysBrentwoodProject];
