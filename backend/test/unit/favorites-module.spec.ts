import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserRepository } from '../../src/infrastructure/database/in-memory/in-memory-user.repository.js';
import { GetUserFavoritesUseCase } from '../../src/application/use-cases/user/get-user-favorites.use-case.js';
import { AddUserFavoriteUseCase } from '../../src/application/use-cases/user/add-user-favorite.use-case.js';
import { RemoveUserFavoriteUseCase } from '../../src/application/use-cases/user/remove-user-favorite.use-case.js';
import { ToggleUserFavoriteUseCase } from '../../src/application/use-cases/user/toggle-user-favorite.use-case.js';
import { CheckUserFavoriteUseCase } from '../../src/application/use-cases/user/check-user-favorite.use-case.js';
import { FavoritesController } from '../../src/presentation/controllers/favorites.controller.js';
import { User } from '../../src/domain/entities/user.entity.js';
import { PhoneNumber } from '../../src/domain/value-objects/phone-number.vo.js';

describe('Favorites / Wishlist Module', () => {
  let userRepo: InMemoryUserRepository;
  let getFavoritesUseCase: GetUserFavoritesUseCase;
  let addFavoriteUseCase: AddUserFavoriteUseCase;
  let removeFavoriteUseCase: RemoveUserFavoriteUseCase;
  let toggleFavoriteUseCase: ToggleUserFavoriteUseCase;
  let checkFavoriteUseCase: CheckUserFavoriteUseCase;
  let controller: FavoritesController;

  const mockUserId = 'user-123';
  const mockProductId = 'prod-cisco-2960';

  beforeEach(async () => {
    userRepo = new InMemoryUserRepository();
    await userRepo.save(
      new User({
        id: mockUserId,
        name: 'کاربر تستی',
        phone: PhoneNumber.create('09121111111'),
        phoneVerifiedAt: new Date(),
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    getFavoritesUseCase = new GetUserFavoritesUseCase(userRepo);
    addFavoriteUseCase = new AddUserFavoriteUseCase(userRepo);
    removeFavoriteUseCase = new RemoveUserFavoriteUseCase(userRepo);
    toggleFavoriteUseCase = new ToggleUserFavoriteUseCase(userRepo);
    checkFavoriteUseCase = new CheckUserFavoriteUseCase(userRepo);

    controller = new FavoritesController(
      getFavoritesUseCase,
      addFavoriteUseCase,
      removeFavoriteUseCase,
      toggleFavoriteUseCase,
      checkFavoriteUseCase,
    );
  });

  it('starts with an empty favorites list for the user', async () => {
    const list = await getFavoritesUseCase.execute(mockUserId);
    expect(list).toEqual([]);
    const check = await checkFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(check).toBe(false);
  });

  it('adds a product to user favorites successfully', async () => {
    const fav = await addFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(fav).toBeDefined();
    expect(fav.productId).toBe(mockProductId);

    const list = await getFavoritesUseCase.execute(mockUserId);
    expect(list.length).toBe(1);
    expect(list[0].productId).toBe(mockProductId);

    const check = await checkFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(check).toBe(true);
  });

  it('toggles product favorite status correctly', async () => {
    // 1. Toggle ON
    const result1 = await toggleFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(result1.isFavorited).toBe(true);
    expect(result1.item?.productId).toBe(mockProductId);

    // 2. Check status
    let check = await checkFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(check).toBe(true);

    // 3. Toggle OFF
    const result2 = await toggleFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(result2.isFavorited).toBe(false);

    // 4. Check status again
    check = await checkFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(check).toBe(false);
  });

  it('removes product from favorites successfully', async () => {
    await addFavoriteUseCase.execute(mockUserId, mockProductId);
    const removed = await removeFavoriteUseCase.execute(mockUserId, mockProductId);
    expect(removed).toBe(true);

    const list = await getFavoritesUseCase.execute(mockUserId);
    expect(list.length).toBe(0);
  });

  it('works via FavoritesController endpoints with authenticated request', async () => {
    const mockReq = { user: { sub: mockUserId } };

    // Add via controller
    const added = await controller.addFavorite(mockReq, mockProductId);
    expect(added.productId).toBe(mockProductId);
    expect(added.title).toBeDefined();
    expect(added.product).toBeDefined();
    expect(added.product.id).toBe(mockProductId);

    // Get list via controller
    const list = await controller.getMyFavorites(mockReq);
    expect(list.length).toBe(1);
    expect(list[0].productId).toBe(mockProductId);

    // Check status via controller
    const status = await controller.checkFavorite(mockReq, mockProductId);
    expect(status.isFavorited).toBe(true);

    // Toggle off via controller
    const toggled = await controller.toggleFavorite(mockReq, mockProductId);
    expect(toggled.isFavorited).toBe(false);

    // Verify empty list
    const emptyList = await controller.getMyFavorites(mockReq);
    expect(emptyList.length).toBe(0);
  });
});
