import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryCategoryRepository } from '../../src/infrastructure/database/in-memory/in-memory-category.repository.js';
import { CreateCategoryUseCase } from '../../src/application/use-cases/category/create-category.use-case.js';
import { GetCategoriesUseCase } from '../../src/application/use-cases/category/get-categories.use-case.js';
import { GetCategoryByIdUseCase } from '../../src/application/use-cases/category/get-category-by-id.use-case.js';
import { UpdateCategoryUseCase } from '../../src/application/use-cases/category/update-category.use-case.js';
import { DeleteCategoryUseCase } from '../../src/application/use-cases/category/delete-category.use-case.js';
import {
  CategoryNotFoundException,
  DuplicateCategorySlugException,
} from '../../src/domain/exceptions/category.exceptions.js';

describe('Categories Module Unit Tests', () => {
  let repository: InMemoryCategoryRepository;
  let createCategoryUseCase: CreateCategoryUseCase;
  let getCategoriesUseCase: GetCategoriesUseCase;
  let getCategoryByIdUseCase: GetCategoryByIdUseCase;
  let updateCategoryUseCase: UpdateCategoryUseCase;
  let deleteCategoryUseCase: DeleteCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    createCategoryUseCase = new CreateCategoryUseCase(repository);
    getCategoriesUseCase = new GetCategoriesUseCase(repository);
    getCategoryByIdUseCase = new GetCategoryByIdUseCase(repository);
    updateCategoryUseCase = new UpdateCategoryUseCase(repository);
    deleteCategoryUseCase = new DeleteCategoryUseCase(repository);
  });

  it('should seed default 8 network equipment categories', async () => {
    const list = await getCategoriesUseCase.execute();
    expect(list.length).toBe(8);

    const slugs = list.map((c) => c.slug);
    expect(slugs).toContain('switches');
    expect(slugs).toContain('routers');
    expect(slugs).toContain('wireless');
    expect(slugs).toContain('fiber');
    expect(slugs).toContain('cables');
    expect(slugs).toContain('passive');
    expect(slugs).toContain('security_firewall');
    expect(slugs).toContain('accessories');
  });

  it('should create a new category with custom slug and Persian name', async () => {
    const created = await createCategoryUseCase.execute({
      shortName: 'تجهیزات ویپ و تلفن سانترال',
      longName: 'گوشی‌های تلفن تحت شبکه VoIP و مرکز تلفن IP-PBX گرنداستریم و یالینک',
      slug: 'voip-phones',
      icon: 'Headphones',
      badge: 'جدید',
      sortOrder: 9,
    });

    expect(created.id).toBeDefined();
    expect(created.shortName).toBe('تجهیزات ویپ و تلفن سانترال');
    expect(created.slug).toBe('voip-phones');
    expect(created.icon).toBe('Headphones');
    expect(created.sortOrder).toBe(9);
    expect(created.isActive).toBe(true);

    const retrieved = await getCategoryByIdUseCase.execute('voip-phones');
    expect(retrieved.id).toBe(created.id);
  });

  it('should reject creating category with duplicate slug', async () => {
    await expect(
      createCategoryUseCase.execute({
        shortName: 'سوئیچ دیگر',
        slug: 'switches', // duplicate
      }),
    ).rejects.toThrow(DuplicateCategorySlugException);
  });

  it('should filter categories by search keyword in shortName or slug', async () => {
    const searchSwitches = await getCategoriesUseCase.execute({ search: 'سوئیچ' });
    expect(searchSwitches.length).toBeGreaterThanOrEqual(1);
    expect(searchSwitches[0].slug).toBe('switches');

    const searchRouters = await getCategoriesUseCase.execute({ search: 'routers' });
    expect(searchRouters.length).toBe(1);
    expect(searchRouters[0].shortName).toContain('روتر');
  });

  it('should update an existing category details', async () => {
    const updated = await updateCategoryUseCase.execute({
      id: 'cat-switches',
      shortName: 'سوئیچ‌های شبکه سیسکو و انترپرایز',
      badge: 'پرفروش‌ترین',
      sortOrder: 0,
    });

    expect(updated.shortName).toBe('سوئیچ‌های شبکه سیسکو و انترپرایز');
    expect(updated.badge).toBe('پرفروش‌ترین');
    expect(updated.sortOrder).toBe(0);

    const reloaded = await getCategoryByIdUseCase.execute('cat-switches');
    expect(reloaded.shortName).toBe('سوئیچ‌های شبکه سیسکو و انترپرایز');
  });

  it('should throw CategoryNotFoundException when updating or deleting unknown id', async () => {
    await expect(
      updateCategoryUseCase.execute({
        id: 'cat-unknown-999',
        shortName: 'تست',
      }),
    ).rejects.toThrow(CategoryNotFoundException);

    await expect(deleteCategoryUseCase.execute('cat-unknown-999')).rejects.toThrow(
      CategoryNotFoundException,
    );
  });

  it('should delete a category without connected products', async () => {
    const created = await createCategoryUseCase.execute({
      shortName: 'دسته تستی موقت',
      slug: 'temp-test-cat',
    });

    const deleted = await deleteCategoryUseCase.execute(created.id);
    expect(deleted).toBe(true);

    await expect(getCategoryByIdUseCase.execute(created.id)).rejects.toThrow(
      CategoryNotFoundException,
    );
  });
});
