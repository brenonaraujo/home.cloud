# Papers

Fontes. O que extraímos está em [FOUNDATIONS.md](../FOUNDATIONS.md). Links públicos da AWS.

## Núcleo

1. [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — seis pilares; conversa, não auditoria.
2. [Reliability pillar — Foundations](https://docs.aws.amazon.com/wellarchitected/latest/framework/a-foundations.html) — quotas e topologia *antes* do workload.
3. [REL11-BP04 Rely on the data plane and not the control plane during recovery](https://docs.aws.amazon.com/wellarchitected/2022-03-31/framework/rel_withstand_component_failures_avoid_control_plane.html)
4. [Control planes and data planes (Fault Isolation Boundaries)](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/control-planes-and-data-planes.html)
5. [Static stability using Availability Zones (Amazon Builders’ Library)](https://aws.amazon.com/builders-library/static-stability-using-availability-zones/)
6. [Organizing Your AWS Environment Using Multiple Accounts](https://docs.aws.amazon.com/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.html)
7. [AWS Security Reference Architecture](https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/welcome.html) / Control Tower — landing zone, OUs fundacionais.
8. [Operational Excellence pillar](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html)

## PDFs (mesma família)

- [Well-Architected Framework PDF](https://docs.aws.amazon.com/pdfs/wellarchitected/latest/framework/wellarchitected-framework.pdf)
- [Reliability pillar PDF](https://docs.aws.amazon.com/pdfs/wellarchitected/latest/reliability-pillar/wellarchitected-reliability-pillar.pdf)
- [Fault Isolation Boundaries PDF](https://docs.aws.amazon.com/pdfs/whitepapers/latest/aws-fault-isolation-boundaries/aws-fault-isolation-boundaries.pdf)
- [Organizing your environment PDF](https://docs.aws.amazon.com/pdfs/whitepapers/latest/organizing-your-aws-environment/organizing-your-aws-environment.pdf)

## Como usar num clone

Não precisa da conta Brenon. Precisa concordar:

1. Control ≠ data.
2. Fundação ≠ workload.
3. Empresa (blog) ≠ console.
4. Recuperação não cria recurso novo como primeiro passo.

O hardware é ilustração. O corte é o produto deste git.
