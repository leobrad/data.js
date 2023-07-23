import Users from '~/class/table/Users';
import global from '~/obj/global';

global.user.tb = new Users();

async function main() {
  let users = await global.user.tb.select([3, 9], ['id', 'name', 'age']);
  console.log(users);
  console.log('-----');
  users = await global.user.tb.select([2, 7], ['name', 'age', 'gender']);
  console.log(users);
  //users = await global.user.tb.select([10, 13], ['gender', 'city', 'country']);
}
main();
