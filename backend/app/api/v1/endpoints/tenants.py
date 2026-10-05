import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db, AsyncSessionLocal
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.area import Area, AgentArea, TicketCategory
from app.core.security import get_password_hash

router = APIRouter()


class TenantCreate(BaseModel):
    name: str
    slug: str


class SeedResponse(BaseModel):
    status: str
    tenant_id: uuid.UUID
    tenant_name: str
    areas_created: List[str]
    agents_created: List[str]


@router.post("/seed-demo", response_model=SeedResponse, status_code=status.HTTP_201_CREATED)
async def seed_demo_tenant(db: AsyncSession = Depends(get_db)):
    """
    Seeds a full demonstration tenant with pre-configured departments,
    ticket categories with SLAs, and dedicated L2 agents for testing.
    """
    demo_tenant_id = uuid.UUID("11111111-1111-1111-1111-111111111111")

    # Check if exists
    res = await db.execute(select(Tenant).where(Tenant.id == demo_tenant_id))
    tenant = res.scalar_one_or_none()

    if not tenant:
        tenant = Tenant(
            id=demo_tenant_id,
            name="Acme Global Enterprise",
            slug="acme-global",
            config={"tier": "enterprise", "features": ["auto_l1", "vector_rag", "audit_log"]}
        )
        db.add(tenant)
        await db.flush()

    # Pre-defined Areas & Categories
    areas_spec = [
        {
            "id": uuid.UUID("22222222-2222-2222-2222-222222222221"),
            "name": "Technical Support",
            "desc": "L2 engineering support for APIs, SDKs, and platform bugs",
            "categories": [
                ("API Integration", "REST / Webhooks", 4),
                ("Authentication", "SAML SSO / OAuth", 8),
            ]
        },
        {
            "id": uuid.UUID("22222222-2222-2222-2222-222222222222"),
            "name": "Billing & Subscriptions",
            "desc": "Invoicing, subscription changes, and payment disputes",
            "categories": [
                ("Invoicing", "Tax Invoice PDF", 24),
                ("Subscription", "Plan Upgrade/Downgrade", 12),
            ]
        },
        {
            "id": uuid.UUID("22222222-2222-2222-2222-222222222223"),
            "name": "Security & Compliance",
            "desc": "Auditing, data protection, SOC2 reports, security alerts",
            "categories": [
                ("Compliance", "SOC2 Type II Report", 48),
                ("Access Incident", "Account Lockout", 2),
            ]
        }
    ]

    created_area_names = []
    created_agent_names = []

    for a_data in areas_spec:
        res_area = await db.execute(select(Area).where(Area.id == a_data["id"]))
        area = res_area.scalar_one_or_none()
        if not area:
            area = Area(
                id=a_data["id"],
                tenant_id=demo_tenant_id,
                name=a_data["name"],
                description=a_data["desc"]
            )
            db.add(area)
            await db.flush()
        created_area_names.append(area.name)

        # Categories
        for cat_name, sub_name, sla in a_data["categories"]:
            res_cat = await db.execute(
                select(TicketCategory).where(
                    TicketCategory.tenant_id == demo_tenant_id,
                    TicketCategory.area_id == area.id,
                    TicketCategory.category_name == cat_name
                )
            )
            if not res_cat.scalar_one_or_none():
                cat = TicketCategory(
                    id=uuid.uuid4(),
                    tenant_id=demo_tenant_id,
                    area_id=area.id,
                    category_name=cat_name,
                    subcategory_name=sub_name,
                    sla_hours=sla
                )
                db.add(cat)

    # Create L2 Specialist Agent
    agent_id = uuid.UUID("33333333-3333-3333-3333-333333333331")
    res_agent = await db.execute(select(User).where(User.id == agent_id))
    agent = res_agent.scalar_one_or_none()
    if not agent:
        agent = User(
            id=agent_id,
            tenant_id=demo_tenant_id,
            email="carlos.l2@acme-global.com",
            full_name="Carlos Mendoza (Lead L2 Tech)",
            role=UserRole.AGENT_L2,
            hashed_password=get_password_hash("password123"),
            is_active=True
        )
        db.add(agent)
        await db.flush()
        created_agent_names.append(agent.full_name)

        # Assign to Technical Support area
        tech_area_id = uuid.UUID("22222222-2222-2222-2222-222222222221")
        assignment = AgentArea(
            agent_id=agent.id,
            area_id=tech_area_id,
            tenant_id=demo_tenant_id
        )
        db.add(assignment)

    await db.commit()

    return SeedResponse(
        status="seeded",
        tenant_id=demo_tenant_id,
        tenant_name=tenant.name,
        areas_created=created_area_names,
        agents_created=created_agent_names
    )
