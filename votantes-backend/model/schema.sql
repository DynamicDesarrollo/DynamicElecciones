--
-- PostgreSQL database dump
--

\restrict gRSXJ7bwQRI75lxxhyxHPfs3CR95gnuApNmMTY7fFHaZGsffirC6JRVRebmiG1Z

-- Dumped from database version 17.11 (fcae950)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asistencia_votantes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asistencia_votantes (
    id integer NOT NULL,
    puesto_control character varying(100),
    fecha_registro timestamp with time zone,
    votante_uuid uuid
);


--
-- Name: asistencia_votantes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asistencia_votantes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: asistencia_votantes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asistencia_votantes_id_seq OWNED BY public.asistencia_votantes.id;


--
-- Name: aspirantes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aspirantes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    telefono character varying(30),
    tipo_aspirante character varying(30) NOT NULL,
    partido character varying(100),
    municipio character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: aspirantes_alcaldia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aspirantes_alcaldia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    partido_id uuid,
    municipio_id uuid,
    coalicion boolean DEFAULT false,
    cedula character varying(20),
    direccion text,
    telefono character varying(20),
    barrio character varying(100),
    fecha_nace date
);


--
-- Name: aspirantes_concejo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aspirantes_concejo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    partido_id uuid,
    municipio_id uuid,
    alcaldia_id uuid,
    cedula character varying(20),
    direccion text,
    telefono character varying(20),
    barrio character varying(100),
    fecha_nace date
);


--
-- Name: barrios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barrios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    municipio_id uuid NOT NULL
);


--
-- Name: lideres; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lideres (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    aspirante_concejo_id uuid,
    cedula character varying(20),
    direccion text,
    municipio uuid,
    telefono character varying(20),
    barrio uuid,
    fecha_nace date
);


--
-- Name: lugares_votacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lugares_votacion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    departamento character varying(30),
    municipio character varying(30),
    mujeres integer,
    hombres integer,
    total integer,
    mesas integer
);


--
-- Name: mesas_votacion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesas_votacion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero character varying(50) NOT NULL,
    lugar_id uuid
);


--
-- Name: municipios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.municipios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL
);


--
-- Name: partidos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partidos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    logo_url text
);


--
-- Name: prospectos_votantes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prospectos_votantes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    cedula character varying(20) NOT NULL,
    telefono character varying(20),
    direccion text,
    municipio_id uuid,
    barrio_id uuid,
    lider_id uuid,
    aspirante_concejo_id uuid,
    aspirante_alcaldia_id uuid,
    registrado_por uuid,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    partido_id uuid,
    zona character varying(20),
    mesa_id uuid,
    lugar_id uuid,
    sexo character varying(10),
    usuario_id uuid,
    CONSTRAINT prospectos_votantes_zona_check CHECK (((zona)::text = ANY (ARRAY[('Rural'::character varying)::text, ('Urbano'::character varying)::text])))
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100),
    correo character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    rol character varying(50) DEFAULT 'admin'::character varying,
    aspirante_concejo_id uuid,
    aspirante_alcaldia_id uuid,
    tipo_aspirante character varying(30)
);


--
-- Name: COLUMN usuarios.tipo_aspirante; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.usuarios.tipo_aspirante IS 'Tipo de aspirante: senado, camara, alcaldia, concejo, null si no aplica';


--
-- Name: asistencia_votantes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_votantes ALTER COLUMN id SET DEFAULT nextval('public.asistencia_votantes_id_seq'::regclass);


--
-- Name: asistencia_votantes asistencia_votantes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_votantes
    ADD CONSTRAINT asistencia_votantes_pkey PRIMARY KEY (id);


--
-- Name: aspirantes_alcaldia aspirantes_alcaldia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_alcaldia
    ADD CONSTRAINT aspirantes_alcaldia_pkey PRIMARY KEY (id);


--
-- Name: aspirantes_concejo aspirantes_concejo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_pkey PRIMARY KEY (id);


--
-- Name: aspirantes aspirantes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes
    ADD CONSTRAINT aspirantes_pkey PRIMARY KEY (id);


--
-- Name: barrios barrios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_pkey PRIMARY KEY (id);


--
-- Name: lideres lideres_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lideres
    ADD CONSTRAINT lideres_pkey PRIMARY KEY (id);


--
-- Name: lugares_votacion lugares_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lugares_votacion
    ADD CONSTRAINT lugares_votacion_pkey PRIMARY KEY (id);


--
-- Name: mesas_votacion mesas_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesas_votacion
    ADD CONSTRAINT mesas_votacion_pkey PRIMARY KEY (id);


--
-- Name: municipios municipios_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_nombre_key UNIQUE (nombre);


--
-- Name: municipios municipios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_pkey PRIMARY KEY (id);


--
-- Name: partidos partidos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_nombre_key UNIQUE (nombre);


--
-- Name: partidos partidos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_pkey PRIMARY KEY (id);


--
-- Name: prospectos_votantes prospectos_votantes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_aspirantes_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aspirantes_tipo ON public.aspirantes USING btree (tipo_aspirante);


--
-- Name: aspirantes_alcaldia aspirantes_alcaldia_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_alcaldia
    ADD CONSTRAINT aspirantes_alcaldia_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id);


--
-- Name: aspirantes_alcaldia aspirantes_alcaldia_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_alcaldia
    ADD CONSTRAINT aspirantes_alcaldia_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: aspirantes_concejo aspirantes_concejo_alcaldia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_alcaldia_id_fkey FOREIGN KEY (alcaldia_id) REFERENCES public.aspirantes_alcaldia(id) ON DELETE SET NULL;


--
-- Name: aspirantes_concejo aspirantes_concejo_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id);


--
-- Name: aspirantes_concejo aspirantes_concejo_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: barrios barrios_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id) ON DELETE CASCADE;


--
-- Name: asistencia_votantes fk_asistencia_votantes_prospectos_uuid; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencia_votantes
    ADD CONSTRAINT fk_asistencia_votantes_prospectos_uuid FOREIGN KEY (votante_uuid) REFERENCES public.prospectos_votantes(id) ON DELETE CASCADE;


--
-- Name: lideres lideres_aspirante_concejo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lideres
    ADD CONSTRAINT lideres_aspirante_concejo_id_fkey FOREIGN KEY (aspirante_concejo_id) REFERENCES public.aspirantes_concejo(id) ON DELETE SET NULL;


--
-- Name: mesas_votacion mesas_votacion_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesas_votacion
    ADD CONSTRAINT mesas_votacion_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares_votacion(id) ON DELETE CASCADE;


--
-- Name: prospectos_votantes prospectos_votantes_aspirante_alcaldia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_aspirante_alcaldia_id_fkey FOREIGN KEY (aspirante_alcaldia_id) REFERENCES public.aspirantes_alcaldia(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_aspirante_concejo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_aspirante_concejo_id_fkey FOREIGN KEY (aspirante_concejo_id) REFERENCES public.aspirantes_concejo(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_barrio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_barrio_id_fkey FOREIGN KEY (barrio_id) REFERENCES public.barrios(id);


--
-- Name: prospectos_votantes prospectos_votantes_lider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_lider_id_fkey FOREIGN KEY (lider_id) REFERENCES public.lideres(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares_votacion(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_mesa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas_votacion(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id);


--
-- Name: prospectos_votantes prospectos_votantes_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: usuarios usuarios_aspirante_alcaldia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_aspirante_alcaldia_id_fkey FOREIGN KEY (aspirante_alcaldia_id) REFERENCES public.aspirantes_alcaldia(id);


--
-- Name: usuarios usuarios_aspirante_concejo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_aspirante_concejo_id_fkey FOREIGN KEY (aspirante_concejo_id) REFERENCES public.aspirantes_concejo(id);


--
-- PostgreSQL database dump complete
--

\unrestrict gRSXJ7bwQRI75lxxhyxHPfs3CR95gnuApNmMTY7fFHaZGsffirC6JRVRebmiG1Z

