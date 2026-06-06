import { redirect } from "next/navigation";

export default function NotesRedirect({ params }: { params: { id: string } }) {
  redirect(`/trips/${params.id}/journals`);
}
