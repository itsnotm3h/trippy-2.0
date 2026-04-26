import  Users from '../../src/models/users.model';
import { setupDb, teardownDb } from '../helpers/setupDb';

process.env.NODE_ENV = 'test';

beforeAll(async () => await setupDb());
afterAll(async () => await teardownDb());
afterEach(async () => await Users.destroy({ truncate: true }));

describe('Users Model', () => {

  it('should create a user successfully', async () => {
    const user = await Users.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret123'
    });

    expect(user.userId).toBeDefined();
    expect(user.name).toBe('Alice');
  });

  it('should fail if email is missing', async () => {
    await expect(
      Users.create({ name: 'Bob' })
    ).rejects.toThrow();
  });

  it('should not allow duplicate emails', async () => {
    await Users.create({ name: 'Alice', email: 'alice@example.com' });

    await expect(
      Users.create({ name: 'Alice2', email: 'alice@example.com' })
    ).rejects.toThrow();
  });

});