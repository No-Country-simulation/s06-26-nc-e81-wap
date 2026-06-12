# ADR-008: ISO 27001 año 1 + SOC 2 Type II año 2 como objetivo de compliance

## Status

Accepted

## Context

**Problem**: El producto es B2C puro y los usuarios no pagan. Si la monetización viene de comisión por contratación, eventualmente podemos buscar inversión o clientes enterprise (empresas que compran el servicio para sus empleados). Ambos contextos requieren demostrar madurez operativa y de seguridad.

**Constraints**:
- Producto nuevo, sin ingresos aún
- 1-2 personas en MVP
- Free tier, sin presupuesto para auditorías externas caras
- Mercado objetivo: Brasil + LATAM (pymes y grandes empresas)

**Options considered**:

1. **Sin certificaciones**, crecer orgánicamente
   - Pros: $0, foco en producto
   - Cons: cuando se quiera levantar ronda institucional o vender a empresas grandes, la objeción "no tienen compliance" es frecuente
2. **ISO 27001 año 1** (SGSI completo) + **SOC 2 Type II año 2** (controles auditados)
   - Pros: cubren los frameworks más reconocidos globalmente, abren puertas enterprise
   - Cons: ISO 27001 cuesta $20-50k USD (auditoría + implementación), SOC 2 Type II similar
3. **Solo SOC 2** (más rápido, más popular en startups SaaS)
   - Pros: más rápido de implementar
   - Cons: menos reconocido en LATAM, no cubre la gestión de seguridad integral que pide ISO
4. **LGPD compliance interno** + certificaciones después
   - Pros: alineado con mercado brasilero, gratis
   - Cons: solo cubre privacidad, no seguridad operativa

## Decision

Elegimos **Opción 2**: apuntar a **ISO 27001 año 1 + SOC 2 Type II año 2** como objetivo de compliance.

**Razonamiento**:
- ISO 27001 año 1 establece el Sistema de Gestión de Seguridad de la Información (SGSI) — la base de todo lo demás
- SOC 2 Type II año 2 demuestra controles auditados en producción, lo que piden clientes enterprise
- Ambos son reconocidos globalmente (no solo LATAM)
- Aunque no se certifiquen en MVP, **planear la arquitectura con vistas a ISO/SOC2** desde el inicio es más barato que retrofit
- El costo ($20-50k cada una) se justifica cuando se levanta ronda o se firma contrato enterprise

**Lo que se hace AHORA en MVP pensando en ISO/SOC2**:
- Logging estructurado de accesos (auditoría)
- Clasificación de datos (P0-P4) y matriz de exposición
- Política de retención documentada
- Cifrado en tránsito y reposo
- MFA para admins
- Backup y restore probados trimestralmente
- Runbooks de respuesta a incidentes
- Clasificación de incidentes y SLAs

**Lo que se hace DESPUÉS (año 1 para ISO, año 2 para SOC2)**:
- Auditoría externa
- Documentación formal de SGSI
- Pen testing
- Certificación

## Consequences

**Positive**:
- Cuando llegue el momento de vender a enterprise, la certificación está lista
- Inversión o partnerships institucionales son más fáciles con certificaciones
- Disciplina operativa desde el inicio (logging, retención, cifrado)
- Mejora continua del producto (cada auditoría encuentra cosas)

**Negative**:
- Costo significativo cuando llegue el momento de certificar
- El trabajo de documentar controles consume tiempo del equipo
- Algunas prácticas de MVP se van a tener que cambiar (ej: el script de backups que tenemos hoy no cumple ISO al 100%)
- Si la startup no levanta inversión, las certificaciones no se pagan solas

**Neutral**:
- No es obligatorio en MVP
- El "objetivo" significa que lo planeamos, no que se ejecute en año 1 sí o sí
- La decisión se revisa en 12 meses según tracción

## Superseded by

## Supersedes

---

**Keywords**: iso-27001, soc-2, compliance, certificacion, auditoria, enterprise

**Date**: 2026-06-11

**Authors**: arquitectura App BiT
