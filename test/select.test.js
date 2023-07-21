import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users select test case;', () => {
  test('select first arbitrarliy records;', async () => {
    const users = await global.user.tb.select([0, 2], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"james\",\"age\":21},{\"name\":\"ovlier\",\"age\":22},{\"name\":\"thomas\",\"age\":23}]');
  });
  test('select second arbitrarliy records;', async () => {
    const users = await global.user.tb.select([4 , 5], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"joseph\",\"age\":23},{\"name\":\"william\",\"age\":33}]');
  });
});
