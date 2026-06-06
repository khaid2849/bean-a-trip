import { redirect } from "next/navigation";

export default function PhotosRedirect({ params }: { params: { id: string } }) {
  redirect(`/trips/${params.id}/journals`);
}
