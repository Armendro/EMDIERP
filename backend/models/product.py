from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Modelo de atributo de variante (ex: Tamanho, Cor)
class VariantAttribute(BaseModel):
    name: str  # ex: "Tamanho", "Cor"
    value: str  # ex: "140x190", "Bege"

# Modelo de faixa de preço
class PriceTier(BaseModel):
    name: str  # ex: "normal", "site", "promo"
    price: float = Field(ge=0)
    commission_percent: float = Field(ge=0, le=100)  # Percentual de comissão

# Modelo de variante do produto
class ProductVariant(BaseModel):
    variant_id: Optional[str] = None  # Gerado automaticamente
    name: Optional[str] = None  # Nome descritivo (ex: "140x190 - Bege")
    attributes: List[VariantAttribute] = []  # Lista de atributos
    price_tiers: List[PriceTier] = []  # Lista de faixas de preço
    stock: int = Field(ge=0, default=0)  # Estoque específico da variante

class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    family: Optional[str] = None  # Família do produto
    sub_family: Optional[str] = None  # Subfamília
    description: Optional[str] = None
    supplier: Optional[str] = None
    status: str = "active"  # "active" ou "inactive"
    
    # Campos legados (para compatibilidade com produtos sem variantes)
    price: Optional[float] = Field(default=None, ge=0)
    cost: Optional[float] = Field(default=None, ge=0)
    stock: Optional[int] = Field(default=None, ge=0)
    reorder_level: Optional[int] = Field(default=10, ge=0)
    
    # Variantes do produto
    variants: List[ProductVariant] = []

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    family: Optional[str] = None
    sub_family: Optional[str] = None
    description: Optional[str] = None
    supplier: Optional[str] = None
    status: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    cost: Optional[float] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=0)
    variants: Optional[List[ProductVariant]] = None

class ProductInDB(ProductBase):
    id: str = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class ProductResponse(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime