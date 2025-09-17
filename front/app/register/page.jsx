"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/app/components/AuthLayout";
import Link from "next/link";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedRole) {
      const roleParam =
        selectedRole === "Organização"
          ? "organizacao"
          : selectedRole.toLowerCase();
      router.push(`/register/info?role=${roleParam}`);
    } else {
      alert("Por favor, selecione uma opção!");
    }
  };

  const roles = ["Organização", "Jogadora", "Espectador"];

  return (
    <AuthLayout>
      <div
        className="
          bg-white 
          rounded-3xl 
          p-6 sm:p-8 md:p-10 lg:p-12 
          shadow-2xl 
          text-center 
          flex 
          flex-col 
          gap-6 sm:gap-8 md:gap-10
          w-full
          transition-transform duration-300 ease-in-out
        "
      >
        <h1
          className="
            text-4xl sm:text-5xl md:text-6xl 
            font-extrabold 
            text-gray-900 
            leading-tight
            mb-4 sm:mb-6
          "
        >
          Bem-vindo ao <span className="text-purple-700">Passa a Bola</span>
        </h1>

        <p
          className="
            text-lg sm:text-xl md:text-2xl 
            text-gray-700 
            font-semibold 
            mb-4 sm:mb-6
          "
        >
          Quero me cadastrar como...
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
          {roles.map((role) => (
            <div key={role}>
              <label
                className={`
                  flex 
                  items-center 
                  justify-center 
                  p-4 sm:p-5 
                  rounded-xl 
                  border-2 
                  cursor-pointer 
                  transition-all 
                  duration-200 
                  shadow-sm
                  hover:scale-105 active:scale-95
                  ${
                    selectedRole === role
                      ? "border-purple-600 bg-purple-50 text-purple-800 font-semibold"
                      : "border-gray-200 bg-white text-gray-800 hover:border-purple-300 hover:bg-purple-10"
                  }
                `}
              >
                <input
                  type="radio"
                  name="userRole"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                  className="
                    hidden 
                    peer
                  "
                />
                <span
                  className="
                  relative 
                  flex 
                  items-center 
                  justify-center 
                  w-6 h-6 
                  border-2 
                  rounded-full 
                  mr-3
                  peer-checked:border-purple-600
                  peer-checked:bg-purple-600
                  peer-checked:after:content-['']
                  peer-checked:after:block
                  peer-checked:after:w-3
                  peer-checked:after:h-3
                  peer-checked:after:rounded-full
                  peer-checked:after:bg-white
                  transition-all
                  duration-200
                "
                ></span>
                <span className="text-lg sm:text-xl">{role}</span>
              </label>
            </div>
          ))}

          <div className="mt-4 sm:mt-6">
            <button
              type="submit"
              className="
                w-full 
                bg-purple-800 
                hover:bg-purple-900 
                text-white 
                font-bold 
                py-4 sm:py-5 
                rounded-xl 
                text-xl sm:text-2xl 
                transition-all 
                duration-300 
                shadow-lg
                hover:scale-105 active:scale-95
              "
            >
              CONTINUAR
            </button>
          </div>
        </form>

        <div
          className="
            mt-6 sm:mt-8 md:mt-10 
            pt-6 
            border-t 
            border-gray-200 
            flex 
            flex-col 
            items-center 
            gap-3
          "
        >
          <p className="text-lg sm:text-xl font-semibold text-gray-700">
            Já tem cadastro?
          </p>
          <Link
            href="/login"
            className="
              text-purple-600 
              hover:text-purple-800 
              font-bold 
              text-lg sm:text-xl
              transition-all 
              duration-200
              flex items-center gap-2
              hover:scale-105 active:scale-95
            "
          >
            Faça seu login!
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
