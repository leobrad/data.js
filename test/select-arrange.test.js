import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users select arrange test case;', () => {
  test('select first arbitrarliy records;', async () => {
    const users = await global.user.tb.select([5, 7], ['age', 'gender', 'city']);
    expect(JSON.stringify(users)).toMatch('[{\"age\":33,\"gender\":1,\"city\":\"helena\"},{\"age\":53,\"gender\":1,\"city\":\"morrilton\"},{\"age\":23,\"gender\":1,\"city\":\"arcadia\"}]');
  });
  test('select first column duplicate records;', async () => {
    const users = await global.user.tb.select([2, 10], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"thomas\",\"age\":23},{\"name\":\"david\",\"age\":32},{\"name\":\"joseph\",\"age\":23},{\"age\":33,\"gender\":1,\"city\":\"helena\",\"name\":\"william\"},{\"age\":53,\"gender\":1,\"city\":\"morrilton\",\"name\":\"michael\"},{\"age\":23,\"gender\":1,\"city\":\"arcadia\",\"name\":\"george\"},{\"name\":\"alexander\",\"age\":25},{\"name\":\"john\",\"age\":25},{\"name\":\"taylor\",\"age\":23}]');
  });
  test('select second arrange column duplicate records;', async () => {
    const users = await global.user.tb.select([9, 12], ['gender', 'city', 'country'], true);
    expect(JSON.stringify(users)).toMatch('[{\"gender\":1,\"city\":\"eureka\",\"country\":\"america\"},{\"gender\":0,\"city\":\"fairfield\",\"country\":\"america\"},{\"gender\":0,\"city\":\"fremont\",\"country\":\"america\"},{\"gender\":0,\"city\":\"fullerton\",\"country\":\"america\"}]');
  });
});
