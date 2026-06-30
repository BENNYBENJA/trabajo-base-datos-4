import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const guardado = localStorage.getItem('usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      return null;
    }
  });

  const login = (datosUsuario) => {
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    localStorage.setItem('rol', datosUsuario.rol); // Guardar rol en localStorage explícitamente
    setUsuario(datosUsuario);
  };

  const logout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol'); // Remover rol de localStorage
    setUsuario(null);
  };

  // El rol viene normalizado como 'admin' o 'cliente'
  const esAdmin = usuario?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ usuario, login, logout, esAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
