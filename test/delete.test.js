import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users delete test case;', () => {
  test('delete first arbitrarliy record;', async () => {
    let users = await global.user.tb.select([14, 14]);
    expect(JSON.stringify(users)).toMatch('[{\"id\":15,\"name\":\"elizebeth\",\"age\":52,\"gender\":1,\"city\":\"lompoc\",\"country\":\"america\"}]');
    await global.user.tb.delete(15);
    users = await global.user.tb.select([14, 14]);
    expect(JSON.stringify(users)).toMatch('[]');
  });
});

afterAll(async () => {
  await global.user.tb.insert({ id: 15, name: 'elizebeth', age: 52, gender: 1, city: 'lompoc', country: 'america', });
});
