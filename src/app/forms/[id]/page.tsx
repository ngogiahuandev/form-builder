import { FormEditorClient } from "@/components/form-builder/FormEditorClient";

interface FormPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params;
  return <FormEditorClient id={id} />;
}
