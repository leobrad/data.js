import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users composite test case;', () => {
  test('insert arbitrarliy records;', async () => {
    await global.user.tb.insert([
      { id: 16, name: 'royal', age: 34, gender: 1, city: 'athens', country: 'america', },
      { id: 17, name: 'silas', age: 58, gender: 0, city: 'marion', country: 'america', },
      { id: 18, name: 'eloise', age: 38, gender: 0, city: 'prichard', country: 'america', },
      { id: 19, name: 'oscar', age: 59, gender: 0, city: 'sylacauga', country: 'america', },
      { id: 20, name: 'eleanor', age: 83, gender: 0, city: 'tuscaloosa', country: 'america', },
    ]);
    const users = await global.user.tb.select([15, 19]);
    expect(JSON.stringify(users)).toMatch('[{\"id\":16,\"name\":\"royal\",\"age\":34,\"gender\":1,\"city\":\"athens\",\"country\":\"america\"},{\"id\":17,\"name\":\"silas\",\"age\":58,\"gender\":0,\"city\":\"marion\",\"country\":\"america\"},{\"id\":18,\"name\":\"eloise\",\"age\":38,\"gender\":0,\"city\":\"prichard\",\"country\":\"america\"},{\"id\":19,\"name\":\"oscar\",\"age\":59,\"gender\":0,\"city\":\"sylacauga\",\"country\":\"america\"},{\"id\":20,\"name\":\"eleanor\",\"age\":83,\"gender\":0,\"city\":\"tuscaloosa\",\"country\":\"america\"}]');
  });
  test('update arbitrarliy record;', async () => {
    await global.user.tb.update({ id: 17, age: 18, });
    const users = await global.user.tb.select([16, 16]);
    expect(JSON.stringify(users)).toMatch('[{\"id\":17,\"name\":\"silas\",\"age\":18,\"gender\":0,\"city\":\"marion\",\"country\":\"america\"}]');
  });
  test('delete arbitrarliy record;', async () => {
    await global.user.tb.delete(20);
    const users = await global.user.tb.select([19, 19]);
    expect(JSON.stringify(users)).toMatch('[]');
  });
  test('delete exchange arbitrarliy record;', async () => {
    await global.user.tb.deleteExchange(16, 19);
    const users = await global.user.tb.select([19, 19]);
    expect(JSON.stringify(users)).toMatch('[]');
  });
});

afterAll(async () => {
  await global.user.tb.deleteExchange(17, 18);
  await global.user.tb.deleteExchange(18, 17);
  await global.user.tb.deleteExchange(19, 16);
});
