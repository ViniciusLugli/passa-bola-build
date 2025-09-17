import ConfigForm from "./ConfigForm";
import Header from "@/app/components/Header";

export default async function ConfigPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const { userType, id } = resolvedParams;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto p-4 md:p-8 max-w-2xl">
        <ConfigForm userId={id} userType={userType} />
      </main>
    </div>
  );
}
