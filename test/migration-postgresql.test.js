import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/PostgresqlUsers';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users migration postgresql test case;', () => {
  test('insert arbitrarliy records;', async () => {
    const global_user_tb = global.user.tb;
    await global_user_tb.insert([
      { id: 15, name: 'royal', age: 34, gender: 1, city: 'athens', country: 'america', },
      { id: 16, name: 'silas', age: 58, gender: 0, city: 'marion', country: 'america', },
      { id: 17, name: 'eloise', age: 38, gender: 0, city: 'prichard', country: 'america', },
      { id: 18, name: 'oscar', age: 59, gender: 0, city: 'sylacauga', country: 'america', },
      { id: 19, name: 'eleanor', age: 83, gender: 0, city: 'tuscaloosa', country: 'america', },
    ]);
    const users = await global_user_tb.select([15, 19]);
    expect(JSON.stringify(users)).toMatch('[{\"id\":\"15\",\"name\":\"royal\",\"age\":34,\"gender\":1,\"city\":\"athens\",\"country\":\"america\"},{\"id\":\"16\",\"name\":\"silas\",\"age\":58,\"gender\":0,\"city\":\"marion\",\"country\":\"america\"},{\"id\":\"17\",\"name\":\"eloise\",\"age\":38,\"gender\":0,\"city\":\"prichard\",\"country\":\"america\"},{\"id\":\"18\",\"name\":\"oscar\",\"age\":59,\"gender\":0,\"city\":\"sylacauga\",\"country\":\"america\"},{\"id\":\"19\",\"name\":\"eleanor\",\"age\":83,\"gender\":0,\"city\":\"tuscaloosa\",\"country\":\"america\"}]');
  });
  test('update arbitrarliy record;', async () => {
    const global_user_tb = global.user.tb;
    await global_user_tb.update({ id: 16, age: 18, });
    const users = await global_user_tb.select([16, 16]);
    expect(JSON.stringify(users)).toMatch('[{\"id\":16,\"name\":\"silas\",\"age\":18,\"gender\":0,\"city\":\"marion\",\"country\":\"america\"}]');
  });
  test('delete arbitrarliy record;', async () => {
    const global_user_tb = global.user.tb;
    await global_user_tb.delete(19);
    const users = await global_user_tb.select([19, 19]);
    expect(JSON.stringify(users)).toMatch('[]');
  });
  test('delete exchange arbitrarliy record;', async () => {
    const global_user_tb = global.user.tb;
    await global_user_tb.deleteExchange(15, 19);
    const users = await global_user_tb.select([18, 18]);
    expect(JSON.stringify(users)).toMatch('[]');
  });
});

afterAll(async () => {
  const global_user_tb = global.user.tb;
  await global_user_tb.deleteExchange(16, 18);
  await global_user_tb.deleteExchange(17, 17);
  await global_user_tb.deleteExchange(18, 16);
});
