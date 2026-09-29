"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    {},
  );

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="usuario" className="text-sm text-silver">
          Usuario
        </label>
        <input
          id="usuario"
          name="usuario"
          type="text"
          autoComplete="username"
          required
          className="mt-1 w-full rounded-sm border border-line bg-panel px-3 py-2 text-paper outline-none focus:border-electric"
        />
      </div>
      <div>
        <label htmlFor="contrasena" className="text-sm text-silver">
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-sm border border-line bg-panel px-3 py-2 text-paper outline-none focus:border-electric"
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-paper px-4 py-2.5 text-sm font-medium text-ink disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
