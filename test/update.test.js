import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users update test case;', () => {
  test('update first arbitrarliy records;', async () => {
    await global.user.tb.update({ id: 14, name: 'update', });
    const users = await global.user.tb.select([13, 13]);
    expect(JSON.stringify(users)).toMatch('[{\"id\":14,\"name\":\"update\",\"age\":24,\"gender\":1,\"city\":\"irvine\",\"country\":\"america\"}]');
  });
});

afterAll(async () => {
  await global.user.tb.update({ id: 14, name: 'particia', });
});
