// Confirmación imperativa: const confirmar = useConfirmar(); if (await confirmar({...})) ...
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal } from "./Modal";
import { Boton } from "./Boton";

const ConfirmarContext = createContext(async () => false);

// eslint-disable-next-line react-refresh/only-export-components
export const useConfirmar = () => useContext(ConfirmarContext);

export function ConfirmarProvider({ children }) {
  const [opciones, setOpciones] = useState(null);
  const resolver = useRef(null);

  const confirmar = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOpciones(opts);
      }),
    []
  );

  const cerrar = (resultado) => {
    resolver.current?.(resultado);
    resolver.current = null;
    setOpciones(null);
  };

  return (
    <ConfirmarContext.Provider value={confirmar}>
      {children}
      <Modal abierto={!!opciones} alCerrar={() => cerrar(false)} titulo={opciones?.titulo} ancho="sm:max-w-md">
        {opciones?.texto && <p className="text-[15px] leading-relaxed text-tinta-2">{opciones.texto}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Boton variante="secundario" onClick={() => cerrar(false)}>Cancelar</Boton>
          <Boton variante={opciones?.peligro === false ? "primario" : "peligro-solido"} onClick={() => cerrar(true)} data-autofocus>
            {opciones?.accion || "Confirmar"}
          </Boton>
        </div>
      </Modal>
    </ConfirmarContext.Provider>
  );
}
