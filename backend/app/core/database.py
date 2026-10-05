from typing import AsyncGenerator, Optional
import uuid
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.core.config import settings

# Async Engine for FastAPI
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Base session generator without tenant context."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def tenant_session(
    tenant_id: uuid.UUID,
    is_super_admin: bool = False
) -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager that guarantees PostgreSQL Row Level Security (RLS)
    isolation by setting session settings on the connection.
    """
    async with AsyncSessionLocal() as session:
        try:
            # Set PostgreSQL session variables for RLS enforcement
            await session.execute(
                text("SET LOCAL app.current_tenant_id = :tenant_id"),
                {"tenant_id": str(tenant_id)}
            )
            await session.execute(
                text("SET LOCAL app.is_super_admin = :is_super_admin"),
                {"is_super_admin": "true" if is_super_admin else "false"}
            )
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
