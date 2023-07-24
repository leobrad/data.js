import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users select column test case;', () => {
  test('select first arbitrarliy records;', async () => {
    const users = await global.user.tb.select([3, 9], ['id', 'name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"id\":4,\"name\":\"david\",\"age\":32},{\"id\":5,\"name\":\"joseph\",\"age\":23},{\"id\":6,\"name\":\"william\",\"age\":33},{\"id\":7,\"name\":\"michael\",\"age\":53},{\"id\":8,\"name\":\"george\",\"age\":23},{\"id\":9,\"name\":\"alexander\",\"age\":25},{\"id\":10,\"name\":\"john\",\"age\":25}]');
  });
  test('select first column duplicate records;', async () => {
    const users = await global.user.tb.select([2, 7], ['name', 'age', 'gender']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"thomas\",\"age\":23,\"gender\":1},{\"id\":4,\"name\":\"david\",\"age\":32,\"gender\":1},{\"id\":5,\"name\":\"joseph\",\"age\":23,\"gender\":1},{\"id\":6,\"name\":\"william\",\"age\":33,\"gender\":1},{\"id\":7,\"name\":\"michael\",\"age\":53,\"gender\":1},{\"id\":8,\"name\":\"george\",\"age\":23,\"gender\":1}]');
  });
  test('select second column duplicate records;', async () => {
    const users = await global.user.tb.select([10, 13], ['gender', 'city', 'country']);
    expect(JSON.stringify(users)).toMatch('[{\"gender\":0,\"city\":\"fairfield\",\"country\":\"america\"},{\"gender\":0,\"city\":\"fremont\",\"country\":\"america\"},{\"gender\":0,\"city\":\"fullerton\",\"country\":\"america\"},{\"gender\":1,\"city\":\"irvine\",\"country\":\"america\"}]');
  });
});