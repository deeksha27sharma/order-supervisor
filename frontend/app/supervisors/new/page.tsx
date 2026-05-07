import SupervisorForm from "@/components/supervisors/SupervisorForm";

export default function NewSupervisorPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">New Supervisor</h1>
      <SupervisorForm />
    </div>
  );
}