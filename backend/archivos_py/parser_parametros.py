import re # Importa el módulo para expresiones regulares
from datetime import datetime, timedelta # Importa clases para manejar fechas y tiempos
from typing import Dict, List, Any, Optional # Importa tipos para anotaciones de tipo
from sentence_transformers import SentenceTransformer, util
import torch # Import the torch library
from logging import warning
import requests
import pandas as pd
import re
from datetime import datetime
import openai
import json
import os
import unicodedata
import PyPDF2
import time



'''La siguiente celda es la clase subvenciones parser el cual se compone de funciones para detectar parámetros, los cuales varios de ellos responden a nùmeros.
 Con la documentación que nos compartió Carmen, hice mapas de palabras comunes para unirlos con las categorías de cada argumento (por ejemplo actividades, instrumentos,regiones etc),
al final de todo la funcion "parsear_busqueda_subvenciones" es la que toma un texto (query) y devuelve un diccionario con los argumentos detectados para refinar la busqueda de convocatorias.



'''

class SubvencionesParser:
    """
    Clase para parsear texto en lenguaje natural y extraer parámetros de búsqueda
    para subvenciones. Permite identificar regiones, tipos de administración,
    beneficiarios, instrumentos, finalidades, actividades y fechas.
    """
    def __init__(self):
        """
        Constructor de la clase SubvencionesParser.
        Inicializa todos los mapeos (diccionarios) y patrones regex
        necesarios para la extracción de información.
        """
        # --- Mapeos de términos a IDs/valores ---

        # Mapeo de nombres de regiones/provincias de España a sus IDs numéricos.
        # Las claves son strings en minúsculas y los valores son listas que contienen el ID.
        self.regiones_map = {
            "a coruña": [4], "lugo": [5], "ourense": [6], "pontevedra": [7],
            "galicia": [3], "asturias": [9], "principado de asturias": [8],
            "cantabria": [11], "cantabria": [10], # Nota: 'cantabria' aparece dos veces con IDs diferentes, revisar si es intencional
            "noroeste": [2], "araba/álava": [14], "gipuzkoa": [15],
            "bizkaia": [16], "pais vasco": [13], "navarra": [18],
            "comunidad foral de navarra": [17], "la rioja": [20],
            "la rioja": [19], # Nota: 'la rioja' aparece dos veces con IDs diferentes, revisar si es intencional
            "huesca": [22], "teruel": [23], "zaragoza": [24],
            "aragon": [21], "noreste": [12], "madrid": [27],
            "comunidad de madrid": [26], "centro (es)": [28],
            "ávila": [30], "burgos": [31], "león": [32],
            "palencia": [33], "salamanca": [34], "segovia": [35],
            "soria": [36], "valladolid": [37], "zamora": [38],
            "castilla y leon": [29], "albacete": [40], "ciudad real": [41],
            "cuenca": [42], "guadalajara": [43], "toledo": [44],
            "castilla la mancha": [39], "badajoz": [46], "cáceres": [47],
            "extremadura": [45], "barcelona": [50], "girona": [51],
            "lleida": [52], "tarragona": [53], "cataluña": [49],
            "alicante": [55], "castellón": [56], "valencia": [57],
            "comunidad valenciana": [54], "eivissa y formentera": [59],
            "mallorca": [60], "menorca": [61], "illes balears": [58],
            "este": [48], "almería": [64], "cádiz": [65], "córdoba": [66],
            "granada": [67], "huelva": [68], "jaén": [69], "málaga": [70],
            "sevilla": [71], "andalucia": [63], "murcia": [73],
            "region de murcia": [72], "ceuta": [75], "ciudad autonoma de ceuta": [74],
            "melilla": [77], "ciudad autonoma de melilla": [76],
            "sur": [62], "el hierro": [80], "fuerteventura": [81],
            "gran canaria": [82], "la gomera": [83], "la palma": [84],
            "lanzarote": [85], "tenerife": [86], "canarias": [79],
            "españa": [1], "extra-regio nuts 1": [87]
        }

        # Mapeo de términos de tipo de administración a códigos (C: Central, A: Autonómica, L: Local, O: Otros).
        self.tipos_administracion_map = {
            'estatal': 'C', 'estado': 'C', 'central': 'C', 'gobierno': 'C', 'ministerio': 'C',
            'autonómica': 'A', 'autonomica': 'A', 'comunidad autónoma': 'A', 'comunidad autonoma': 'A',
            'local': 'L', 'ayuntamiento': 'L', 'municipio': 'L', 'diputación': 'L', 'diputacion': 'L',
            'otros': 'O', 'otras': 'O', 'otro': 'O', 'organismo': 'O'
        }

        # Mapeo de palabras clave de tipos de beneficiario a sus IDs numéricos.
        # Los IDs están en listas, lo que permite flexibilidad para futuras expansiones


        self.tipos_beneficiario_comunes_map = {

            "Esta categoría incluye a personas físicas que no desarrollan ninguna actividad económica. Engloba a particulares, ciudadanos en general, individuos, estudiantes, jubilados, desempleados, familias y hogares que buscan ayudas o beneficios.": [1],
            "Esta categoría se refiere a personas jurídicas que no persiguen un fin de lucro o no realizan una actividad económica lucrativa. Incluye a asociaciones, fundaciones, organizaciones sin ánimo de lucro (ONGs), clubes deportivos, federaciones, confederaciones, partidos políticos y colegios profesionales.": [2],
            "Engloba a Pequeñas y Medianas Empresas (PYMES) y a personas físicas (autónomos) que sí desarrollan una actividad económica. Aquí se incluyen autónomos, profesionales independientes, emprendedores, pequeños negocios, microempresas, sociedades limitadas (SL) y start-ups.": [3],
            "Esta categoría está dirigida a grandes empresas, corporaciones, multinacionales y otras entidades de gran envergadura o tamaño económico. Son organizaciones con una gran capacidad productiva y un número elevado de empleados.": [4]
        }

        # Mapeo de palabras clave de actividades económicas a sus IDs numéricos.
        # Las claves son strings en minúsculas.
        self.actividad_map = {
           "Sector primario que incluye la producción agrícola, la cría de animales (ganadería), el cultivo y aprovechamiento de bosques (silvicultura), y la captura de peces y otros recursos acuáticos.": 274,
            "Actividades relacionadas con la extracción de minerales sólidos, líquidos y gaseosos de la Tierra, como la minería de carbón, petróleo, gas natural o metales.": 278,
            "Transformación de materiales o sustancias en nuevos productos, ya sea en fábricas o plantas. Incluye la fabricación de alimentos, textiles, maquinaria, productos químicos, electrónicos, etc.": 284,
            "Producción, transporte y distribución de electricidad, gas natural, vapor y sistemas de aire acondicionado para consumo doméstico, comercial e industrial.": 309,
            "Gestión del ciclo integral del agua (captación, tratamiento y suministro), recolección y tratamiento de aguas residuales, gestión de residuos (recogida, tratamiento, eliminación) y actividades de descontaminación ambiental.": 311,
            "Edificación de todo tipo (residencial y no residencial), ingeniería civil (carreteras, puentes, etc.) y trabajos especializados de construcción.": 316,
            "Comercialización de bienes a otros negocios (mayor) o directamente a consumidores (menor), así como el mantenimiento y reparación de vehículos de motor y motocicletas.": 320,
            "Servicios de transporte de pasajeros y mercancías por vía terrestre, marítima, aérea y espacial, además del almacenamiento de bienes.": 324,
            "Actividades de alojamiento (hoteles, campings) y servicios de comida y bebida (restaurantes, bares, cafeterías).": 330,
            "Producción y distribución de productos y servicios de información y comunicación. Incluye edición, cine, radio, televisión, telecomunicaciones y programación informática.": 333,
            "Servicios financieros como banca, seguros, fondos de inversión, y otras operaciones monetarias y crediticias.": 340,
            "Actividades relacionadas con la compra, venta, alquiler y gestión de propiedades inmobiliarias.": 344,
            "Servicios especializados que requieren un alto grado de conocimiento o habilidad, como consultoría, servicios jurídicos, contabilidad, arquitectura, ingeniería, investigación y desarrollo.": 346,
            "Servicios de apoyo a las empresas y a la actividad profesional, como alquiler de vehículos, gestión de empleo, seguridad, limpieza de edificios, y servicios de oficina.": 354,
            "Actividades propias del gobierno, la administración de justicia, la seguridad pública, la defensa nacional y los regímenes obligatorios de seguridad social.": 361,
            "Provisión de instrucción y formación en diversos niveles y especialidades, desde la educación infantil hasta la universitaria y la formación continua.": 363,
            "Servicios de atención médica, hospitalaria, dental y de enfermería, así como actividades de asistencia social sin alojamiento (trabajo social, servicios de guardería).": 365,
            "Operaciones relacionadas con las artes escénicas, espectáculos, museos, jardines botánicos y zoológicos, parques de atracciones, actividades deportivas y de recreo.": 369,
            "Categoría miscelánea que incluye servicios personales (peluquerías, salones de belleza), servicios de lavandería, reparaciones de ordenadores y artículos personales, y otras actividades no clasificadas en otros apartados.": 374,
            "Actividades realizadas por hogares particulares que emplean personal doméstico para el servicio propio, y la producción de bienes y servicios por los hogares para su consumo exclusivo.": 378,
            "Actividades de organismos internacionales, embajadas, misiones diplomáticas y otros cuerpos extraterritoriales.": 381
        }


        # Mapeo de palabras clave de instrumentos de ayuda a sus IDs numéricos.
        # Los IDs están en listas, permitiendo asociar múltiples palabras a un mismo ID.
        self.instrumentos_map = {


            "SUBVENCIÓN Y ENTREGA DINERARIA SIN CONTRAPRESTACIÓN. Ayuda económica no reembolsable, también conocida como subvención directa, que se otorga sin esperar devolución ni contraprestación. Se vincula a un objetivo concreto como la innovación, el empleo, o el desarrollo regional. Palabras clave: subvención, ayuda directa, entrega dineraria, no reembolsable, sin contraprestación.": 1,

            "PRÉSTAMO. Instrumento financiero basado en la entrega de capital reembolsable, generalmente sujeto a intereses y plazos de amortización. Puede tener tipo de interés fijo o variable. Frecuente en programas de financiación para inversiones, digitalización o crecimiento empresarial. Palabras clave: préstamo, devolución, intereses, amortización, financiación reembolsable.": 2,

            "GARANTÍA. Instrumento de aval, fianza o respaldo financiero proporcionado por una entidad para asegurar el cumplimiento de obligaciones o facilitar el acceso a otras fuentes de financiación. Se usa mucho en licitaciones, proyectos de inversión o emprendimiento. Palabras clave: garantía, aval, respaldo, fianza, seguridad financiera.": 4,

            "VENTAJA FISCAL. Conjunto de incentivos en materia de impuestos o tributos, como deducciones fiscales, bonificaciones, exenciones o aplazamientos. Permiten a empresas o autónomos reducir su carga fiscal. Muy frecuente en políticas de I+D+i o empleo. Palabras clave: ventaja fiscal, deducción, bonificación, exención, ahorro tributario.": 5,

            "APORTACIÓN DE FINANCIACIÓN DE RIESGO. Modalidad de inversión que implica asumir riesgo empresarial, como el capital riesgo o el venture capital. El apoyo se hace mediante la entrada al capital social o financiación subordinada. Muy usada en startups o proyectos con alto potencial de crecimiento. Palabras clave: capital riesgo, inversión, venture capital, participación, financiación de riesgo.": 6,

            "OTROS INSTRUMENTOS DE AYUDA. Categoría abierta para apoyos no monetarios directos como consultoría gratuita, asesoramiento técnico, acceso a espacios físicos o servicios sin coste. Incluye cualquier forma de ayuda que no sea préstamo, subvención, garantía, fiscalidad o capital. Palabras clave: asesoramiento, consultoría, cesión, soporte no financiero, apoyo institucional.": 7


        }


        # Mapeo de palabras clave de finalidades de política de gasto a sus IDs numéricos.
        self.finalidades_map = {



            "ACCESO A LA VIVIENDA Y FOMENTO DE LA EDIFICACIÓN. Ayudas y programas dirigidos a facilitar la adquisición, el alquiler o la rehabilitación de viviendas, así como al impulso y financiación de proyectos de construcción de nuevas edificaciones. Palabras clave: vivienda, alquiler, hipoteca, rehabilitación, edificación.": 8,
            "AGRICULTURA, PESCA Y ALIMENTACIÓN. Programas de apoyo a la agricultura, la ganadería, la silvicultura, la pesca y todas las actividades relacionadas con la producción, transformación y comercialización de alimentos. Palabras clave: agroalimentario, ganadería, agricultura, pesca, alimentos.": 12,
            "COMERCIO, TURISMO Y PYMES. Iniciativas y fondos destinados a impulsar el comercio minorista y mayorista, la promoción turística de destinos y servicios, y el apoyo específico a Pequeñas y Medianas Empresas (PYMES) en su desarrollo y crecimiento. Palabras clave: comercio, turismo, pyme, hostelería, marketing comercial.": 14,
            "COOPERACIÓN INTERNACIONAL PARA EL DESARROLLO Y CULTURAL. Proyectos y fondos orientados a la colaboración con otros países para su desarrollo económico y social, así como al fomento y difusión de la cultura a nivel internacional. Palabras clave: cooperación internacional, ayuda exterior, desarrollo global, cultura exterior, relaciones internacionales.": 20,
            "CULTURA. Ayudas y programas para la promoción, conservación y difusión del patrimonio cultural, las artes escénicas, las bellas artes, el cine, la música, la literatura y otras manifestaciones culturales. Palabras clave: patrimonio, arte, cine, música, literatura.": 11,
            "DEFENSA. Programas y presupuestos destinados a la seguridad y defensa nacional, incluyendo el equipamiento militar, la formación de personal y las operaciones de seguridad y protección. Palabras clave: defensa, militar, ejército, armamento, estrategia nacional.": 2,
            "DESEMPLEO. Ayudas y prestaciones dirigidas a personas en situación de desempleo, incluyendo subsidios, prestaciones por desempleo y programas de reinserción laboral. Palabras clave: paro, subsidio, prestación por desempleo, reinserción, desempleado.": 7,
            "EDUCACION. Fondos y programas dedicados a la financiación de centros educativos, becas para estudiantes, formación profesional, educación superior y todas las actividades relacionadas con la enseñanza y el aprendizaje. Palabras clave: educación, beca, escolar, universidad, formación académica.": 10,
            "FOMENTO DEL EMPLEO. Iniciativas y ayudas para la creación de empleo, el fomento del autoempleo, la formación y cualificación profesional, y el apoyo a la contratación de colectivos específicos. Palabras clave: contratación, autoempleo, inserción laboral, empleabilidad, creación de empleo.": 6,
            "INDUSTRIA Y ENERGÍA. Ayudas y programas para el desarrollo de la industria, la innovación tecnológica en el sector industrial, la eficiencia energética y el fomento de fuentes de energía sostenibles. Palabras clave: industria, energía, eficiencia energética, fábrica, energía renovable.": 13,
            "INFORMACIÓN NO DISPONIBLE. Esta categoría se utiliza cuando no se dispone de información específica o suficiente para clasificar la ayuda en ninguna de las otras áreas definidas. Palabras clave: desconocido, sin categorizar, información ausente, no disponible.": 21,
            "INFRAESTRUCTURAS. Inversiones y proyectos para el desarrollo y mantenimiento de infraestructuras de transporte (carreteras, ferrocarriles, puertos, aeropuertos), energéticas, hidráulicas o de telecomunicaciones. Palabras clave: carreteras, infraestructuras, transporte, puertos, telecomunicaciones.": 16,
            "INVESTIGACIÓN, DESARROLLO E INNOVACIÓN. Apoyo a proyectos de investigación científica, desarrollo tecnológico y actividades de innovación en todos los sectores, buscando el avance del conocimiento y la aplicación de nuevas tecnologías. Palabras clave: I+D, innovación, ciencia, desarrollo tecnológico, investigación aplicada.": 17,
            "JUSTICIA. Programas y fondos relacionados con la administración de justicia, los sistemas judiciales, la asistencia legal y los servicios penitenciarios. Palabras clave: justicia, tribunales, legal, juzgado, penitenciario.": 1,
            "OTRAS ACTUACIONES DE CARÁCTER ECONÓMICO. Categoría amplia que engloba subvenciones y ayudas no clasificables en otros sectores específicos, pero que tienen un claro impacto o finalidad económica, como apoyo a empresas en general, desarrollo regional, etc. Palabras clave: subvenciones, incentivo empresarial, desarrollo economico, crecimiento.": 18,
            "OTRAS PRESTACIONES ECONÓMICAS. Incluye diversas ayudas económicas que no se ajustan a las categorías de empleo, vivienda o dependencia, como ayudas a familias, a la natalidad, o prestaciones económicas por situaciones especiales. Palabras clave: natalidad, familia numerosa, prestación especial, ayuda puntual, situación excepcional.": 4,
            "SANIDAD. Programas y fondos destinados a la atención sanitaria, la prevención de enfermedades, la salud pública, la investigación médica y la mejora de los servicios de salud. Palabras clave: salud, sanidad, atención médica, prevención, sistema sanitario.": 9,
            "SEGURIDAD CIUDADANA E INSTITUCIONES PENITENCIARIAS. Ayudas y presupuestos para la seguridad pública, las fuerzas y cuerpos de seguridad, la prevención del delito, y la gestión y funcionamiento de las instituciones penitenciarias. Palabras clave: seguridad, policía, vigilancia, delincuencia, prisión.": 3,
            "SERVICIOS SOCIALES Y PROMOCIÓN SOCIAL. Programas y prestaciones dirigidos a colectivos vulnerables, promoción de la inclusión social, atención a la dependencia, servicios para personas mayores o con discapacidad, y otras iniciativas de bienestar social. Palabras clave: servicios sociales, dependencia, inclusión, personas mayores, discapacidad.": 5,
            "SIN INFORMACION ESPECIFICA. Similar a 'INFORMACIÓN NO DISPONIBLE', esta categoría se usa cuando la temática de la subvención no está claramente definida o especificada dentro de las categorías preestablecidas. Palabras clave: sin información, sin especificar, indeterminado, categoría desconocida.": 19,
            "SUBVENCIONES AL TRANSPORTE. Ayudas específicas destinadas a fomentar el uso del transporte público, la mejora de infraestructuras de transporte o la subvención de billetes o abonos para usuarios. Palabras clave: transporte público, billete subvencionado, movilidad urbana, bono transporte, accesibilidad vial.": 15
        }


        # --- Patrones de Expresiones Regulares para Fechas ---
        self.fecha_patterns = [
            # dd/mm/yyyy o dd-mm-yyyy precedido de 'desde' o 'a partir de'
            r'desde\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            r'a partir del?\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            # dd/mm/yyyy o dd-mm-yyyy precedido de 'hasta' o 'antes de'
            r'hasta\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            r'antes del?\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            # Rango de fechas: dd/mm/yyyy hasta dd/mm/yyyy
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+hasta\s+(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
            # Año solo (ej. '2025'). \b asegura que sea una palabra completa para evitar coincidencias parciales.
            r'\b(\d{4})\b'
        ]

        self.model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-mpnet-base-v2')
        #encode de tipos de beneficiario
        self.common_beneficiary_terms = list(self.tipos_beneficiario_comunes_map.keys())
        self.common_terms_embeddings = self.model.encode(self.common_beneficiary_terms, convert_to_tensor=True)


        #encode tipos de act
        self.common_activities_terms = list(self.actividad_map.keys())
        self.common_activities_embeddings = self.model.encode(self.common_activities_terms, convert_to_tensor=True)

        #encode tipos de instrumento
        self.common_instrumentos_terms = list(self.instrumentos_map.keys())
        self.common_instrumentos_embeddings = self.model.encode(self.common_instrumentos_terms, convert_to_tensor=True)

        #encode finalidades
        self.common_finalidades_terms = list(self.finalidades_map.keys())
        self.common_finalidades_embeddings = self.model.encode(self.common_finalidades_terms, convert_to_tensor=True)


    def extraer_parametros(self, texto: str) -> Dict[str, Any]:
        """
        Función principal para extraer parámetros de búsqueda de subvenciones
        desde texto en lenguaje natural. Procesa el texto y llama a funciones
        auxiliares para identificar diferentes tipos de información.

        Args:
            texto (str): Texto de búsqueda en lenguaje natural proporcionado por el usuario.

        Returns:
            Dict[str, Any]: Un diccionario que contiene todos los parámetros
                            extraídos, listos para ser utilizados en una API
                            o sistema de búsqueda de subvenciones.
        """
        # Normaliza el texto de entrada: convierte a minúsculas y elimina espacios en blanco al inicio/final.
        texto_lower = texto.lower().strip()
        parametros = {} # Inicializa un diccionario vacío para almacenar los parámetros encontrados.

        # --- Extracción de la Descripción (términos clave) ---
        # Llama a la función auxiliar para extraer los términos de búsqueda principales.
        descripcion = self._extraer_descripcion(texto_lower)
        if descripcion:
            parametros['descripcion'] = descripcion
            # Establece un tipo de búsqueda por defecto si se encuentra una descripción.
            parametros['descripcionTipoBusqueda'] = 2  # '2' suele significar "todas las palabras"

        # --- Extracción de Regiones ---
        # Llama a la función auxiliar para identificar regiones.
        regiones = self._extraer_regiones(texto_lower)
        if regiones:
            parametros['regiones'] = regiones

        # --- Extracción del Tipo de Administración ---
        # Llama a la función auxiliar para determinar si la búsqueda es estatal, autonómica, local, etc.
        tipo_admin = self._extraer_tipo_administracion(texto_lower)
        if tipo_admin:
            parametros['tipoAdministracion'] = tipo_admin

        # --- Extracción de Tipos de Beneficiario ---
        # Llama a la función auxiliar para identificar a quién va dirigida la subvención.
        tipos_benef = self.extraer_tipo_beneficiario(texto_lower)
        if tipos_benef:
            parametros['tiposBeneficiario'] = tipos_benef

        # --- Extracción de Instrumentos ---
        # Llama a la función auxiliar para identificar el tipo de ayuda (subvención, préstamo, etc.).
        instrumentos = self._extraer_instrumentos(texto_lower)
        if instrumentos:
            parametros['instrumentos'] = instrumentos

        # --- Extracción de Finalidad ---
        # Llama a la función auxiliar para determinar la finalidad o sector de la política de gasto.
        finalidad = self._extraer_finalidad(texto_lower)
        if finalidad:
            parametros['finalidad'] = finalidad

        # --- Extracción de Actividad Económica ---
        # Llama a la función auxiliar para identificar el tipo de actividad económica.

        actividad = self._extraer_actividad(texto_lower)
        if actividad:
            parametros['actividad'] = actividad

        # --- Extracción de Fechas ---
        # Llama a la función auxiliar para identificar fechas o rangos de fechas.
        fechas = self._extraer_fechas(texto_lower)
        if fechas:
            # Agrega los pares clave-valor de fechas al diccionario de parámetros principal.
            parametros.update(fechas)

        # --- Extracción de Número de Convocatoria ---
        # Llama a la función auxiliar para buscar un número de convocatoria específico (ej. BDNS).
        numero_conv = self._extraer_numero_convocatoria(texto) # Usa el texto original, no el lower para posibles mayúsculas en códigos
        if numero_conv:
            parametros['numeroConvocatoria'] = numero_conv

        # --- Detección de MRR (Mecanismo de Recuperación y Resiliencia) ---
        # Busca términos relacionados con los fondos Next Generation.
        if any(term in texto_lower for term in ['mrr', 'recuperación', 'resiliencia', 'next generation']):
            parametros['mrr'] = True

        # --- Configuración de Parámetros por Defecto ---
        # Establece valores por defecto para parámetros que no fueron especificados en la consulta.
        if 'descripcionTipoBusqueda' not in parametros:
            parametros['descripcionTipoBusqueda'] = 2  # Por defecto: buscar todas las palabras de la descripción.
        if 'order' not in parametros:
            parametros['order'] = 'fechaRecepcion' # Ordenar por fecha de recepción.
        if 'direccion' not in parametros:
            parametros['direccion'] = 'desc'  # Orden descendente (más recientes primero).
        if 'vpd'not in parametros:
            parametros['vpd'] = 'GE' # Valor por defecto para 'vpd' (posiblemente 'Vigencia de Publicación/Documento').
        if 'page' not in parametros:
            parametros['page'] = 0 # Página inicial de resultados.
        if 'pageSize' not in parametros:
            parametros['pageSize'] = 25 # Número de resultados por página.

        return parametros

    def _extraer_descripcion(self, texto: str) -> Optional[str]:
        """
        Extrae los términos clave de la descripción de la búsqueda,
        filtrando palabras comunes (stop words) que no aportan significado.

        Args:
            texto (str): Texto de la consulta en minúsculas.

        Returns:
            Optional[str]: Una cadena con las palabras clave extraídas (máximo 5),
                           o None si no se encuentran palabras clave significativas.
        """
        if texto.strip().isdigit():
            return None
        # Palabras a ignorar que son muy comunes o funcionales en las consultas.
        stop_words = {
        'a', 'al', 'algo', 'algunas', 'algunos', 'ante', 'antes', 'como', 'con',
        'contra', 'cual', 'cuando', 'de', 'del', 'desde', 'donde', 'durante', 'e',
        'el', 'ella', 'ellas', 'ellos', 'en', 'entre', 'es', 'esa', 'esas', 'ese',
        'eso', 'esos', 'esta', 'estas', 'este', 'esto', 'estos', 'existen', 'hacia',
        'hasta', 'incluso', 'la', 'las', 'le', 'les', 'lo', 'los', 'muy', 'ni',
        'o', 'otro', 'otras', 'otros', 'para', 'pero', 'por', 'que', 'quien',
        'quienes', 'se', 'sea', 'sean', 'si', 'sido', 'sin', 'sino', 'solo', 'su',
        'sus', 'tal', 'también', 'tan', 'te', 'tener', 'tienen', 'todo', 'todos',
        'tras', 'un', 'una', 'uno', 'unos', 'usted', 'ustedes', 'y', 'ya', 'yo',
        'acerca', 'además', 'apenas', 'así', 'aún', 'aunque', 'casi', 'cierta',
        'ciertas', 'cierto', 'ciertos', 'cómo', 'cualquier', 'cuándo', 'dado',
        'debido', 'demás', 'esos', 'estas', 'este', 'estos', 'fin', 'fue', 'fueron',
        'fuesen', 'fuesemos', 'hubiera', 'hubieramos', 'hubiesen', 'hubiesemos',
        'hubo', 'igualmente', 'incluso', 'más', 'mismo', 'muchas', 'muchos', 'nadie',
        'ninguna', 'ninguno', 'nunca', 'poco', 'pocas', 'pocos', 'pueden', 'puedo',
        'quiero', 'respecto', 'saber', 'ser', 'siempre', 'sólo', 'solos', 'somos',
        'suele', 'tal', 'también', 'tampoco', 'tengo', 'tienes', 'todas', 'todo',
        'va', 'vamos', 'van', 'vez', 'veces', 'vía', 'voy', 'y',
        # Palabras específicas de consulta que no aportan valor semántico
        'ayudame', 'ayúdame', 'buscar', 'encontrar', 'referentes', 'sobre',
        'relacionado', 'relacionados', 'me', 'quiero', 'gustaría', 'saber', 'hay',
        'quieres', 'necesito', 'podría', 'podríamos', 'favor', 'información', 'dónde',
        'cuál', 'cuáles', 'quién', 'quiénes', 'por qué', 'para qué', 'cómo', 'dónde',
        'cuando', 'qué', 'cual', 'esto', 'estas', 'ese', 'eso', 'esos', 'su', 'sus',
        'mis', 'mi', 'tu', 'tus', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro',
        'vuestra', 'vuestros', 'vuestras', 'suya', 'suyos', 'suyas', 'mío', 'mía',
        'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'mismo', 'misma', 'mismos',
        'mismas', 'cada', 'cierto', 'cierta', 'ciertos', 'ciertas', 'poco', 'poca',
        'pocos', 'pocas', 'mucho', 'mucha', 'muchos', 'muchas', 'bastante', 'demasiado',
        'todo', 'toda', 'todos', 'todas', 'varios', 'varias', 'ambos', 'ambas', 'sendos',
        'sendas', 'otro', 'otra', 'otros', 'otras', 'mismo', 'misma', 'mismos', 'mismas',
        'tan', 'tanto', 'tanta', 'tantos', 'tantas', 'cuan', 'cuanto', 'cuanta',
        'cuantos', 'cuantas', 'más', 'menos', 'mejor', 'peor', 'antes', 'después',
        'durante', 'mientras', 'siempre', 'nunca', 'jamás', 'aún', 'todavía',
        'ya', 'apenas', 'casi', 'así', 'bien', 'mal', 'alto', 'bajo', 'lejos', 'cerca',
        'dentro', 'fuera', 'arriba', 'abajo', 'delante', 'detrás', 'aquí', 'allí',
        'ahí', 'entonces', 'luego', 'asimismo', 'además', 'incluso', 'no', 'sí',
        'quizás', 'quizá', 'acaso', 'probablemente', 'posiblemente', 'ciertamente',
        'efectivamente', 'en efecto', 'por supuesto', 'claro', 'dónde', 'cuándo',
        'cómo', 'por qué', 'para qué', 'hacia dónde', 'de dónde', 'a dónde',
        'con quién', 'de quién', 'para quién', 'por quién', 'entre quiénes',
        'contra quién', 'sin quién', 'a pesar de', 'a fin de', 'con el fin de',
        'a través de', 'en cuanto a', 'en medio de', 'en vez de', 'por parte de',
        'a lo largo de', 'alrededor de', 'debajo de', 'encima de', 'frente a',
        'junto a', 'a causa de', 'con motivo de', 'por culpa de', 'debido a',
        'gracias a', 'para con', 'sin embargo', 'no obstante', 'por consiguiente',
        'por lo tanto', 'así que', 'de modo que', 'de manera que', 'en resumen',
        'en conclusión', 'finalmente', 'en primer lugar', 'en segundo lugar',
        'por último', 'en general', 'en particular', 'por ejemplo', 'es decir',
        'o sea', 'en otras palabras', 'además', 'asimismo', 'incluso', 'también',
        'por otra parte', 'por un lado', 'por otro lado', 'en cambio', 'al contrario',
        'a diferencia de', 'mientras que', 'aunque', 'a pesar de', 'por más que',
        'si bien', 'para que', 'a fin de que', 'con el objeto de que', 'con el fin de que',
        'con la finalidad de que', 'de modo que', 'de manera que', 'tan pronto como',
        'en cuanto', 'apenas', 'no bien', 'mientras tanto', 'hasta que', 'desde que',
        'antes de que', 'después de que', 'para cuándo', 'de dónde', 'a dónde', 'cuánto',
        'cuánta', 'cuántos', 'cuántas'
    }

        # Encuentra todas las palabras alfanuméricas en el texto.
        palabras = re.findall(r'\b\w+\b', texto)
        # Filtra las palabras: no deben ser stop words y deben tener más de 2 caracteres.
        palabras_clave = [p for p in palabras if p.lower() not in stop_words and len(p) > 2]

        if palabras_clave:
            # Retorna un máximo de 5 palabras clave, unidas por espacios.
            return ' '.join(palabras_clave[:15])
        return None

    def _extraer_regiones(self, texto: str) -> Optional[List[int]]:
        """
        Extrae los IDs de las regiones españolas mencionadas en el texto.

        Args:
            texto (str): Texto de la consulta en minúsculas.

        Returns:
            Optional[List[int]]: Una lista de IDs únicos de regiones encontradas,
                                  o None si no se identifica ninguna región.
        """
        regiones_encontradas = []
        # Itera sobre el mapeo de regiones.
        for region, ids in self.regiones_map.items():
            # Si el nombre de la región está en el texto, añade sus IDs a la lista.
            if region in texto:
                regiones_encontradas.extend(ids)

        # Devuelve una lista de IDs únicos, o None si la lista está vacía.
        return list(set(regiones_encontradas)) if regiones_encontradas else None

    def _extraer_tipo_administracion(self, texto: str) -> Optional[str]:
        """
        Extrae el tipo de administración (Estatal, Autonómica, Local, Otros)
        mencionado en el texto.

        Args:
            texto (str): Texto de la consulta en minúsculas.

        Returns:
            Optional[str]: El código del tipo de administración ('C', 'A', 'L', 'O'),
                           o None si no se identifica.
        """
        # Itera sobre el mapeo de tipos de administración.
        for tipo, codigo in self.tipos_administracion_map.items():
            # Si el término del tipo de administración está en el texto, retorna su código.
            # Se detiene en la primera coincidencia.
            if tipo in texto:
                return codigo
        return None

    def extraer_tipo_beneficiario(self,texto: str) -> Optional[List[int]]:
        """
        Clasifica el tipo de beneficiario usando similitud de embeddings contra términos comunes.
        """
        query_embedding = self.model.encode(texto, convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, self.common_terms_embeddings)[0]
        max_score=cosine_scores.max()
        matchs=None
        if max_score>.20:
          max_pos=torch.argmax(cosine_scores)
          term=self.common_beneficiary_terms[max_pos]
          matchs=self.tipos_beneficiario_comunes_map[term]
        else:
          return None


        '''# Si desea un "fallback" a SIN INFORMACION ESPECIFICA si no hay matches por encima del umbral
        if not matchs and 5 in self.tipos_beneficiario_comunes_map.values():
            # Asumiendo que ID 5 es 'SIN INFORMACION ESPECIFICA'
            matchs.add(5) '''

        return matchs if matchs else None

    def _extraer_instrumentos(self, texto: str) -> Optional[List[int]]:
        """
        Extrae los IDs de los instrumentos de ayuda (ej. subvención, préstamo)
        mencionados en el texto.

        Args:
            texto (str): Texto de la consulta en minúsculas.

        Returns:
            Optional[List[int]]: Una lista de IDs únicos de instrumentos encontrados,
                                  o None si no se identifica ninguno.
        """
        query_embedding = self.model.encode(texto, convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, self.common_instrumentos_embeddings)[0]
        top_scores, top_indices = torch.topk(cosine_scores, 2)
        top=zip(top_scores.tolist(),top_indices.tolist())
        print(top)

        top_terms=[]
        for score,indice in top:
            if score>.20:
              top_terms.append(self.common_instrumentos_terms[indice])



        matchs = []
        for term in top_terms:
            if term in self.instrumentos_map:
              matchs.append(self.instrumentos_map[term])



        # Devuelve una lista de IDs únicos, o None si la lista está vacía.
        return list(set(matchs)) if matchs else None

    def _extraer_finalidad(self, texto: str) -> Optional[int]:
        """
        Extrae el ID de la finalidad de la política de gasto (ej. vivienda, agricultura)
        mencionada en el texto.

        Args:
            texto (str): Texto de la consulta en minúsculas.

        Returns:
            Optional[int]: El ID de la finalidad encontrada, o None si no se identifica.
                           Retorna la primera coincidencia.
        """
        query_embedding = self.model.encode(texto, convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, self.common_finalidades_embeddings)[0]
        max_score=cosine_scores.max()
        print(max_score)
        matchs=None
        if max_score>.2:
          max_pos=torch.argmax(cosine_scores)
          term=self.common_finalidades_terms[max_pos]
          matchs=self.finalidades_map[term]

        # Devuelve una lista de IDs únicos, o None si la lista está vacía.
        return matchs if matchs else None


    def _extraer_actividad(self, texto: str) -> Optional[int]:
        """
        Clasifica el tipo de actividad usando similitud de embeddings contra términos comunes.
        """

        query_embedding = self.model.encode(texto, convert_to_tensor=True)
        cosine_scores = util.cos_sim(query_embedding, self.common_activities_embeddings)[0]
        max_score=cosine_scores.max()
        matchs=None
        if max_score>.2:

          max_pos=torch.argmax(cosine_scores)
          term=self.common_activities_terms[max_pos]
          matchs=self.actividad_map[term]
        else:
          return None


        return matchs if matchs else None

    def _extraer_fechas(self, texto: str) -> Dict[str, str]:
        """
        Extrae fechas o rangos de fechas (fechaDesde, fechaHasta, anioInteres)
        del texto utilizando expresiones regulares.

        Args:
            texto (str): Texto de la consulta en minúsculas.

        Returns:
            Dict[str, str]: Un diccionario con las fechas extraídas .
        """
        fechas = {}
        # Itera sobre cada patrón de expresión regular predefinido para fechas.
        for pattern in self.fecha_patterns:
            # Encuentra todas las coincidencias del patrón en el texto.
            matches = re.finditer(pattern, texto)
            for match in matches:
                # Lógica para patrones de "desde" o "a partir de" (formato dd/mm/yyyy)
                if 'desde' in pattern or 'partir' in pattern:
                    # Verifica que haya al menos 3 grupos capturados (día, mes, año)
                    if len(match.groups()) >= 3:
                        # Formatea la fecha y la asigna a 'fechaDesde'. zfill(2) añade un cero inicial si es necesario (ej. 1 -> 01).
                        fechas['fechaDesde'] = f"{match.group(1).zfill(2)}/{match.group(2).zfill(2)}/{match.group(3)}"
                # Lógica para patrones de "hasta" o "antes de" (formato dd/mm/yyyy)
                elif 'hasta' in pattern or 'antes' in pattern:
                    if len(match.groups()) >= 3:
                        fechas['fechaHasta'] = f"{match.group(1).zfill(2)}/{match.group(2).zfill(2)}/{match.group(3)}"
                # Lógica para el patrón de rango completo (dd/mm/yyyy hasta dd/mm/yyyy)
                elif len(match.groups()) == 6: # Este patrón captura 6 grupos (3 para la primera fecha, 3 para la segunda)
                    fechas['fechaDesde'] = f"{match.group(1).zfill(2)}/{match.group(2).zfill(2)}/{match.group(3)}"
                    fechas['fechaHasta'] = f"{match.group(4).zfill(2)}/{match.group(5).zfill(2)}/{match.group(6)}"

        return fechas

    def _extraer_numero_convocatoria(self, texto: str) -> Optional[str]:
        """
        Extrae un posible número de convocatoria BDNS (Base de Datos Nacional de Subvenciones),
        identificando una secuencia de 6 dígitos como palabra completa.

        Args:
            texto (str): Texto original de la consulta.

        Returns:
            Optional[str]: El número de convocatoria encontrado como string, o None si no se halla.
        """
        # Busca una secuencia de exactamente 6 dígitos rodeada por límites de palabra.
        match = re.search(r'\b\d{6}\b', texto)
        return match.group() if match else None


# --- Función Principal de Parsing ---
def parsear_busqueda_subvenciones(texto_busqueda: str) -> Dict[str, Any]:
    """
    Función principal de utilidad que encapsula la lógica de parsing de búsquedas
    de subvenciones. Crea una instancia de SubvencionesParser y llama a su
    método `extraer_parametros`.

    Args:
        texto_busqueda (str): El texto de la búsqueda en lenguaje natural del usuario.

    Returns:
        Dict[str, Any]: Un diccionario con los parámetros de búsqueda extraídos.
    """
    parser = SubvencionesParser()
    return parser.extraer_parametros(texto_busqueda)



# ---------- FUNCIONES AUXILIARES -----------


'''Aqui hay algunas funciones auxiliares basadas en el trabajo de Carmen para comunicarnos con el sitio web de subvenciones.

'''

def buscar_convocatorias(**params): #esta funcion toma el diccionario de palabras obtenido de la función "parsear_busqueda_subvenciones" y hace un request con la API al sitio de subvenciones.
#se obtiene un DF con las convocatorias que satisfacen los argumentos del diccionario.
    base_url = "https://www.pap.hacienda.gob.es/bdnstrans/api/convocatorias/busqueda"
    headers = {"Accept": "application/json"}
    page_size = params.get("pageSize", 25)
    max_paginas = 3
    resultados = []
    params.setdefault("vpd", "GE")
    params.setdefault("pageSize", page_size)
    for pagina in range(0, max_paginas):
        params["page"] = pagina
        try:
            response = requests.get(base_url, params=params, headers=headers)
            response.raise_for_status()
            if "application/json" in response.headers.get("Content-Type", ""):
                data = response.json()
                convocatorias = data.get("convocatorias", data.get("content", []))
                if not convocatorias:
                    break
                resultados.extend(convocatorias)
                time.sleep(0.5)
        except Exception as e:
            break
    return pd.DataFrame(resultados)

def obtener_convocatoria_por_id(num_conv): #esta funcion toma un numero especifico de convocatoria y realiza un request a la API, la cual devuelve un diccionario con información específica de la convocatoria.
    base_url = "https://www.infosubvenciones.es/bdnstrans/api/convocatorias"
    params = {"vpd": "GE", "numConv": str(num_conv)}
    headers = {"Accept": "application/json"}
    r = requests.get(base_url, params=params, headers=headers)
    if r.status_code == 200 and "application/json" in r.headers.get("Content-Type", ""):
        return r.json()
    else:
        return None

def descargar_documento_pdf(documento_id, nombre): #esta funcion requiere el documento_id y nombre y descarga en ruta relativa el pdf en cuestión.
    url = f"https://www.infosubvenciones.es/bdnstrans/api/convocatorias/documentos?idDocumento={documento_id}"
    respuesta = requests.get(url)
    if respuesta.status_code == 200:
        ruta_relativa = os.path.join("documentos", nombre)
        ruta_absoluta = os.path.abspath(ruta_relativa)
        os.makedirs(os.path.dirname(ruta_absoluta), exist_ok=True)
        with open(ruta_absoluta, "wb") as f:
            f.write(respuesta.content)
        return ruta_absoluta
    return None

def mostrar_resumen_json(convocatoria): #es una funcion que hice para que al hacer clic sobre una convocatoria, se muestre un resumen pequeño de la convocatoria, antes de dar la opción a ver mas detalles . (Solo para demo de streamlit)
    resumen = []
    resumen.append(f"**Presupuesto total:** {convocatoria.get('presupuestoTotal', 'N/D')} €")
    resumen.append(f"**Fechas:** del {convocatoria.get('fechaInicioSolicitud', '¿?')} al {convocatoria.get('fechaFinSolicitud', '¿?')}")
    resumen.append(f"**Finalidad:** {convocatoria.get('descripcionFinalidad', 'No especificada')}")
    tipos = convocatoria.get("tiposBeneficiarios", [])
    if tipos:
        resumen.append(f"**Beneficiarios:** {', '.join(t.get('descripcion', '') for t in tipos)}")
    resumen.append(f"**Abierta:** {'✅ Sí' if convocatoria.get('abierto') else '❌ No'}")
    return "\n".join(resumen)
