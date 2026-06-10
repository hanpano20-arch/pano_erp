from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.modules.products.router import router as products_router
from src.modules.crm.router import router as crm_router
from src.modules.quotations.router import router as quotations_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(crm_router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(quotations_router, prefix="/api/v1/quotations", tags=["quotations"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=settings.APP_DEBUG)

