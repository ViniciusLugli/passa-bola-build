import ConfigForm from "./ConfigForm";

export default async function ConfigPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { userType, id } = resolvedParams;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto p-4 md:p-8 max-w-2xl">
        <ConfigForm userId={id} userType={userType} />
      </main>
    </div>
  );
}
