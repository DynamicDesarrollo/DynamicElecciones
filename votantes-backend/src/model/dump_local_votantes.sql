--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

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
-- Name: asistencia_votantes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asistencia_votantes (
    id integer NOT NULL,
    puesto_control character varying(100),
    fecha_registro timestamp with time zone,
    votante_uuid uuid
);


ALTER TABLE public.asistencia_votantes OWNER TO postgres;

--
-- Name: asistencia_votantes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asistencia_votantes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asistencia_votantes_id_seq OWNER TO postgres;

--
-- Name: asistencia_votantes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asistencia_votantes_id_seq OWNED BY public.asistencia_votantes.id;


--
-- Name: aspirantes; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.aspirantes OWNER TO postgres;

--
-- Name: aspirantes_alcaldia; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.aspirantes_alcaldia OWNER TO postgres;

--
-- Name: aspirantes_concejo; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.aspirantes_concejo OWNER TO postgres;

--
-- Name: barrios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barrios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    municipio_id uuid NOT NULL
);


ALTER TABLE public.barrios OWNER TO postgres;

--
-- Name: lideres; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.lideres OWNER TO postgres;

--
-- Name: lugares_votacion; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.lugares_votacion OWNER TO postgres;

--
-- Name: mesas_votacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mesas_votacion (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero character varying(50) NOT NULL,
    lugar_id uuid
);


ALTER TABLE public.mesas_votacion OWNER TO postgres;

--
-- Name: municipios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.municipios (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL
);


ALTER TABLE public.municipios OWNER TO postgres;

--
-- Name: partidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partidos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nombre character varying(100) NOT NULL,
    logo_url text
);


ALTER TABLE public.partidos OWNER TO postgres;

--
-- Name: prospectos_votantes; Type: TABLE; Schema: public; Owner: postgres
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
    CONSTRAINT prospectos_votantes_zona_check CHECK (((zona)::text = ANY ((ARRAY['Rural'::character varying, 'Urbano'::character varying])::text[])))
);


ALTER TABLE public.prospectos_votantes OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
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


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: COLUMN usuarios.tipo_aspirante; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.usuarios.tipo_aspirante IS 'Tipo de aspirante: senado, camara, alcaldia, concejo, null si no aplica';


--
-- Name: asistencia_votantes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_votantes ALTER COLUMN id SET DEFAULT nextval('public.asistencia_votantes_id_seq'::regclass);


--
-- Data for Name: asistencia_votantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asistencia_votantes (id, puesto_control, fecha_registro, votante_uuid) FROM stdin;
\.


--
-- Data for Name: aspirantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aspirantes (id, nombre, correo, telefono, tipo_aspirante, partido, municipio, created_at) FROM stdin;
46428be8-6ba2-40fa-8f83-57f6a644c358	JHONY BESAILE	jhony@gmail.com	3102102203	senado	Partido de la U	La Apartada Cordoba	2026-02-02 13:21:05.550702
9140ed55-c824-4555-bf85-2a6436048835	JUAN RANGEL YANEZ	juan@gamil.com	77777777	camara	Colombia Renaciente	La Apartada Cordoba	2026-02-02 13:22:20.939413
\.


--
-- Data for Name: aspirantes_alcaldia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aspirantes_alcaldia (id, nombre_completo, partido_id, municipio_id, coalicion, cedula, direccion, telefono, barrio, fecha_nace) FROM stdin;
\.


--
-- Data for Name: aspirantes_concejo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aspirantes_concejo (id, nombre_completo, partido_id, municipio_id, alcaldia_id, cedula, direccion, telefono, barrio, fecha_nace) FROM stdin;
c29dd240-916f-4f4a-87ec-9f805603679a	Samuel Moreno Diaz	84f86bd0-0226-4f75-be82-6eb428490ff1	bbc04f33-3ef7-43f6-8228-1bb0e0953534	\N	604587845	Carrera 12 #45-67	3101234567	San Pedro	1980-05-10
00635c4d-54f1-442e-8eae-6193df5ed755	María García	7e04d858-30ab-41c9-b3de-ce3f8c0e7737	bbc04f33-3ef7-43f6-8228-1bb0e0953534	\N	2233445566	Calle 10 #22-33	3124448899	Centro	1990-03-15
0b7489af-407c-488e-b8b7-b9e08569b228	Alberto Martinez Ochoa	4477dd0b-8931-478b-9235-5d01b2e6914e	bbc04f33-3ef7-43f6-8228-1bb0e0953534	\N	65421541	Calle 10 #22-33	3124448899	Centro	1990-03-15
\.


--
-- Data for Name: barrios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barrios (id, nombre, municipio_id) FROM stdin;
df39e8fd-6f8a-4958-a685-ca655a951d46	La Apartada	25f0aca5-35f4-4df9-aeed-e327ff9b7df8
\.


--
-- Data for Name: lideres; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lideres (id, nombre_completo, aspirante_concejo_id, cedula, direccion, municipio, telefono, barrio, fecha_nace) FROM stdin;
a4f42d9e-0509-4e34-a238-15afec91572c	NANCY SOLANO	\N	64919456	Calle 9b nro 8 31	25f0aca5-35f4-4df9-aeed-e327ff9b7df8	3015986371	df39e8fd-6f8a-4958-a685-ca655a951d46	2026-02-02
\.


--
-- Data for Name: lugares_votacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lugares_votacion (id, nombre, departamento, municipio, mujeres, hombres, total, mesas) FROM stdin;
6df4ac4a-5ac7-41bf-b7c6-2c5ea7f9b576	PUESTO CABECERA MUNICIPAL	CORDOBA	LA APARTADA (FRON)	5703	6021	11724	34
c8ae2571-86cc-4d25-a9c1-db819372e8cd	CAMPO ALEGRE	CORDOBA	LA APARTADA (FRON)	86	161	247	1
8b2bc828-f2f9-4aab-970b-333af222a758	LA BALSA	CORDOBA	LA APARTADA (FRON)	185	182	367	2
e614bead-7bea-4678-b513-1c8a0661c788	PUERTO CORDOBA	CORDOBA	LA APARTADA (FRON)	89	103	192	1
6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576	PUESTO CABECERA MUNICIPAL	CORDOBA	LA APARTADA (FRON)	5703	6021	11724	34
e614baed-7bea-4678-b513-1c8a0661c788	PUERTO CORDOBA	CORDOBA	LA APARTADA (FRON)	89	103	192	1
\.


--
-- Data for Name: mesas_votacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mesas_votacion (id, numero, lugar_id) FROM stdin;
61fdecaa-e453-41c3-8c82-fff7ba39f2a8	1	c8ae2571-86cc-4d25-a9c1-db819372e8cd
fa683153-9d0d-46f8-a3c0-557ba0852bec	1	8b2bc828-f2f9-4aab-970b-333af222a758
cc34304c-05b5-4b4b-83c3-598b5a99b2cf	2	8b2bc828-f2f9-4aab-970b-333af222a758
0774f12a-cd1f-491f-8f40-965b5eee3ff5	1	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
90847ee0-bac3-4eb8-87c9-97c07a6efa3f	2	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
77342492-f360-424c-a1cb-9ce44bad6bf1	3	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
28050ae0-6a4c-4231-ba84-41c6fbaa71fe	4	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
8dbf1d0d-21d8-43ea-a640-5a83230ce3d3	5	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
c6db9072-97a4-4926-a637-b2c8a8a54795	6	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
613ad459-6af6-49b1-ac5d-304ced3030ab	7	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
09d0ae53-6e67-4987-88eb-6945018ed2ae	8	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
a5b773d3-9323-4730-9c79-f359014bd65f	9	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
5f116ab1-cd68-400e-8872-3550e4f35d23	10	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
c7316250-e77c-4312-9725-985ab84c2b77	11	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
4a31b1d4-84ed-4189-abdd-ec507cd22363	12	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
a82ce092-6c0e-413e-a6d1-d1525d6b1e74	13	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
5c3c783c-cf83-4d8f-b8e1-f7169b92f036	14	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
a6ae7d1e-1e9f-4583-abca-31a6f9a6cb99	15	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
e37d82bd-2d83-4840-903f-3c5ec52e3ee9	16	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
5da32b9e-c38c-422f-a50f-42a6d8d1a7dd	17	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
5bd216fd-910f-4e19-a5eb-e250d75262e6	18	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
ee68be62-e8f6-4de7-a232-f04387d19aa1	19	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
2c8c3c11-87dd-4712-956f-4fdb9f3a936a	20	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
dd98b718-17e4-46b0-982f-fbce48db3897	21	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
adb3238b-460d-48fb-90dd-003efea83a39	22	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
164525fc-2eac-4e61-aa88-fc9bf19bff6c	23	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
2acea0dc-39c8-4d12-9c0a-201d16dd8aac	24	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
7f7b846c-bdef-4737-9f16-3fcaeb845640	25	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
7f55357a-6bcf-434b-b51d-c84501b27989	26	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
93622aa6-b721-48d1-884b-5ec785341ecb	27	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
b04f411e-4912-4b49-b918-275b8f8623b0	28	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
8432c1c4-6949-418f-a7c0-21831d27e9af	29	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
31705054-b7d4-4125-acfb-0211dcdf2712	30	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
fef26fa5-d7a6-4171-9d4b-e98e1c64641d	31	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
49189222-7ead-486b-ad11-4b34fec51f64	32	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
57496ab6-ce83-4105-b052-7595d6c30fd3	33	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
d8cad3b6-9115-4d4c-b883-5474e42fbc46	34	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576
605f5d49-1c2d-4f4b-9efc-04892f1d8a93	1	e614baed-7bea-4678-b513-1c8a0661c788
\.


--
-- Data for Name: municipios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.municipios (id, nombre) FROM stdin;
bbc04f33-3ef7-43f6-8228-1bb0e0953534	Buenavista
25f0aca5-35f4-4df9-aeed-e327ff9b7df8	Apartada (CORD)
\.


--
-- Data for Name: partidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partidos (id, nombre, logo_url) FROM stdin;
7e04d858-30ab-41c9-b3de-ce3f8c0e7737	Partido Verde	https://apicongresovisible.uniandes.edu.co/uploads/imgs/partidos/logos/partido_verde-logo.jpg
84f86bd0-0226-4f75-be82-6eb428490ff1	Partido Centro Democratico	https://apicongresovisible.uniandes.edu.co/uploads/imgs/partidos/logos/partido_verde-logo.jpg
4477dd0b-8931-478b-9235-5d01b2e6914e	Pacto Historico	https://apicongresovisible.uniandes.edu.co/uploads/imgs/partidos/logos/partido_verde-logo.jpg
\.


--
-- Data for Name: prospectos_votantes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prospectos_votantes (id, nombre_completo, cedula, telefono, direccion, municipio_id, barrio_id, lider_id, aspirante_concejo_id, aspirante_alcaldia_id, registrado_por, fecha_registro, activo, partido_id, zona, mesa_id, lugar_id, sexo) FROM stdin;
6bfb74a5-4d74-4418-8788-bfc7b412915f	ISAURA RODRIGUEZ	986541254	3015986371	Calle 9b nro 8 31	25f0aca5-35f4-4df9-aeed-e327ff9b7df8	df39e8fd-6f8a-4958-a685-ca655a951d46	a4f42d9e-0509-4e34-a238-15afec91572c	0b7489af-407c-488e-b8b7-b9e08569b228	\N	\N	2026-02-02 14:51:23.495522	t	4477dd0b-8931-478b-9235-5d01b2e6914e	Urbano	dd98b718-17e4-46b0-982f-fbce48db3897	6df4aca4-5ac7-41bf-b7c6-2e5ea7f9b576	Mujer
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, correo, password, rol, aspirante_concejo_id, aspirante_alcaldia_id, tipo_aspirante) FROM stdin;
40bc38c7-349d-427f-83d6-70adcc3ee7b2	Jesus Molina	admin@demo.com	$2b$10$azNMgGuJe8rQD71ayYziD.X0Ahg6od2V6wuWZQEKocERT5tD1MNCK	admin	0b7489af-407c-488e-b8b7-b9e08569b228	\N	\N
ed4b8da1-7e4c-4842-8b5f-2c9db5ef0530	Sirjhan Bentancurt	sirjhan@admin.com	$2b$10$yOggTSrQK2RMeqCBogCttuUJtOfT0LX/BYUMUp3pr.omvkGCv1Nxy	user	\N	\N	\N
\.


--
-- Name: asistencia_votantes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asistencia_votantes_id_seq', 12, true);


--
-- Name: asistencia_votantes asistencia_votantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_votantes
    ADD CONSTRAINT asistencia_votantes_pkey PRIMARY KEY (id);


--
-- Name: aspirantes_alcaldia aspirantes_alcaldia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_alcaldia
    ADD CONSTRAINT aspirantes_alcaldia_pkey PRIMARY KEY (id);


--
-- Name: aspirantes_concejo aspirantes_concejo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_pkey PRIMARY KEY (id);


--
-- Name: aspirantes aspirantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes
    ADD CONSTRAINT aspirantes_pkey PRIMARY KEY (id);


--
-- Name: barrios barrios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_pkey PRIMARY KEY (id);


--
-- Name: lideres lideres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lideres
    ADD CONSTRAINT lideres_pkey PRIMARY KEY (id);


--
-- Name: lugares_votacion lugares_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lugares_votacion
    ADD CONSTRAINT lugares_votacion_pkey PRIMARY KEY (id);


--
-- Name: mesas_votacion mesas_votacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesas_votacion
    ADD CONSTRAINT mesas_votacion_pkey PRIMARY KEY (id);


--
-- Name: municipios municipios_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_nombre_key UNIQUE (nombre);


--
-- Name: municipios municipios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.municipios
    ADD CONSTRAINT municipios_pkey PRIMARY KEY (id);


--
-- Name: partidos partidos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_nombre_key UNIQUE (nombre);


--
-- Name: partidos partidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partidos
    ADD CONSTRAINT partidos_pkey PRIMARY KEY (id);


--
-- Name: prospectos_votantes prospectos_votantes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_aspirantes_tipo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aspirantes_tipo ON public.aspirantes USING btree (tipo_aspirante);


--
-- Name: aspirantes_alcaldia aspirantes_alcaldia_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_alcaldia
    ADD CONSTRAINT aspirantes_alcaldia_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id);


--
-- Name: aspirantes_alcaldia aspirantes_alcaldia_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_alcaldia
    ADD CONSTRAINT aspirantes_alcaldia_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: aspirantes_concejo aspirantes_concejo_alcaldia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_alcaldia_id_fkey FOREIGN KEY (alcaldia_id) REFERENCES public.aspirantes_alcaldia(id) ON DELETE SET NULL;


--
-- Name: aspirantes_concejo aspirantes_concejo_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id);


--
-- Name: aspirantes_concejo aspirantes_concejo_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aspirantes_concejo
    ADD CONSTRAINT aspirantes_concejo_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: barrios barrios_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barrios
    ADD CONSTRAINT barrios_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id) ON DELETE CASCADE;


--
-- Name: asistencia_votantes fk_asistencia_votantes_prospectos_uuid; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asistencia_votantes
    ADD CONSTRAINT fk_asistencia_votantes_prospectos_uuid FOREIGN KEY (votante_uuid) REFERENCES public.prospectos_votantes(id) ON DELETE CASCADE;


--
-- Name: lideres lideres_aspirante_concejo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lideres
    ADD CONSTRAINT lideres_aspirante_concejo_id_fkey FOREIGN KEY (aspirante_concejo_id) REFERENCES public.aspirantes_concejo(id) ON DELETE SET NULL;


--
-- Name: mesas_votacion mesas_votacion_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mesas_votacion
    ADD CONSTRAINT mesas_votacion_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares_votacion(id) ON DELETE CASCADE;


--
-- Name: prospectos_votantes prospectos_votantes_aspirante_alcaldia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_aspirante_alcaldia_id_fkey FOREIGN KEY (aspirante_alcaldia_id) REFERENCES public.aspirantes_alcaldia(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_aspirante_concejo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_aspirante_concejo_id_fkey FOREIGN KEY (aspirante_concejo_id) REFERENCES public.aspirantes_concejo(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_barrio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_barrio_id_fkey FOREIGN KEY (barrio_id) REFERENCES public.barrios(id);


--
-- Name: prospectos_votantes prospectos_votantes_lider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_lider_id_fkey FOREIGN KEY (lider_id) REFERENCES public.lideres(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_lugar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_lugar_id_fkey FOREIGN KEY (lugar_id) REFERENCES public.lugares_votacion(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_mesa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_mesa_id_fkey FOREIGN KEY (mesa_id) REFERENCES public.mesas_votacion(id) ON DELETE SET NULL;


--
-- Name: prospectos_votantes prospectos_votantes_municipio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_municipio_id_fkey FOREIGN KEY (municipio_id) REFERENCES public.municipios(id);


--
-- Name: prospectos_votantes prospectos_votantes_partido_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prospectos_votantes
    ADD CONSTRAINT prospectos_votantes_partido_id_fkey FOREIGN KEY (partido_id) REFERENCES public.partidos(id);


--
-- Name: usuarios usuarios_aspirante_alcaldia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_aspirante_alcaldia_id_fkey FOREIGN KEY (aspirante_alcaldia_id) REFERENCES public.aspirantes_alcaldia(id);


--
-- Name: usuarios usuarios_aspirante_concejo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_aspirante_concejo_id_fkey FOREIGN KEY (aspirante_concejo_id) REFERENCES public.aspirantes_concejo(id);


--
-- PostgreSQL database dump complete
--

