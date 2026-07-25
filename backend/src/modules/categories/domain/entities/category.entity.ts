export class Category {
  private constructor(
    public readonly id: number,
    public name: string,
    public slug: string,
    public description: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  static create(properties: {
    id?: number;
    name: string;
    slug: string;
    description?: string | null;
    isActive?: boolean;
  }): Category {
    const now = new Date();
    return new Category(
      properties.id ?? 0,
      properties.name.trim(),
      properties.slug.trim().toLowerCase(),
      properties.description || null,
      properties.isActive ?? true,
      now,
      now,
    );
  }

  // Para restaurar desde DB — sin validaciones, preserva fechas reales
  static reconstitute(properties: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return new Category(
      properties.id,
      properties.name,
      properties.slug,
      properties.description,
      properties.isActive,
      properties.createdAt,
      properties.updatedAt,
    );
  }

  private validate(): void {
    if (this.name.length < 3) {
      throw new Error(
        'El nombre de la categoría debe tener al menos 3 caracteres',
      );
    }

    if (!this.slug || !/^[a-z0-9-]+$/.test(this.slug)) {
      throw new Error('El slug de la categoría no tiene un formato válido.');
    }
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }
}
