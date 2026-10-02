// Departamento y municipio oficiales (DANE), consultados a datos.gov.co a través del backend.
// Para campañas departamentales (Gobernación, Asamblea) solo se pide el departamento.
import { useEffect, useState } from "react";
import { apiLista } from "../lib/api";
import { Campo, Seleccion } from "../ui/Campo";

export default function SelectorTerritorio({ conMunicipio, departamento, municipio, onCambio, idBase = "terr" }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [cargandoMunicipios, setCargandoMunicipios] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiLista("/geografia/departamentos").then((d) => {
      setDepartamentos(d);
      if (!d.length) setError("No se pudo cargar la lista oficial. Revise la conexión e intente de nuevo.");
    });
  }, []);

  useEffect(() => {
    if (!conMunicipio || !departamento) {
      setMunicipios([]);
      return;
    }
    setCargandoMunicipios(true);
    apiLista(`/geografia/departamentos/${departamento}/municipios`).then((m) => {
      setMunicipios(m);
      setCargandoMunicipios(false);
    });
  }, [departamento, conMunicipio]);

  return (
    <>
      <Campo etiqueta="Departamento" id={`${idBase}-depto`} error={error} className={conMunicipio ? "" : "sm:col-span-2"}>
        <Seleccion
          id={`${idBase}-depto`}
          value={departamento}
          onChange={(e) => onCambio({ departamento: e.target.value, municipio: "" })}
          required
        >
          <option value="">{departamentos.length ? "Seleccione…" : "Cargando…"}</option>
          {departamentos.map((d) => <option key={d.codigo} value={d.codigo}>{d.nombre}</option>)}
        </Seleccion>
      </Campo>
      {conMunicipio && (
        <Campo etiqueta="Municipio" id={`${idBase}-muni`}>
          <Seleccion
            id={`${idBase}-muni`}
            value={municipio}
            onChange={(e) => onCambio({ departamento, municipio: e.target.value })}
            disabled={!departamento || cargandoMunicipios}
            required
          >
            <option value="">{!departamento ? "Elija el departamento" : cargandoMunicipios ? "Cargando…" : "Seleccione…"}</option>
            {municipios.map((m) => <option key={m.codigo} value={m.codigo}>{m.nombre}</option>)}
          </Seleccion>
        </Campo>
      )}
    </>
  );
}
