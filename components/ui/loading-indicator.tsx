import { LoaderCircle } from "lucide-react";

export function LoadingIndicator({label}:{label:string}) {
  return <span className="inline-flex items-center gap-2" role="status" aria-live="polite"><LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true"/><span>{label}</span></span>;
}
