import { FormPreviewClient } from "./FormPreviewClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FormPreviewPage({ params }: Props) {
  const { id } = await params;
  return <FormPreviewClient id={id} />;
}
