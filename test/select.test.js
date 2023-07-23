import { describe, expect, test, } from '@jest/globals';
import Users from '~/class/table/Users';
import global from '~/obj/global';

beforeAll(() => {
  global.user.tb = new Users();
});

describe('[class] Users select row test case;', () => {
  test('select first arbitrarliy records;', async () => {
    const users = await global.user.tb.select([0, 2], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"james\",\"age\":21},{\"name\":\"ovlier\",\"age\":22},{\"name\":\"thomas\",\"age\":23}]');
  });
  test('select second arbitrarliy records;', async () => {
    const users = await global.user.tb.select([4 , 5], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"joseph\",\"age\":23},{\"name\":\"william\",\"age\":33}]');
  });
  test('select third arbitrarliy records;', async () => {
    const users = await global.user.tb.select([7 , 10], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"george\",\"age\":23},{\"name\":\"alexander\",\"age\":25},{\"name\":\"john\",\"age\":25},{\"name\":\"taylor\",\"age\":23}]');
  });
  test('select arbitrarliy interspersed records;', async () => {
    const users = await global.user.tb.select([1 , 6], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"ovlier\",\"age\":22},{\"name\":\"thomas\",\"age\":23},{\"name\":\"david\",\"age\":32},{\"name\":\"joseph\",\"age\":23},{\"name\":\"william\",\"age\":33},{\"name\":\"michael\",\"age\":53}]');
  });
  test('select four arbitarliy records;', async () => {
    const users = await global.user.tb.select([6, 12], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"michael\",\"age\":53},{\"name\":\"george\",\"age\":23},{\"name\":\"alexander\",\"age\":25},{\"name\":\"john\",\"age\":25},{\"name\":\"taylor\",\"age\":23},{\"name\":\"emily\",\"age\":23},{\"name\":\"emma\",\"age\":23}]');
  });
  test('select five arbitarliy records;', async () => {
    const users = await global.user.tb.select([4, 7], ['name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"joseph\",\"age\":23},{\"name\":\"william\",\"age\":33},{\"name\":\"michael\",\"age\":53},{\"name\":\"george\",\"age\":23}]');
  });
});

describe('[class] Users select column test case;', () => {
  test('select first arbitrarliy records;', async () => {
    const users = await global.user.tb.select([3, 9], ['id', 'name', 'age']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"david\",\"age\":32,\"id\":4},{\"name\":\"joseph\",\"age\":23,\"id\":5},{\"name\":\"william\",\"age\":33,\"id\":6},{\"name\":\"michael\",\"age\":53,\"id\":7},{\"name\":\"george\",\"age\":23,\"id\":8},{\"name\":\"alexander\",\"age\":25,\"id\":9},{\"name\":\"john\",\"age\":25,\"id\":10}]');
  });
  test('select first column duplicate records;', async () => {
    const users = await global.user.tb.select([2, 7], ['name', 'age', 'gender']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"thomas\",\"age\":23,\"gender\":1},{\"name\":\"david\",\"age\":32,\"id\":4,\"gender\":1},{\"name\":\"joseph\",\"age\":23,\"id\":5,\"gender\":1},{\"name\":\"william\",\"age\":33,\"id\":6,\"gender\":1},{\"name\":\"michael\",\"age\":53,\"id\":7,\"gender\":1},{\"name\":\"george\",\"age\":23,\"id\":8,\"gender\":1}]');
  });
  test('select second column duplicate records;', async () => {
    const users = await global.user.tb.select([10, 13], ['gender', 'city', 'country']);
    expect(JSON.stringify(users)).toMatch('[{\"name\":\"taylor\",\"age\":23,\"gender\":0,\"city\":\"fairfield\",\"country\":\"america\"},{\"name\":\"emily\",\"age\":23,\"gender\":0,\"city\":\"fremont\",\"country\":\"america\"},{\"name\":\"emma\",\"age\":23,\"gender\":0,\"city\":\"fullerton\",\"country\":\"america\"},{\"gender\":1,\"city\":\"irvine\",\"country\":\"america\"}]');
  });
});
