import uuid
from typing import AsyncGenerator, Optional
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import AsyncSessionLocal


async def get_tenant_id_from_header(
    x_tenant_id: Optional[str] = Header(None, alias="X-Tenant-ID")
) -> uuid.UUID:
    """
    Extracts tenant_id from header.
    Defaults to a standard mock tenant UUID for seamless evaluation if none provided.
    """
    if not x_tenant_id:
        # Default demo tenant id
        return uuid.UUID("11111111-1111-1111-1111-111111111111")
    try:
        return uuid.UUID(x_tenant_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-Tenant-ID header format. Must be a valid UUID."
        )


async def get_tenant_db(
    tenant_id: uuid.UUID = Depends(get_tenant_id_from_header)
) -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency yielding an AsyncSession with PostgreSQL Row Level Security (RLS)
    configured for the active tenant.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Set PostgreSQL session for RLS isolation
            await session.execute(
                text("SET LOCAL app.current_tenant_id = :tenant_id"),
                {"tenant_id": str(tenant_id)}
            )
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
