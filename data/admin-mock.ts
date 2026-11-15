import type { AdminProject, AdminResource, AdminTip, BusinessSettings, Enquiry } from "@/types/admin";

export const businessSettings: BusinessSettings = {
  businessName: "Fiber & Electric Solutions Ltd.",
  publicEmail: "",
  publicPhone: "",
  whatsappNumber: "",
  publicLocation: "Trinidad & Tobago",
  googleMapsUrl: "",
  businessHours: [
    { day: "Monday", open: true, opensAt: "08:00", closesAt: "17:00" },
    { day: "Tuesday", open: true, opensAt: "08:00", closesAt: "17:00" },
    { day: "Wednesday", open: true, opensAt: "08:00", closesAt: "17:00" },
    { day: "Thursday", open: true, opensAt: "08:00", closesAt: "17:00" },
    { day: "Friday", open: true, opensAt: "08:00", closesAt: "17:00" },
    { day: "Saturday", open: false, opensAt: "08:00", closesAt: "12:00" },
    { day: "Sunday", open: false, opensAt: "08:00", closesAt: "12:00" },
  ],
  socialLinks: { facebook: "", instagram: "", linkedin: "", googleBusiness: "", whatsapp: "" },
};

export const adminProjects: AdminProject[] = [
  {id:"prj-001",slug:"featured-project-placeholder",title:"Featured project placeholder",category:"Combined",summary:"Awaiting approved scope and photography.",location:"To be confirmed",period:"1 Sep 2026",status:"Published",featured:true,image:"/images/project-combined.svg",coverMediaId:"med-001",gallery:[],galleryCount:3,updatedAt:"8 Oct 2026"},
  {id:"prj-002",slug:"electrical-project-placeholder",title:"Electrical project placeholder",category:"Electrical",summary:"Structure ready for approved project content.",location:"To be confirmed",period:"15 Aug 2026",status:"Draft",featured:false,image:"/images/project-electrical.svg",coverMediaId:"med-002",gallery:[],galleryCount:2,updatedAt:"5 Oct 2026"},
  {id:"prj-003",slug:"fiber-infrastructure-placeholder",title:"Fiber infrastructure placeholder",category:"Fiber",summary:"Structure ready for approved project content.",location:"To be confirmed",period:"12 Jun 2026",status:"Published",featured:false,image:"/images/project-fiber.svg",coverMediaId:"med-003",gallery:[],galleryCount:2,updatedAt:"2 Oct 2026"},
];
export const adminResources: AdminResource[] = [
  {id:"res-001",slug:"planning-a-service-request",title:"Preparing a clear service request",kind:"FES article",category:"Company Updates",summary:"A concise guide to sharing the site details, photographs and outcomes needed for an effective service request.",status:"Published",featured:true,publishedAt:"1 Oct 2026",updatedAt:"5 Oct 2026",coverImage:"/images/project-combined.svg"},
  {id:"res-002",slug:"electrical-insight-placeholder",title:"Electrical insight",kind:"FES article",category:"Electrical",summary:"Reserved for client-approved electrical information.",status:"Draft",updatedAt:"5 Oct 2026",coverImage:"/images/project-electrical.svg"},
  {id:"res-003",slug:"external-industry-resource",title:"External industry resource",kind:"External resource",category:"Fiber Optic",summary:"Attributed link structure awaiting an approved source.",source:"Source to be approved",status:"Draft",updatedAt:"5 Oct 2026",coverImage:"/images/project-fiber.svg"},
];
export const adminTips: AdminTip[] = [
  {id:"tip-001",type:"Do",title:"Plan before work begins",body:"Share site conditions, the required outcome and clear photographs.",enabled:true,order:1},
  {id:"tip-002",type:"Do",title:"Keep equipment accessible",body:"Maintain safe access to electrical panels and communications equipment.",enabled:true,order:2},
  {id:"tip-003",type:"Don’t",title:"Do not guess at faults",body:"Have electrical and fiber issues assessed by an appropriate professional.",enabled:true,order:3},
];
export const enquiries: Enquiry[] = [
  {id:"enq-demo-001",name:"Sample enquiry",contact:"Development data only",email:"sample.customer@example.com",phone:"+1 202-555-0147",preferredContact:"Email",service:"Electrical",selectedServiceIds:["commercial-industrial"],location:"Sample location",propertyType:"Commercial",description:"Mock enquiry used to demonstrate the future workflow. This is not a real customer submission.",submittedAt:"5 Oct 2026, 10:30",submittedAtIso:"2026-10-05T10:30:00-04:00",updatedAt:"2026-10-06T09:15:00-04:00",status:"New",attachments:["/images/project-electrical.svg","/images/project-combined.svg"]},
  {id:"enq-demo-002",name:"Sample fibre enquiry",contact:"Development data only",service:"Fiber Optic",selectedServiceIds:[],location:"Sample location",propertyType:"Industrial",description:"Mock data for layout, missing-contact and empty-gallery testing only.",submittedAt:"4 Oct 2026, 14:10",submittedAtIso:"2026-10-04T14:10:00-04:00",updatedAt:"2026-10-04T14:10:00-04:00",status:"Reviewing",attachments:[]},
];
