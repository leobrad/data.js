import Users from '~/class/table/Users';
import global from '~/obj/global';

global.user.tb = new Users();

async function main() {
  let users = await global.user.tb.select([3, 9], ['id', 'name', 'age']);
  users = await global.user.tb.select([2, 7], ['name', 'age', 'gender']);
  users = await global.user.tb.select([10, 13], ['gender', 'city', 'country']);
  users = await global.user.tb.select([10, 13], ['gender', 'city', 'country']);
  console.log('-----');
  users = await global.user.tb.select([5, 9], ['id', 'name']);
  console.log(users);
}
main();
